import requests
import json

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

try:
    # Try public endpoint first, or authenticated one
    # Note: /credential-types might not be v1/ public API, but let's try.
    # Often it is under /rest/credential-types in UI, but API has /credential-types?
    
    # Try getting existing credentials to see what types are already there
    r = requests.get(f"{BASE_URL}/credentials", headers=HEADERS)
    if r.status_code == 200:
        data = r.json().get('data', [])
        print(f"Found {len(data)} existing credentials.")
        for c in data:
            print(f" - ID: {c['id']}, Name: {c['name']}, Type: {c['type']}")
    else:
        print(f"Failed to list credentials: {r.status_code} {r.text}")

except Exception as e:
    print(f"Error: {e}")
