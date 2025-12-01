from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from src.schemas.channel import ChannelCreate, ChannelOut
from src.core.database import database

# REMOVED: from src.routers.auth import get_current_user (This was causing the crash)

router = APIRouter()

# Temporary helper: Pretend we are always User #1 until we wire up real JWTs
async def get_current_user_id():
    return 1 

@router.get("/", response_model=List[ChannelOut])
async def get_channels():
    # Fetch all channels with a count of members
    query = """
        SELECT c.id, c.name, c.description, c.created_at, 
               COUNT(cm.user_id) as member_count
        FROM channels c
        LEFT JOIN channel_members cm ON c.id = cm.channel_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
    """
    return await database.fetch_all(query=query)

@router.post("/", response_model=ChannelOut)
async def create_channel(channel: ChannelCreate):
    # 1. Create the channel
    query = """
        INSERT INTO channels (name, description)
        VALUES (:name, :desc)
        RETURNING id, name, description, created_at
    """
    values = {"name": channel.name, "desc": channel.description}
    new_channel = await database.fetch_one(query=query, values=values)
    
    # 2. Add the creator (User 1) as a member automatically
    user_id = await get_current_user_id()
    await database.execute(
        "INSERT INTO channel_members (channel_id, user_id) VALUES (:cid, :uid)",
        values={"cid": new_channel['id'], "uid": user_id}
    )

    return {**new_channel, "member_count": 1}

@router.post("/{channel_id}/join")
async def join_channel(channel_id: int):
    user_id = await get_current_user_id()
    try:
        query = "INSERT INTO channel_members (channel_id, user_id) VALUES (:cid, :uid)"
        await database.execute(query=query, values={"cid": channel_id, "uid": user_id})
        return {"message": "Joined channel"}
    except Exception:
        return {"message": "Already a member or error"}
