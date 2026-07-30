"""
通用工具函数
"""
from datetime import datetime
from typing import Any


def generate_event_code(prefix: str = "EVT") -> str:
    """生成事件编号"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    import uuid
    short_id = uuid.uuid4().hex[:6].upper()
    return f"{prefix}-{timestamp}-{short_id}"


def clamp(value: float, min_val: float, max_val: float) -> float:
    """数值钳制"""
    return max(min_val, min(max_val, value))


def warning_level_name(level: int) -> str:
    """预警等级名称"""
    names = {1: "正常", 2: "关注", 3: "预警", 4: "危险"}
    return names.get(level, "未知")


def warning_level_color(level: int) -> str:
    """预警等级颜色"""
    colors = {1: "#52c41a", 2: "#faad14", 3: "#ff7a45", 4: "#f5222d"}
    return colors.get(level, "#999999")
