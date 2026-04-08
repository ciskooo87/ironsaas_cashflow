from decimal import Decimal
from pydantic import BaseModel


class DfcCategoryLine(BaseModel):
    category_name: str
    amount: Decimal


class DfcOut(BaseModel):
    operational_inflows: Decimal
    operational_outflows: Decimal
    investment_inflows: Decimal
    investment_outflows: Decimal
    financing_inflows: Decimal
    financing_outflows: Decimal
    net_cash_generation: Decimal
    operational_inflow_lines: list[DfcCategoryLine] = []
    operational_outflow_lines: list[DfcCategoryLine] = []
    investment_inflow_lines: list[DfcCategoryLine] = []
    investment_outflow_lines: list[DfcCategoryLine] = []
    financing_inflow_lines: list[DfcCategoryLine] = []
    financing_outflow_lines: list[DfcCategoryLine] = []
