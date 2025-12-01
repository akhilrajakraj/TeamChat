import asyncio
import os
from databases import Database
from dotenv import load_dotenv

load_dotenv()

async def fix_message_schema():
    print("🔌 Connecting to database...")
    url = os.getenv("DATABASE_URL")
    database = Database(url)
    await database.connect()
    
    print("🛠️  Adding missing 'user_id' column to 'messages' table...")
    try:
        # Add user_id column and link it to the users table
        # We allow NULL initially to avoid errors if rows exist, though table is likely empty
        await database.execute("ALTER TABLE messages ADD COLUMN user_id INTEGER REFERENCES users(id);")
        print("✅ SUCCESS: Column 'user_id' added to 'messages' table.")
    except Exception as e:
        print(f"⚠️  Note: {e}")
        
    await database.disconnect()
    print("✅ Done.")

if __name__ == "__main__":
    asyncio.run(fix_message_schema())
