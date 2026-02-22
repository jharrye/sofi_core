import requests
import json
import copy

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
        # Prepare payload - EXCLUDE read-only fields like 'active', 'id', 'created', 'updated'
        payload = {
            "name": wf_data['name'],
            "nodes": wf_data['nodes'],
            "connections": wf_data['connections'],
            "settings": wf_data.get('settings', {}),
            # "active": ... DO NOT SEND ACTIVE
        }
        
        r = requests.put(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS, json=payload)
        r.raise_for_status()
        print(f"Workflow updated successfully: {r.json()['id']}")
        
        # If we need to reactivate, we should do it separately, but usually not needed if it stays active.
        return True
    except Exception as e:
        print(f"Error updating workflow: {e}")
        try:
            print(f"Server response: {e.response.text}")
        except:
            pass
        return False

def apply_fixes():
    print(f"Fetching workflow {WORKFLOW_ID}...")
    wf = get_workflow(WORKFLOW_ID)
    if not wf:
        return

    nodes = wf.get('nodes', [])
    connections = wf.get('connections', {})
    

    # 2. FIX GEMINI NODE
    print("Fixing Gemini Node Model...")
    gemini_node = next((n for n in nodes if 'gemini' in n['type'].lower()), None)
    if gemini_node:
        current_model = gemini_node['parameters'].get('modelName')
        print(f"  Current Model: {current_model}")
        # Use the model confirmed to be available
        gemini_node['parameters']['modelName'] = 'models/gemini-flash-latest'
        print(f"  New Model: {gemini_node['parameters']['modelName']}")
    else:
        print("  WARNING: Gemini node not found!")

    # 3. FIX AI AGENT MAPPING
    print("Fixing AI Agent Prompt Mapping...")
    ai_node = next((n for n in nodes if 'agent' in n['type'].lower()), None)
    if ai_node:
        current_text = ai_node['parameters'].get('text')
        print(f"  Current Text: {current_text}")
        # Ensure it maps to the input
        # Note: Depending on previous flow, it might be json.body or json.message
        # We will keep it safe or just log it.
        # ai_node['parameters']['text'] = "{{ $json.body }}" 
    else:
        print("  WARNING: AI Agent node not found!")

    # Apply changes
    wf['nodes'] = nodes
    wf['connections'] = connections
    
    update_workflow(wf)

if __name__ == "__main__":
    apply_fixes()
