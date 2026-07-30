"""
API v1 路由汇总
"""
from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.sensors import router as sensors_router
from app.api.v1.warnings import router as warnings_router
from app.api.v1.digital_twin import router as digital_twin_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.websocket import router as websocket_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(sensors_router)
api_router.include_router(warnings_router)
api_router.include_router(digital_twin_router)
api_router.include_router(websocket_router)
