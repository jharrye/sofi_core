import requests

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

try:
    print(f"Testing connection to {BASE_URL}...")
    r = requests.get(f"{BASE_URL}/users", headers=HEADERS)
    print(f"Status Code: {r.status_code}")
    if r.status_code == 200:
        print("Connection successful!")
    else:
        print(f"Connection failed: {r.text}")
except Exception as e:
    print(f"Connection error: {e}")
