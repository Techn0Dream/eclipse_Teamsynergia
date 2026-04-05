"""
logger.py — Structured logger with rotating file handler.

Import `get_logger` from this module and call it once per file:

    from logger import get_logger
    logger = get_logger(__name__)

Logs go to both the console (stdout) and a rotating file under logs/.
The log level and file path are controlled via config.py / .env.
"""

import logging
import os
from logging.handlers import RotatingFileHandler

import config

# ── Ensure log directory exists ───────────────────────────────────────────────
os.makedirs(os.path.dirname(config.LOG_FILE), exist_ok=True)

# ── Shared formatter ──────────────────────────────────────────────────────────
_formatter = logging.Formatter(
    fmt="%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# ── Console handler ───────────────────────────────────────────────────────────
_console_handler = logging.StreamHandler()
_console_handler.setFormatter(_formatter)

# ── Rotating file handler (5 MB per file, keep 5 backups) ────────────────────
_file_handler = RotatingFileHandler(
    config.LOG_FILE,
    maxBytes=5 * 1024 * 1024,
    backupCount=5,
    encoding="utf-8",
)
_file_handler.setFormatter(_formatter)

# ── Root logger configuration ─────────────────────────────────────────────────
logging.basicConfig(
    level=config.LOG_LEVEL,
    handlers=[_console_handler, _file_handler],
)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger pre-configured with the project's handlers."""
    return logging.getLogger(name)
