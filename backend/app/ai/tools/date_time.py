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
        formatted_date = now.strftime("%A, %B %d, %Y")
        day_of_week = now.strftime("%A")
        current_time = now.strftime("%I:%M:%S %p")
        return {
            "current_date": now.strftime("%Y-%m-%d"),
            "formatted_date": formatted_date,
            "day_of_week": day_of_week,
            "current_time": current_time,
            "year": now.year,
            "iso_timestamp": now.isoformat(),
            "utc_timestamp": utc_now.isoformat(),
            "summary": f"Today is {formatted_date}. The day of the week is {day_of_week}, and current local time is {current_time}.",
            "status": "success",
        }
