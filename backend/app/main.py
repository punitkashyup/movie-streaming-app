from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, movies, users
from app.core.config import settings
from app.core.background_tasks import start_background_tasks

app = FastAPI(
    title="Movie Streaming API",
    description="API for movie streaming application",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with version prefix
app.include_router(auth.router, prefix="/v1/api", tags=["Authentication"])
app.include_router(movies.router, prefix="/v1/api", tags=["Movies"])
app.include_router(users.router, prefix="/v1/api", tags=["Users"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Movie Streaming API"}

@app.on_event("startup")
async def startup_event():
    """
    Function that runs when the application starts
    """
    # Start background tasks
    start_background_tasks()
