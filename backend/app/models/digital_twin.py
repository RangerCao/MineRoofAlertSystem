"""
数字孪生模型 - 对应数字孪生推演层
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text
from sqlalchemy.sql import func

from app.db.postgresql import Base


class DigitalTwinModel(Base):
    """数字孪生模型配置"""
    __tablename__ = "digital_twin_models"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, comment="模型名称")
    model_type = Column(String(50), nullable=False, comment="模型类型: geological/structural/mechanical")
    mine_area = Column(String(100), comment="所属矿区")
    working_face = Column(String(100), comment="所属工作面")
    parameters = Column(JSON, comment="模型参数")
    model_file_path = Column(String(500), comment="3D模型文件路径")
    version = Column(String(20), default="1.0.0", comment="模型版本")
    status = Column(String(20), default="active", comment="状态: active/archived")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class SimulationResult(Base):
    """仿真推演结果"""
    __tablename__ = "simulation_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_id = Column(Integer, nullable=False, comment="关联数字孪生模型ID")
    simulation_type = Column(String(50), nullable=False, comment="仿真类型: stress/displacement/coupled")
    input_params = Column(JSON, comment="输入参数")
    output_data = Column(JSON, comment="输出结果数据")
    risk_level = Column(Integer, comment="风险等级 1-4")
    risk_score = Column(Float, comment="风险评分 0-100")
    duration_seconds = Column(Float, comment="仿真耗时(秒)")
    created_at = Column(DateTime, server_default=func.now())
