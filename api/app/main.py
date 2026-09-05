import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings
from .core.security import SecurityHeadersMiddleware

# Import all routers cleanly
from .routers import (
    auth,
    chat,
    checkout,
    geo,
    orders,
    payments,
    products,
    profile,
    recommendations,
    requests,
    webhooks,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Muzoscent API...")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="Muzoscent API",
    description="E-commerce backend for Muzoscent fragrances.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    redirect_slashes=False  # Prevents 307 redirects for missing/extra trailing slashes
)


# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom error handler for 422 validation errors.
    Logs the validation failure details and returns the failed payload body along with exact validation errors.
    """
    logger.error(f"Validation error for {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )


# Middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL.rstrip("/"),
        "https://muzoscents.netlify.app",
        "https://muzoscent.netlify.app",
        "capacitor://localhost",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/v1/products", tags=["products"])
app.include_router(checkout.router, prefix="/api/v1/checkout", tags=["checkout"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["webhooks"])
app.include_router(profile.router, prefix="/api/v1/profile", tags=["profile"])
app.include_router(geo.router, prefix="/api/v1/geo", tags=["geo"])
app.include_router(requests.router, prefix="/api/v1/requests", tags=["requests"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["recommendations"])


@app.get("/")
async def root():
    return {"message": "Muzoscent API", "status": "operational"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
