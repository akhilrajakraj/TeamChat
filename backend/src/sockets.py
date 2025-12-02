import socketio
from src.core.database import database
from urllib.parse import parse_qs

# 1. Initialize Socket.IO Server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
sio_app = socketio.ASGIApp(sio)

# Helper to update status
async def update_presence(user_id: int, is_online: bool):
    if not user_id: return
    try:
        query = "UPDATE users SET is_online = :status WHERE id = :uid"
        await database.execute(query=query, values={"status": is_online, "uid": user_id})
        await sio.emit('status_update', {"user_id": user_id, "is_online": is_online})
    except Exception as e:
        print(f"Error updating presence: {e}")

# --- EVENT HANDLERS ---

@sio.event
async def connect(sid, environ):
    query_string = environ.get('QUERY_STRING', '')
    params = parse_qs(query_string)
    user_id_list = params.get('user_id')
    
    if user_id_list:
        user_id = int(user_id_list[0])
        # Save session so we know who to mark offline later
        await sio.save_session(sid, {'user_id': user_id})
        await update_presence(user_id, True)
        print(f"⚡ User {user_id} Connected ({sid})")
    else:
        print(f"  Anonymous Connection ({sid})")

@sio.event
async def disconnect(sid):
    session = await sio.get_session(sid)
    user_id = session.get('user_id')
    if user_id:
        await update_presence(user_id, False)
        print(f"  User {user_id} Disconnected")

@sio.event
async def join_channel(sid, data):
    channel_id = str(data.get("channel_id"))
    await sio.enter_room(sid, channel_id)

@sio.event
async def send_message(sid, data):
    content = data.get("content")
    channel_id = str(data.get("channel_id"))
    user_id = data.get("user_id")

    query = """
        INSERT INTO messages (content, channel_id, user_id)
        VALUES (:content, :cid, :uid)
        RETURNING id, content, created_at
    """
    try:
        # DB needs Integer for channel_id
        msg = await database.fetch_one(query=query, values={"content": content, "cid": int(channel_id), "uid": user_id})
        user = await database.fetch_one("SELECT username FROM users WHERE id = :uid", values={"uid": user_id})
        
        response_data = {
            "id": msg['id'],
            "content": msg['content'],
            "sender": user['username'],
            "channel_id": channel_id, # Frontend expects String for room matching
            "created_at": msg['created_at'].isoformat()
        }
        # Room needs String
        await sio.emit('new_message', response_data, room=channel_id)
    except Exception as e:
        print(f"Error saving message: {e}")

# --- NEW: TYPING INDICATORS ---
@sio.event
async def typing_start(sid, data):
    # data: { channel_id, username }
    # Broadcast to room EXCLUDING the sender (skip_sid)
    await sio.emit('typing_start', data, room=str(data['channel_id']), skip_sid=sid)

@sio.event
async def typing_stop(sid, data):
    await sio.emit('typing_stop', data, room=str(data['channel_id']), skip_sid=sid)

# --- NEW: DELETE MESSAGE ---
@sio.event
async def delete_message(sid, data):
    msg_id = data.get("message_id")
    user_id = data.get("user_id")
    channel_id = str(data.get("channel_id"))
    
    # 1. Verify ownership (Security Check: Only author can delete)
    query = "SELECT user_id FROM messages WHERE id = :id"
    msg = await database.fetch_one(query, values={"id": msg_id})
    
    if msg and msg['user_id'] == user_id:
        # 2. Delete from DB
        await database.execute("DELETE FROM messages WHERE id = :id", values={"id": msg_id})
        # 3. Broadcast Deletion Event to remove from UI
        await sio.emit('message_deleted', {"id": msg_id, "channel_id": channel_id}, room=channel_id)