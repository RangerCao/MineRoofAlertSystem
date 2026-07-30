"""
传感器服务层 - 业务逻辑
"""
from typing import List, Optional
from datetime import datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.sensor import Sensor, SensorReading
from app.schemas.sensor import SensorCreate, SensorUpdate, SensorStatistics


class SensorService:
    """传感器管理服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_sensor(self, data: SensorCreate) -> Sensor:
        """创建传感器"""
        sensor = Sensor(**data.model_dump())
        self.db.add(sensor)
        await self.db.flush()
        await self.db.refresh(sensor)
        return sensor

    async def get_sensor(self, sensor_id: int) -> Optional[Sensor]:
        """获取单个传感器"""
        result = await self.db.execute(
            select(Sensor).where(Sensor.id == sensor_id)
        )
        return result.scalar_one_or_none()

    async def get_sensor_by_code(self, sensor_code: str) -> Optional[Sensor]:
        """根据编号获取传感器"""
        result = await self.db.execute(
            select(Sensor).where(Sensor.sensor_code == sensor_code)
        )
        return result.scalar_one_or_none()

    async def list_sensors(
        self,
        skip: int = 0,
        limit: int = 50,
        sensor_type: Optional[str] = None,
        mine_area: Optional[str] = None,
        status: Optional[str] = None,
    ) -> tuple[List[Sensor], int]:
        """获取传感器列表（分页）"""
        query = select(Sensor)
        count_query = select(func.count(Sensor.id))

        if sensor_type:
            query = query.where(Sensor.sensor_type == sensor_type)
            count_query = count_query.where(Sensor.sensor_type == sensor_type)
        if mine_area:
            query = query.where(Sensor.mine_area == mine_area)
            count_query = count_query.where(Sensor.mine_area == mine_area)
        if status:
            query = query.where(Sensor.status == status)
            count_query = count_query.where(Sensor.status == status)

        total = (await self.db.execute(count_query)).scalar()
        result = await self.db.execute(
            query.offset(skip).limit(limit).order_by(Sensor.id)
        )
        return result.scalars().all(), total

    async def update_sensor(self, sensor_id: int, data: SensorUpdate) -> Optional[Sensor]:
        """更新传感器信息"""
        sensor = await self.get_sensor(sensor_id)
        if not sensor:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(sensor, key, value)
        await self.db.flush()
        await self.db.refresh(sensor)
        return sensor

    async def get_statistics(self) -> SensorStatistics:
        """获取传感器统计"""
        total = (await self.db.execute(select(func.count(Sensor.id)))).scalar()
        online = (await self.db.execute(
            select(func.count(Sensor.id)).where(Sensor.status == "online")
        )).scalar()
        offline = (await self.db.execute(
            select(func.count(Sensor.id)).where(Sensor.status == "offline")
        )).scalar()
        alarm = (await self.db.execute(
            select(func.count(Sensor.id)).where(Sensor.status == "alarm")
        )).scalar()

        # 按类型统计
        type_stats_result = await self.db.execute(
            select(Sensor.sensor_type, func.count(Sensor.id))
            .group_by(Sensor.sensor_type)
        )
        by_type = dict(type_stats_result.all())

        # 按矿区统计
        area_stats_result = await self.db.execute(
            select(Sensor.mine_area, func.count(Sensor.id))
            .where(Sensor.mine_area.isnot(None))
            .group_by(Sensor.mine_area)
        )
        by_mine_area = dict(area_stats_result.all())

        return SensorStatistics(
            total_count=total or 0,
            online_count=online or 0,
            offline_count=offline or 0,
            alarm_count=alarm or 0,
            by_type=by_type,
            by_mine_area=by_mine_area,
        )
