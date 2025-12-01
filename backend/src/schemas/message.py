from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    content: str
    channel_id: int

class MessageOut(BaseModel):
    id: int
    content: str
    sender: str  # We return the username, not just the ID
    created_at: datetime
    channel_id: int
