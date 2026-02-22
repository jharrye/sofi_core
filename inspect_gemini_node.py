import requests
import json

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}
WORKFLOW_ID = "WWFBfwaOceE8Jgke"

def inspect():
    try:
        r = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS)
        if r.status_code != 200:
            print(f"Error fetching workflow: {r.status_code}")
            return
            
        wf = r.json()
        for node in wf['nodes']:
            if 'Gemini' in node['name'] or 'Gemini' in node['type']:
                print(f"Node Name: {node['name']}")
                print(f"Node Type: {node['type']}")
                print(f"Credentials Structure: {json.dumps(node.get('credentials', {}), indent=2)}")
                return

        print("Gemini node not found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect()
