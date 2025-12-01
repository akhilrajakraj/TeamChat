from dotenv import load_dotenv
import os, re
load_dotenv('.env')
url = os.getenv('DATABASE_URL')
if url is None:
    print('DATABASE_URL is: None')
else:
    # mask password between : and @
    masked = re.sub(r':([^:@]+)@', r':XXXX@', url)
    print('DATABASE_URL (masked):', masked)
