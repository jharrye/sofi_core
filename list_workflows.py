import requests

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def list_workflows():
    try:
        r = requests.get(f"{BASE_URL}/workflows", headers=HEADERS)
        r.raise_for_status()
        workflows = r.json().get('data', [])
        print(f"Found {len(workflows)} workflows:")
        for w in workflows:
            print(f"ID: {w['id']} | Name: {w['name']} | Active: {w['active']}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_workflows()
