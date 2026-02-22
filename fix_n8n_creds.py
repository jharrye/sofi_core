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
        payload = {
            "name": wf_data['name'],
            "nodes": wf_data['nodes'],
            "connections": wf_data['connections'],
            "settings": wf_data.get('settings', {})
        }
        
        r = requests.put(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS, json=payload)
        r.raise_for_status()
        print(f"Workflow updated successfully: {r.json()['id']}")
        return True
    except Exception as e:
        print(f"Error updating workflow: {e}")
        try:
            print(f"Server response: {e.response.text}")
        except:
            pass
        return False

def apply_cred_fix():
    print(f"Fetching workflow {WORKFLOW_ID}...")
    wf = get_workflow(WORKFLOW_ID)
    if not wf:
        return

    nodes = wf.get('nodes', [])
    updated = False
    
    # Locate Gemini Node
    gemini_node = next((n for n in nodes if 'gemini' in n['type'].lower()), None)
    if gemini_node:
        print(f"Found Gemini Node: {gemini_node['name']}")
        creds = gemini_node.get('credentials', {})
        print(f"Current Credentials: {creds}")
        
        # Check if using PaLM
        if 'googlePalmApi' in creds:
            print("Detected 'googlePalmApi'. Swapping to 'googleGeminiApi'...")
            palm_data = creds['googlePalmApi']
            
            # Create new structure
            new_creds = {
                "googleGeminiApi": {
                    "id": palm_data['id'],
                    "name": palm_data['name'] # Keep name, irrelevant for logic but good for UI
                }
            }
            
            gemini_node['credentials'] = new_creds
            updated = True
            print(f"New Credentials: {new_creds}")
        elif 'googleGeminiApi' in creds:
             print("Already using 'googleGeminiApi'. No change needed.")
        else:
             print("Unknown credential type or already correct.")

    if updated:
        wf['nodes'] = nodes
        update_workflow(wf)
    else:
        print("No changes required.")

if __name__ == "__main__":
    apply_cred_fix()
