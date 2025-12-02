import requests
import sys

# 1. SETUP
# Toggle this to True to target your Cloud App
TARGET_CLOUD = True 

if TARGET_CLOUD:
    BASE_URL = "https://teachat-backend.onrender.com"
    print("🌍 TARGETING: CLOUD (Render)")
else:
    BASE_URL = "http://localhost:4000"
    print("💻 TARGETING: LOCALHOST")

def register_user():
    print(f"\n--- Creating New User ---")
    username = input("Enter Username: ")
    email = input("Enter Email: ")
    password = input("Enter Password: ")

    url = f"{BASE_URL}/api/auth/register"
    payload = {
        "username": username,
        "email": email,
        "password": password
    }

    try:
        print(f"🚀 Sending request to {url}...")
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            print("\n✅ SUCCESS! User created.")
            print(f"User Data: {response.json()}")
            print("\n👉 NOW: Go to your phone and Log In with these exact details.")
        else:
            print("\n❌ FAILED.")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")

    except Exception as e:
        print(f"\n❌ ERROR: Could not connect. {e}")
        if not TARGET_CLOUD:
            print("(Is your local server running?)")

if __name__ == "__main__":
    register_user()