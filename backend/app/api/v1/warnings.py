"""
预警 API 路由
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgresql import get_db
from app.schemas.warning import (
    WarningRuleCreate, WarningRuleResponse,
    WarningEventResponse, WarningEventConfirm,
    WarningStatistics,
)
from app.services.warning_service import WarningService

router = APIRouter(prefix="/warnings", tags=["预警管理"])


@router.post("/rules", response_model=WarningRuleResponse, status_code=201)
async def create_warning_rule(
    data: WarningRuleCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建预警规则"""
    service = WarningService(db)
    return await service.create_rule(data)


@router.get("/rules", response_model=list[WarningRuleResponse])
async def list_warning_rules(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """获取预警规则列表"""
    service = WarningService(db)
    return await service.list_rules(skip=skip, limit=limit)


@router.get("/events", response_model=list[WarningEventResponse])
async def list_warning_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    warning_level: Optional[int] = Query(None, ge=1, le=4),
    status: Optional[str] = None,
    mine_area: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取预警事件列表"""
    service = WarningService(db)
    events, _ = await service.list_warning_events(
        skip=skip, limit=limit,
        warning_level=warning_level,
        status=status,
        mine_area=mine_area,
    )
    return events


@router.post("/events/{event_id}/confirm", response_model=WarningEventResponse)
async def confirm_warning_event(
    event_id: int,
    data: WarningEventConfirm,
    db: AsyncSession = Depends(get_db),
):
    """确认/处理预警事件"""
    service = WarningService(db)
    event = await service.confirm_event(event_id, data)
    if not event:
        raise HTTPException(status_code=404, detail="预警事件不存在")
    return event


@router.get("/statistics", response_model=WarningStatistics)
async def get_warning_statistics(
    db: AsyncSession = Depends(get_db),
):
    """获取预警统计信息"""
    service = WarningService(db)
    return await service.get_statistics()
