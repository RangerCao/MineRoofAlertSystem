"""
创建默认管理员账号（开发/演示环境使用）
运行方式: cd backend && python -m app.scripts.seed_admin
"""
import asyncio
import sys
import os

# 确保项目根目录在 Python 路径中
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import select
from app.db.postgresql import async_session_factory, init_db
from app.core.security import get_password_hash
from app.models.user import User


async def seed_admin():
    """创建默认管理员"""
    # 先初始化数据库（创建表）
    await init_db()

    async with async_session_factory() as session:
        # 检查是否已存在 admin 用户
        result = await session.execute(select(User).where(User.username == "admin"))
        existing = result.scalar_one_or_none()

        if existing:
            print("管理员账号已存在，跳过创建")
            return

        admin = User(
            username="admin",
            email="admin@minerof.com",
            hashed_password=get_password_hash("admin123"),
            full_name="系统管理员",
            role="admin",
            organization="中建筑港集团",
            is_active=True,
        )
        session.add(admin)
        await session.commit()
        print("默认管理员账号创建成功！")
        print("  用户名: admin")
        print("  密码: admin123")
        print("  角色: admin")


if __name__ == "__main__":
    asyncio.run(seed_admin())
