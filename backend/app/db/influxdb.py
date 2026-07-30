"""
InfluxDB 时序数据库连接 - 用于传感器数据存储
"""
from influxdb_client import InfluxDBClient as InfluxDBClientBase, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

from app.core.config import settings


class InfluxDBService:
    """InfluxDB 客户端封装"""

    def __init__(self):
        self._client: InfluxDBClientBase | None = None
        self._write_api = None
        self._query_api = None

    def connect(self):
        self._client = InfluxDBClientBase(
            url=settings.INFLUXDB_URL,
            token=settings.INFLUXDB_TOKEN,
            org=settings.INFLUXDB_ORG,
        )
        self._write_api = self._client.write_api(write_options=SYNCHRONOUS)
        self._query_api = self._client.query_api()

    def write_sensor_data(self, sensor_id: str, measurement: str, value: float, tags: dict = None):
        """写入传感器数据点"""
        point = Point(measurement) \
            .tag("sensor_id", sensor_id) \
            .field("value", value) \
            .time(None, WritePrecision.MS)

        if tags:
            for key, val in tags.items():
                point = point.tag(key, val)

        self._write_api.write(bucket=settings.INFLUXDB_BUCKET, record=point)

    def query_latest(self, sensor_id: str, measurement: str, limit: int = 100):
        """查询传感器最新数据"""
        query = f'''
        from(bucket: "{settings.INFLUXDB_BUCKET}")
          |> range(start: -1h)
          |> filter(fn: (r) => r["_measurement"] == "{measurement}")
          |> filter(fn: (r) => r["sensor_id"] == "{sensor_id}")
          |> sort(columns: ["_time"], desc: true)
          |> limit(n: {limit})
        '''
        return self._query_api.query(org=settings.INFLUXDB_ORG, query=query)

    def close(self):
        if self._client:
            self._client.close()


# 全局单例
influxdb_service = InfluxDBService()
