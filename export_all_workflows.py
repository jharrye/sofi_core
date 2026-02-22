import requests
import json

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def list_detailed():
    try:
        r = requests.get(f"{BASE_URL}/workflows", headers=HEADERS)
        r.raise_for_status()
        workflows = r.json().get('data', [])
        
        all_data = []
        for w in workflows:
            wid = w['id']
            rw = requests.get(f"{BASE_URL}/workflows/{wid}", headers=HEADERS)
            rw.raise_for_status()
            data = rw.json()
            all_data.append(data)
            print(f"Fetched: {data['name']} (ID: {wid})")
            
        with open("all_workflows_dump.json", "w") as f:
            json.dump(all_data, f, indent=2)
        print("\nAll workflows dumped to all_workflows_dump.json")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_detailed()
