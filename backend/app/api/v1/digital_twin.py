"""
数字孪生 API 路由
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgresql import get_db
from app.models.digital_twin import DigitalTwinModel, SimulationResult
from app.services.digital_twin_service import DigitalTwinService

router = APIRouter(prefix="/digital-twin", tags=["数字孪生"])


@router.get("/models", response_model=list[dict])
async def list_models(
    mine_area: Optional[str] = None,
    model_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取数字孪生模型列表"""
    service = DigitalTwinService(db)
    models = await service.list_models(mine_area=mine_area, model_type=model_type)
    return [
        {
            "id": m.id,
            "name": m.name,
            "model_type": m.model_type,
            "mine_area": m.mine_area,
            "working_face": m.working_face,
            "version": m.version,
            "status": m.status,
        }
        for m in models
    ]


@router.get("/models/{model_id}", response_model=dict)
async def get_model(
    model_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取数字孪生模型详情"""
    service = DigitalTwinService(db)
    model = await service.get_model(model_id)
    if not model:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="模型不存在")
    return {
        "id": model.id,
        "name": model.name,
        "model_type": model.model_type,
        "mine_area": model.mine_area,
        "working_face": model.working_face,
        "parameters": model.parameters,
        "model_file_path": model.model_file_path,
        "version": model.version,
        "status": model.status,
    }


@router.get("/models/{model_id}/simulation/latest")
async def get_latest_simulation(
    model_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取最新仿真结果"""
    service = DigitalTwinService(db)
    result = await service.get_latest_simulation(model_id)
    if not result:
        return {"message": "暂无仿真结果"}
    return {
        "id": result.id,
        "simulation_type": result.simulation_type,
        "input_params": result.input_params,
        "output_data": result.output_data,
        "risk_level": result.risk_level,
        "risk_score": result.risk_score,
        "duration_seconds": result.duration_seconds,
        "created_at": result.created_at.isoformat() if result.created_at else None,
    }


@router.get("/models/{model_id}/simulation/history")
async def get_simulation_history(
    model_id: int,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """获取仿真历史"""
    service = DigitalTwinService(db)
    results = await service.get_simulation_history(model_id, limit=limit)
    return [
        {
            "id": r.id,
            "simulation_type": r.simulation_type,
            "risk_level": r.risk_level,
            "risk_score": r.risk_score,
            "duration_seconds": r.duration_seconds,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in results
    ]
