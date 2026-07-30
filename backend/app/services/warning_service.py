"""
预警服务层 - 业务逻辑
"""
import uuid
from typing import List, Optional
from datetime import datetime, timedelta

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.warning import WarningRule, WarningEvent
from app.schemas.warning import (
    WarningRuleCreate, WarningEventBase, WarningEventConfirm,
    WarningStatistics, DashboardSummary,
)


class WarningService:
    """预警管理服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_rule(self, data: WarningRuleCreate) -> WarningRule:
        """创建预警规则"""
        rule = WarningRule(**data.model_dump())
        self.db.add(rule)
        await self.db.flush()
        await self.db.refresh(rule)
        return rule

    async def list_rules(self, skip: int = 0, limit: int = 50) -> List[WarningRule]:
        """获取预警规则列表"""
        result = await self.db.execute(
            select(WarningRule).offset(skip).limit(limit).order_by(WarningRule.id)
        )
        return result.scalars().all()

    async def create_warning_event(self, data: WarningEventBase) -> WarningEvent:
        """创建预警事件"""
        event = WarningEvent(
            **data.model_dump(),
            event_code=f"WRN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}",
        )
        self.db.add(event)
        await self.db.flush()
        await self.db.refresh(event)
        return event

    async def list_warning_events(
        self,
        skip: int = 0,
        limit: int = 50,
        warning_level: Optional[int] = None,
        status: Optional[str] = None,
        mine_area: Optional[str] = None,
    ) -> tuple[List[WarningEvent], int]:
        """获取预警事件列表（分页）"""
        query = select(WarningEvent)
        count_query = select(func.count(WarningEvent.id))

        if warning_level:
            query = query.where(WarningEvent.warning_level == warning_level)
            count_query = count_query.where(WarningEvent.warning_level == warning_level)
        if status:
            query = query.where(WarningEvent.status == status)
            count_query = count_query.where(WarningEvent.status == status)
        if mine_area:
            query = query.where(WarningEvent.mine_area == mine_area)
            count_query = count_query.where(WarningEvent.mine_area == mine_area)

        total = (await self.db.execute(count_query)).scalar()
        result = await self.db.execute(
            query.offset(skip).limit(limit).order_by(WarningEvent.created_at.desc())
        )
        return result.scalars().all(), total

    async def confirm_event(self, event_id: int, data: WarningEventConfirm) -> Optional[WarningEvent]:
        """确认/处理预警事件"""
        result = await self.db.execute(
            select(WarningEvent).where(WarningEvent.id == event_id)
        )
        event = result.scalar_one_or_none()
        if not event:
            return None

        event.confirmed_by = data.confirmed_by
        event.confirmed_at = datetime.utcnow()

        if data.action == "resolve":
            event.status = "resolved"
            event.resolved_at = datetime.utcnow()
        elif data.action == "ignore":
            event.status = "ignored"

        await self.db.flush()
        await self.db.refresh(event)
        return event

    async def get_statistics(self) -> WarningStatistics:
        """获取预警统计"""
        active_count = (await self.db.execute(
            select(func.count(WarningEvent.id)).where(WarningEvent.status == "active")
        )).scalar() or 0

        # 按等级统计
        level_result = await self.db.execute(
            select(WarningEvent.warning_level, func.count(WarningEvent.id))
            .where(WarningEvent.status == "active")
            .group_by(WarningEvent.warning_level)
        )
        by_level = dict(level_result.all())

        # 按类型统计
        type_result = await self.db.execute(
            select(WarningEvent.warning_type, func.count(WarningEvent.id))
            .where(WarningEvent.status == "active")
            .group_by(WarningEvent.warning_type)
        )
        by_type = dict(type_result.all())

        # 按状态统计
        status_result = await self.db.execute(
            select(WarningEvent.status, func.count(WarningEvent.id))
            .group_by(WarningEvent.status)
        )
        by_status = dict(status_result.all())

        # 最近24小时
        since_24h = datetime.utcnow() - timedelta(hours=24)
        recent_24h = (await self.db.execute(
            select(func.count(WarningEvent.id))
            .where(WarningEvent.created_at >= since_24h)
        )).scalar() or 0

        # 解决率
        total_events = sum(by_status.values())
        resolved = by_status.get("resolved", 0)
        resolution_rate = (resolved / total_events * 100) if total_events > 0 else 0

        return WarningStatistics(
            total_active=active_count,
            by_level=by_level,
            by_type=by_type,
            by_status=by_status,
            recent_24h=recent_24h,
            resolution_rate=round(resolution_rate, 1),
        )
