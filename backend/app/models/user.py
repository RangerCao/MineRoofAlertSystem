"""
用户与角色模型
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON
from sqlalchemy.sql import func

from app.db.postgresql import Base


class User(Base):
    """系统用户"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, comment="用户名")
    email = Column(String(100), unique=True, nullable=False, comment="邮箱")
    hashed_password = Column(String(200), nullable=False, comment="哈希密码")
    full_name = Column(String(100), comment="姓名")
    role = Column(String(20), default="operator", comment="角色: admin/enterprise/think_tank/regulatory/operator")
    organization = Column(String(200), comment="所属组织")
    is_active = Column(Boolean, default=True, comment="是否启用")
    last_login = Column(DateTime, comment="最后登录时间")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
