"""
传感器 API 路由
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgresql import get_db
from app.schemas.sensor import (
    SensorCreate, SensorUpdate, SensorResponse,
    SensorReadingResponse, SensorListResponse, SensorStatistics,
)
from app.services.sensor_service import SensorService

router = APIRouter(prefix="/sensors", tags=["传感器管理"])


@router.post("/", response_model=SensorResponse, status_code=201)
async def create_sensor(
    data: SensorCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建传感器"""
    service = SensorService(db)
    return await service.create_sensor(data)


@router.get("/", response_model=SensorListResponse)
async def list_sensors(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sensor_type: Optional[str] = None,
    mine_area: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取传感器列表"""
    service = SensorService(db)
    items, total = await service.list_sensors(
        skip=skip, limit=limit,
        sensor_type=sensor_type,
        mine_area=mine_area,
        status=status,
    )
    return SensorListResponse(total=total, items=items)


@router.get("/statistics", response_model=SensorStatistics)
async def get_sensor_statistics(
    db: AsyncSession = Depends(get_db),
):
    """获取传感器统计信息"""
    service = SensorService(db)
    return await service.get_statistics()


@router.get("/{sensor_id}", response_model=SensorResponse)
async def get_sensor(
    sensor_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取单个传感器详情"""
    service = SensorService(db)
    sensor = await service.get_sensor(sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="传感器不存在")
    return sensor


@router.put("/{sensor_id}", response_model=SensorResponse)
async def update_sensor(
    sensor_id: int,
    data: SensorUpdate,
    db: AsyncSession = Depends(get_db),
):
    """更新传感器信息"""
    service = SensorService(db)
    sensor = await service.update_sensor(sensor_id, data)
    if not sensor:
        raise HTTPException(status_code=404, detail="传感器不存在")
    return sensor
