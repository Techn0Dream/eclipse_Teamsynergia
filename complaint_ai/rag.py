"""
rag.py — Retrieval-Augmented Generation engine using FAISS.

Architecture:
  RAGEngine loads complaint narratives from a CSV, encodes them with a
  Sentence-Transformer model, and indexes them in FAISS using cosine similarity.
  At query time it performs a hybrid search: vector similarity + keyword overlap,
  then combines both scores for a more relevant final ranking.

Scaling note (swap FAISS → Pinecone — only 3 lines to change):
  1. Replace `faiss.IndexFlatIP(dim)` with a `pinecone.Index` client.
  2. Replace `index.add(vectors)` with `index.upsert([(id, vec, meta)])`.
  3. Replace `index.search(vec, k)` with `index.query(vector=vec, top_k=k)`.
  Everything above this module (agent, llm, api) stays unchanged.
"""

import re
from typing import List, Optional, Tuple

import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

import config
from logger import get_logger

logger = get_logger(__name__)


# ── Text Utilities ─────────────────────────────────────────────────────────────

def clean_text(text: str, max_chars: int = 300) -> str:
    """
    Normalize complaint text for consistent embedding.
    - Lower-cases, collapses whitespace/newlines.
    - Truncates to `max_chars` to stay within the model's effective context.
    """
    text = str(text).lower()
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_chars]


def keyword_overlap_score(query: str, document: str) -> float:
    """
    Compute word-overlap ratio (query coverage) as a lightweight keyword signal.
    Used alongside cosine similarity in the hybrid re-ranking step.
    Returns a float in [0.0, 1.0].
    """
    query_words = set(query.split())
    doc_words = set(document.split())
    if not query_words:
        return 0.0
    return len(query_words & doc_words) / len(query_words)


# ── RAG Engine ─────────────────────────────────────────────────────────────────

class RAGEngine:
    """
    Encapsulates the FAISS index, the embedding model, and retrieval logic.

    Keeping state in a class (vs. module-level globals) makes this
    unit-testable and isolates the index so it can be replaced without
    touching any other module.
    """

    def __init__(self) -> None:
        logger.info("Initializing RAG engine…")

        # Load embedding model once — this is the expensive step at startup
        self._model = SentenceTransformer(config.EMBEDDING_MODEL)

        # Load and clean corpus from CSV
        self._texts, self._products = self._load_corpus()

        # Build FAISS index (cosine similarity via L2-normalized inner-product)
        self._index = self._build_index()

        logger.info(
            "RAG engine ready. Corpus size: %d | FAISS dimension: %d",
            len(self._texts),
            self._index.d,
        )

    # ── Data loading ──────────────────────────────────────────────────────────

    def _load_corpus(self) -> Tuple[List[str], List[str]]:
        """Load, clean, and return complaint narratives and product labels from CSV."""
        logger.info(
            "Loading corpus from '%s' (limit=%d rows)…",
            config.RAG_CSV_PATH,
            config.RAG_SAMPLE_LIMIT,
        )
        df = pd.read_csv(config.RAG_CSV_PATH, nrows=config.RAG_SAMPLE_LIMIT)
        df = df.dropna(subset=["narrative"])

        texts = [clean_text(t) for t in df["narrative"].tolist()]

        # Use the `product` column as category context if available
        products = (
            df["product"].fillna("unknown").tolist()
            if "product" in df.columns
            else ["unknown"] * len(texts)
        )

        logger.info("Corpus loaded: %d usable documents.", len(texts))
        return texts, products

    # ── Index construction ────────────────────────────────────────────────────

    def _build_index(self) -> faiss.Index:
        """
        Encode corpus and build a FAISS IndexFlatIP (inner-product) index.
        Vectors are L2-normalized before indexing so inner-product == cosine similarity.
        This gives semantically meaningful distance for complaint retrieval.
        """
        logger.info("Encoding corpus — this may take a moment on first run…")
        embeddings = self._model.encode(
            self._texts,
            batch_size=64,
            show_progress_bar=True,
            normalize_embeddings=True,  # Required for cosine similarity via IP
        )
        embeddings = np.array(embeddings, dtype="float32")

        index = faiss.IndexFlatIP(embeddings.shape[1])
        index.add(embeddings)
        return index

    # ── Retrieval ─────────────────────────────────────────────────────────────

    def retrieve(self, query: str, k: Optional[int] = None) -> List[str]:
        """
        Hybrid retrieval: vector cosine search + keyword overlap re-ranking.

        Steps:
          1. Encode and normalize the query.
          2. Over-fetch (k×3) candidates from FAISS for re-ranking headroom.
          3. Re-rank by: 0.7 × cosine_score + 0.3 × keyword_overlap.
          4. Return top-k as formatted context strings for the LLM prompt.
        """
        top_k = k or config.RAG_TOP_K
        query_clean = clean_text(query)

        # Step 1 — Encode and normalize query
        query_vec = self._model.encode(
            [query_clean], normalize_embeddings=True
        ).astype("float32")

        # Step 2 — Over-fetch candidates from FAISS
        fetch_k = min(top_k * 3, len(self._texts))
        scores, indices = self._index.search(query_vec, fetch_k)

        # Step 3 — Hybrid re-rank
        candidates: List[Tuple[float, int]] = []
        for cosine_score, idx in zip(scores[0], indices[0]):
            if idx < 0:  # FAISS returns -1 when results < fetch_k
                continue
            kw_score = keyword_overlap_score(query_clean, self._texts[idx])
            combined = 0.7 * float(cosine_score) + 0.3 * kw_score
            candidates.append((combined, idx))

        candidates.sort(key=lambda x: x[0], reverse=True)

        # Step 4 — Format as context strings for the LLM
        results = [
            f"[Product: {self._products[idx]}] {self._texts[idx]}"
            for _, idx in candidates[:top_k]
        ]

        logger.debug(
            "Retrieved %d context chunks for query: '%.60s…'",
            len(results),
            query,
        )
        return results

    # ── Dynamic learning ──────────────────────────────────────────────────────

    def add_document(self, text: str) -> None:
        """
        Dynamically add a processed complaint to the live FAISS index.
        This powers the continuous-learning loop without requiring a server restart.

        Production note: For persistence across restarts, call
          `faiss.write_index(self._index, "complaint_index.faiss")`
        after this method and load it on startup.
        """
        cleaned = clean_text(text)
        vec = self._model.encode([cleaned], normalize_embeddings=True).astype("float32")
        self._index.add(vec)
        self._texts.append(cleaned)
        self._products.append("unknown")
        logger.info(
            "Document added to live FAISS index. New corpus size: %d",
            len(self._texts),
        )


# ── Module-level singleton ─────────────────────────────────────────────────────
# The engine is instantiated once on first use (lazy initialization).
# This avoids re-encoding the full corpus if only config is imported.

_engine: Optional[RAGEngine] = None


def _get_engine() -> RAGEngine:
    global _engine
    if _engine is None:
        _engine = RAGEngine()
    return _engine


# ── Public API ────────────────────────────────────────────────────────────────

def retrieve_context(query: str, k: Optional[int] = None) -> List[str]:
    """Retrieve the top-k most relevant complaint narratives for a given query."""
    return _get_engine().retrieve(query, k)


def add_to_vector_db(text: str) -> None:
    """Add a new complaint to the live FAISS index (dynamic learning loop)."""
    _get_engine().add_document(text)