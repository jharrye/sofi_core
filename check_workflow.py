import requests
import json

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}
WORKFLOW_ID = "WWFBfwaOceE8Jgke"

try:
    print(f"Checking workflow {WORKFLOW_ID}...")
    r = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS)
    if r.status_code == 200:
        wf = r.json()
        print(f"Workflow Found: {wf['name']}")
        print(f"Node count: {len(wf['nodes'])}")
        # Check for Gemini nodes
        gemini_nodes = [n for n in wf['nodes'] if 'Gemini' in n['type'] or 'Gemini' in n['name']]
        print(f"Existing Gemini nodes: {[n['name'] for n in gemini_nodes]}")
    else:
        print(f"Workflow not found: {r.status_code}")
except Exception as e:
    print(f"Error: {e}")
