from pydantic import BaseModel


class AlertOut(BaseModel):
    severity: str
    title: str
    description: str
    recommendation: str
