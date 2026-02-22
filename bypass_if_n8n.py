import requests
import json

# Configuration
API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

WORKFLOW_ID = "WWFBfwaOceE8Jgke"

def get_workflow(wf_id):
    try:
        r = requests.get(f"{BASE_URL}/workflows/{wf_id}", headers=HEADERS)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"Error getting workflow: {e}")
        return None

def update_workflow(wf_data):
    try:
        payload = {
            "name": wf_data['name'],
            "nodes": wf_data['nodes'],
            "connections": wf_data['connections'],
            "settings": wf_data.get('settings', {})
        }
        r = requests.put(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS, json=payload)
        r.raise_for_status()
        print(f"Workflow updated successfully: {r.json()['id']}")
    except Exception as e:
        print(f"Update failed: {e}")

def bypass_if_node():
    print("Fetching workflow to bypass 'If' node...")
    wf = get_workflow(WORKFLOW_ID)
    if not wf: return

    nodes = wf['nodes']
    connections = wf['connections']

    # 1. Update Connection: Router Logic -> AI Agent DIRECTLY
    print("Updating connection: Router Logic -> AI Agent")
    connections["Router Logic"] = {
        "main": [
            [
                {
                    "node": "AI Agent",
                    "type": "main",
                    "index": 0
                }
            ]
        ]
    }

    # 2. Update AI Agent Input Mapping to be robust
    # Instead of $json.body (which might be the router output), 
    # we reference the Webhook node specifically.
    print("Updating AI Agent Prompt to reference Webhook node specifically...")
    ai_node = next((n for n in nodes if 'agent' in n['type'].lower()), None)
    if ai_node:
        # Robust Mapping: Try to get body from webhook item
        # Syntax: {{ $('WhatsApp Webhook').item.json.body }}
        # Fallback if that syntax is tricky in python string: '{{ $("WhatsApp Webhook").item.json.body }}'
        # But safest is usually: {{ $node["WhatsApp Webhook"].json.body }}
        
        new_prompt = '{{ $node["WhatsApp Webhook"].json.body }}'
        ai_node['parameters']['text'] = new_prompt
        print(f"New Prompt Expression: {new_prompt}")
    
    wf['nodes'] = nodes
    wf['connections'] = connections
    
    update_workflow(wf)

if __name__ == "__main__":
    bypass_if_node()
