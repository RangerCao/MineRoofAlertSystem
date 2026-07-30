"""
煤矿顶板灾变智能预警与可视化决策系统 - 后端应用入口
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import api_router
from app.db.postgresql import engine as pg_engine, init_db
from app.db.redis import redis_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时: 自动建表（开发环境）
    await init_db()
    yield
    # 关闭时: 释放连接
    await pg_engine.dispose()
    if redis_client:
        await redis_client.close()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="基于数字孪生的煤矿顶板灾变智能预警与可视化决策系统 API",
    lifespan=lifespan,
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册 API 路由
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "ok", "service": settings.APP_NAME}
