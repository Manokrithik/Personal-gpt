from datetime import datetime, timezone
from typing import Dict, Any
from app.ai.tools.base import BaseTool

class DateTimeTool(BaseTool):
    name = "date_time"
    description = "Retrieve current date, time, day of the week, and UTC offset."
    parameters = {}

    async def execute(self, **kwargs) -> Dict[str, Any]:
        now = datetime.now()
        utc_now = datetime.now(timezone.utc)
        return {
            "current_date": now.strftime("%Y-%m-%d"),
            "current_time": now.strftime("%H:%M:%S"),
            "day_of_week": now.strftime("%A"),
            "iso_timestamp": now.isoformat(),
            "utc_timestamp": utc_now.isoformat(),
            "status": "success",
        }
