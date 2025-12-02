import asyncio
import os
from databases import Database

async def inspect_db():
    # Get URL from environment
    url = os.getenv('CLOUD_DATABASE_URL')
    if not url:
        print("❌ Error: CLOUD_DATABASE_URL is not set.")
        return

    print(f'🔍 Connecting to Cloud DB...')
    database = Database(url)
    
    try:
        await database.connect()
        print('✅ Connected.')
        
        # 1. Check Users
        users = await database.fetch_all('SELECT id, username, email FROM users')
        print(f'\n👥 USERS FOUND: {len(users)}')
        for u in users:
            print(f' - ID: {u["id"]} | User: {u["username"]} | Email: {u["email"]}')
            
        if len(users) == 0:
            print('⚠️ WARNING: The users table is EMPTY.')
            
            # Attempt Force-Insert
            print('\n🛠️ Attempting FORCE INSERT of test user...')
            try:
                # Insert 'admin' user manually
                query = "INSERT INTO users (username, email, password_hash, is_online) VALUES (:u, :e, :p, FALSE)"
                # Hash for 'password123'
                pw_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWUNb/tp.vq20g1P8wl17ch9r0xJd."
                await database.execute(query, values={"u": "admin", "e": "admin@test.com", "p": pw_hash})
                print('✅ Force Insert SUCCESS. User "admin" created.')
            except Exception as e:
                print(f'❌ Force Insert FAILED: {e}')

    except Exception as e:
        print(f'❌ CRITICAL ERROR: {e}')
    finally:
        await database.disconnect()

if __name__ == '__main__':
    asyncio.run(inspect_db())