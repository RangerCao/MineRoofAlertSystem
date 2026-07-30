"""
Redis 连接 - 用于缓存和实时消息
"""
from redis.asyncio import Redis
from app.core.config import settings

redis_client: Redis = None


async def get_redis() -> Redis:
    """获取 Redis 客户端"""
    global redis_client
    if redis_client is None:
        redis_client = Redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return redis_client


async def close_redis():
    """关闭 Redis 连接"""
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
