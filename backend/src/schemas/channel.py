from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChannelCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ChannelOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    # We will simply return member count for the list view
    member_count: int = 0 
