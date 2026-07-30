"""
传感器数据模型 - 对应感知接入层
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON
from sqlalchemy.sql import func

from app.db.postgresql import Base


class Sensor(Base):
    """传感器基本信息"""
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sensor_code = Column(String(50), unique=True, nullable=False, comment="传感器编号")
    name = Column(String(100), nullable=False, comment="传感器名称")
    sensor_type = Column(String(50), nullable=False, comment="传感器类型: stress/displacement/crack/seepage/environment/spatial")
    location = Column(String(200), comment="安装位置")
    mine_area = Column(String(100), comment="所属矿区")
    working_face = Column(String(100), comment="所属工作面")
    coordinates = Column(JSON, comment="三维坐标 {x, y, z}")
    status = Column(String(20), default="online", comment="状态: online/offline/alarm")
    install_date = Column(DateTime, comment="安装日期")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class SensorReading(Base):
    """传感器读数记录（PostgreSQL 侧，用于查询和关联）"""
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sensor_id = Column(Integer, nullable=False, comment="关联传感器ID")
    sensor_code = Column(String(50), nullable=False, comment="传感器编号")
    measurement = Column(String(50), nullable=False, comment="测量类型")
    value = Column(Float, nullable=False, comment="测量值")
    unit = Column(String(20), comment="单位")
    quality_flag = Column(String(20), default="valid", comment="数据质量标记: valid/suspect/invalid")
    recorded_at = Column(DateTime, nullable=False, comment="采集时间")
    created_at = Column(DateTime, server_default=func.now())
