import asyncio
import socketio

# Initialize Client
sio = socketio.AsyncClient()

@sio.event
async def connect():
    print("🟢 Connected to Server!")
    await sio.emit('join_channel', {'channel_id': 1})

@sio.event
async def response(data):
    print(f"Server says: {data}")

@sio.event
async def new_message(data):
    print(f"\n💬 NEW MESSAGE RECEIVED:")
    print(f"   From: {data['sender']}")
    print(f"   Says: {data['content']}")

async def main():
    await sio.connect('http://localhost:4000')
    
    # Send a message acting as User 1 in Channel 1
    print("📤 Sending message...")
    await sio.emit('send_message', {
        'content': 'Hello from the Python Test Script!',
        'channel_id': 1,
        'user_id': 1
    })
    
    # Keep alive long enough to receive the reply
    await asyncio.sleep(2)
    await sio.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
