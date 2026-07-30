"""
预警相关 Pydantic Schema
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class WarningRuleBase(BaseModel):
    name: str = Field(..., description="规则名称")
    description: Optional[str] = None
    sensor_type: str = Field(..., description="适用传感器类型")
    measurement: str = Field(..., description="测量类型")
    threshold_config: Dict[str, Any] = Field(..., description="阈值配置")
    algorithm: Optional[str] = None


class WarningRuleCreate(WarningRuleBase):
    pass


class WarningRuleResponse(WarningRuleBase):
    id: int
    is_active: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WarningEventBase(BaseModel):
    warning_level: int = Field(..., ge=1, le=4, description="预警等级 1-4")
    warning_type: str
    source_sensors: Optional[List[str]] = None
    location: Optional[str] = None
    mine_area: Optional[str] = None
    working_face: Optional[str] = None
    description: Optional[str] = None
    trigger_value: Optional[float] = None
    threshold_value: Optional[float] = None
    algorithm_used: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0, le=1)


class WarningEventResponse(WarningEventBase):
    id: int
    event_code: str
    status: str
    confirmed_by: Optional[str] = None
    confirmed_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WarningEventConfirm(BaseModel):
    """预警事件确认"""
    confirmed_by: str
    action: str = Field(..., description="处理动作: confirm/ignore/resolve")
    note: Optional[str] = None


class WarningStatistics(BaseModel):
    """预警统计"""
    total_active: int
    by_level: Dict[int, int]
    by_type: Dict[str, int]
    by_status: Dict[str, int]
    recent_24h: int
    resolution_rate: float


class DashboardSummary(BaseModel):
    """看板总览数据"""
    sensor_stats: Dict[str, Any]
    warning_stats: Dict[str, Any]
    risk_level: int
    risk_score: float
    system_health: str
    last_updated: datetime
