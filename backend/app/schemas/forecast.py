from pydantic import BaseModel


class ForecastPoint(BaseModel):
    day: int
    projected_balance: float


class ForecastOut(BaseModel):
    current_balance: float
    average_daily_inflows: float
    average_daily_outflows: float
    horizon_days: int
    points: list[ForecastPoint]
    liquidity_risk: str
    recommendation: str
