"""
传感器相关 Pydantic Schema
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SensorBase(BaseModel):
    sensor_code: str = Field(..., description="传感器编号")
    name: str = Field(..., description="传感器名称")
    sensor_type: str = Field(..., description="传感器类型")
    location: Optional[str] = None
    mine_area: Optional[str] = None
    working_face: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None


class SensorCreate(SensorBase):
    install_date: Optional[datetime] = None


class SensorUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None


class SensorResponse(SensorBase):
    id: int
    status: str
    install_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SensorReadingBase(BaseModel):
    sensor_id: int
    sensor_code: str
    measurement: str
    value: float
    unit: Optional[str] = None
    quality_flag: str = "valid"
    recorded_at: datetime


class SensorReadingResponse(SensorReadingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SensorListResponse(BaseModel):
    total: int
    items: List[SensorResponse]


class SensorStatistics(BaseModel):
    """传感器统计信息"""
    total_count: int
    online_count: int
    offline_count: int
    alarm_count: int
    by_type: Dict[str, int]
    by_mine_area: Dict[str, int]
