from pydantic import BaseModel


class ForecastPoint(BaseModel):
    day: int
    projected_balance: float
    recurring_inflows: float = 0
    recurring_outflows: float = 0


class ForecastOut(BaseModel):
    current_balance: float
    average_daily_inflows: float
    average_daily_outflows: float
    horizon_days: int
    points: list[ForecastPoint]
    liquidity_risk: str
    recommendation: str
    recurring_monthly_inflows: float = 0
    recurring_monthly_outflows: float = 0
