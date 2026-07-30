"""
数字孪生服务层 - 仿真推演业务逻辑
"""
from typing import List, Optional, Dict, Any
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.digital_twin import DigitalTwinModel, SimulationResult


class DigitalTwinService:
    """数字孪生管理服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_model(self, model_id: int) -> Optional[DigitalTwinModel]:
        """获取数字孪生模型"""
        result = await self.db.execute(
            select(DigitalTwinModel).where(DigitalTwinModel.id == model_id)
        )
        return result.scalar_one_or_none()

    async def list_models(
        self,
        mine_area: Optional[str] = None,
        model_type: Optional[str] = None,
    ) -> List[DigitalTwinModel]:
        """获取模型列表"""
        query = select(DigitalTwinModel).where(DigitalTwinModel.status == "active")
        if mine_area:
            query = query.where(DigitalTwinModel.mine_area == mine_area)
        if model_type:
            query = query.where(DigitalTwinModel.model_type == model_type)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_latest_simulation(self, model_id: int) -> Optional[SimulationResult]:
        """获取最新仿真结果"""
        result = await self.db.execute(
            select(SimulationResult)
            .where(SimulationResult.model_id == model_id)
            .order_by(SimulationResult.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_simulation_history(
        self, model_id: int, limit: int = 20
    ) -> List[SimulationResult]:
        """获取仿真历史"""
        result = await self.db.execute(
            select(SimulationResult)
            .where(SimulationResult.model_id == model_id)
            .order_by(SimulationResult.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
