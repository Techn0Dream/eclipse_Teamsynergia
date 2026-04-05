from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.complaint import router as complaint_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="AI Banking Intelligence API",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(complaint_router, prefix="/api")

    @app.get("/", tags=["health"])
    async def root() -> dict[str, str]:
        return {"message": "AI Banking Intelligence API is running"}

    @app.get("/health", tags=["health"])
    async def health_check() -> dict[str, str]:
        return {"status": "ok", "service": "AI Banking Intelligence API"}

    return app


app = create_app()
