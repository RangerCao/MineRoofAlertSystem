"""
预警数据模型 - 对应灾变认知层
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Enum
from sqlalchemy.sql import func

from app.db.postgresql import Base


class WarningRule(Base):
    """预警规则配置"""
    __tablename__ = "warning_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, comment="规则名称")
    description = Column(Text, comment="规则描述")
    sensor_type = Column(String(50), nullable=False, comment="适用传感器类型")
    measurement = Column(String(50), nullable=False, comment="测量类型")
    threshold_config = Column(JSON, nullable=False, comment="阈值配置 {level: {min, max}}")
    algorithm = Column(String(50), comment="预警算法: threshold/xgboost/lstm/st-attention")
    is_active = Column(Integer, default=1, comment="是否启用: 0/1")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class WarningEvent(Base):
    """预警事件记录"""
    __tablename__ = "warning_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_code = Column(String(50), unique=True, nullable=False, comment="事件编号")
    warning_level = Column(Integer, nullable=False, comment="预警等级: 1-正常 2-关注 3-预警 4-危险")
    warning_type = Column(String(50), nullable=False, comment="预警类型")
    source_sensors = Column(JSON, comment="触发传感器列表")
    location = Column(String(200), comment="预警位置")
    mine_area = Column(String(100), comment="所属矿区")
    working_face = Column(String(100), comment="所属工作面")
    description = Column(Text, comment="预警描述")
    trigger_value = Column(Float, comment="触发值")
    threshold_value = Column(Float, comment="阈值")
    algorithm_used = Column(String(50), comment="使用的算法")
    confidence = Column(Float, comment="置信度 0-1")
    status = Column(String(20), default="active", comment="状态: active/confirmed/resolved/ignored")
    confirmed_by = Column(String(100), comment="确认人")
    confirmed_at = Column(DateTime, comment="确认时间")
    resolved_at = Column(DateTime, comment="解除时间")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
