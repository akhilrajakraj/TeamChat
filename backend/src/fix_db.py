import asyncio
import os
from databases import Database
from dotenv import load_dotenv

load_dotenv()

async def fix_schema():
    print("🔌 Connecting to database...")
    url = os.getenv("DATABASE_URL")
    database = Database(url)
    await database.connect()
    
    print("🛠️  Adding missing 'is_online' column...")
    try:
        # The SQL command to update the table
        await database.execute("ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT FALSE;")
        print("✅ SUCCESS: Column 'is_online' added to 'users' table.")
    except Exception as e:
        # If it fails, print why (usually because it already exists)
        print(f"⚠️  Note: {e}")
        
    await database.disconnect()
    print("✅ Done.")

if __name__ == "__main__":
    asyncio.run(fix_schema())
