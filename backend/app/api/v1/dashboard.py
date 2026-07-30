"""
看板 API 路由 - 首页总览数据
"""
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgresql import get_db
from app.schemas.warning import DashboardSummary
from app.services.sensor_service import SensorService
from app.services.warning_service import WarningService

router = APIRouter(prefix="/dashboard", tags=["看板总览"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
):
    """获取看板总览数据"""
    sensor_service = SensorService(db)
    warning_service = WarningService(db)

    sensor_stats = await sensor_service.get_statistics()
    warning_stats = await warning_service.get_statistics()

    # 综合风险等级计算（简化版）
    risk_score = 0.0
    risk_level = 1
    if warning_stats.total_active > 0:
        level_weights = {1: 10, 2: 30, 3: 60, 4: 100}
        for level, count in warning_stats.by_level.items():
            risk_score += level_weights.get(level, 0) * count
        risk_score = min(risk_score, 100)

        if risk_score >= 80:
            risk_level = 4
        elif risk_score >= 50:
            risk_level = 3
        elif risk_score >= 20:
            risk_level = 2
        else:
            risk_level = 1

    # 系统健康状态
    if sensor_stats.total_count > 0:
        online_rate = sensor_stats.online_count / sensor_stats.total_count
        if online_rate >= 0.95:
            system_health = "healthy"
        elif online_rate >= 0.8:
            system_health = "warning"
        else:
            system_health = "critical"
    else:
        system_health = "unknown"

    return DashboardSummary(
        sensor_stats=sensor_stats.model_dump(),
        warning_stats=warning_stats.model_dump(),
        risk_level=risk_level,
        risk_score=round(risk_score, 1),
        system_health=system_health,
        last_updated=datetime.utcnow(),
    )
