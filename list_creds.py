import requests
import json

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def list_creds():
    try:
        r = requests.get(f"{BASE_URL}/credentials", headers=HEADERS)
        r.raise_for_status()
        creds = r.json().get('data', [])
        
        print(f"Found {len(creds)} credentials:")
        for c in creds:
            print(f"ID: {c['id']} | Name: {c['name']} | Type: {c['type']}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_creds()
