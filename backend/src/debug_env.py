# debug_env.py
import os
from dotenv import load_dotenv

print('PYTHON CWD:', os.getcwd())
print('FILES:', os.listdir('.'))

# show raw start of .env bytes (first 32 bytes) and repr of contents
env_path = '.env'
if os.path.exists(env_path):
    with open(env_path, 'rb') as f:
        b = f.read(128)
    print('.env raw bytes repr:', repr(b[:64]))
    try:
        text = b.decode('utf-8')
    except Exception as e:
        text = f'<cannot decode: {e}>'
    print('.env text repr (first 200 chars):', repr(text[:200]))
else:
    print('.env file: NOT FOUND')

# try load_dotenv and report value
ok = load_dotenv('.env')
print('load_dotenv returned:', ok)
print("os.getenv('DATABASE_URL') repr:", repr(os.getenv('DATABASE_URL')))
