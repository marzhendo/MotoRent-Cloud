import os
import time
import socket
from contextlib import asynccontextmanager
from typing import Dict, Any, List

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import customers, vehicles, rentals

# Read instance identifier from environment (useful in AWS EC2 / ECS / Container)
INSTANCE_ID = os.getenv("INSTANCE_ID", os.getenv("HOSTNAME", socket.gethostname() or "motorent-local"))
START_TIME = time.time()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    yield
    # Shutdown actions

app = FastAPI(
    title="MotoRent Cloud API",
    description="Distributed Vehicle Rental REST API for CAK3EAB3 Komputasi Awan dan Terdistribusi",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
if raw_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Telemetry Middleware: Inject X-Instance-Id into every response
@app.middleware("http")
async def add_telemetry_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Instance-Id"] = INSTANCE_ID
    return response

def get_client_ip(request: Request) -> str:
    """Helper to extract real client IP behind proxy or load balancer"""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

# Register Routers
app.include_router(customers.router)
app.include_router(vehicles.router)
app.include_router(rentals.router)

@app.get("/", tags=["General"])
async def root():
    return {
        "message": "Welcome to MotoRent Cloud REST API",
        "service": "MotoRent-Cloud",
        "docs_url": "/docs",
        "instance_id": INSTANCE_ID
    }

@app.get("/api/info", tags=["Telemetry"])
async def get_system_info():
    uptime = time.time() - START_TIME
    return {
        "status": "ok",
        "service": "MotoRent-Cloud API",
        "version": "1.0.0",
        "instance_id": INSTANCE_ID,
        "uptime_seconds": round(uptime, 2)
    }
