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
        r.raise_for_status()
        wf = r.json()
        print(f"Workflow: {wf['name']}")
        
        # Find AI Agent node
        ai_node = next((n for n in wf['nodes'] if n['name'] == 'AI Agent'), None)
        if ai_node:
            print("\nAI Agent Node Parameters:")
            print(json.dumps(ai_node.get('parameters', {}), indent=2))
        else:
            print("AI Agent node not found")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect()
