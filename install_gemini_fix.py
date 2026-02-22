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
GEMINI_API_KEY = "gen-lang-client-0839524145"
CRED_NAME = "Google Gemini Account Auto"

def create_credential():
    print(f"Creating credential '{CRED_NAME}'...")
    payload = {
        "name": CRED_NAME,
        "type": "googlePalmApi",
        "data": {
            "apiKey": GEMINI_API_KEY,
            "host": ""
        }
    }
    
    try:
        r = requests.post(f"{BASE_URL}/credentials", headers=HEADERS, json=payload)
        if r.status_code == 200:
            cred_id = r.json()['id']
            print(f"Credential created! ID: {cred_id}")
            return cred_id
        else:
            print(f"Failed to create credential: {r.text}")
            return None
    except Exception as e:
        print(f"Error creating credential: {e}")
        return None

def update_workflow(cred_id):
    print(f"Fetching workflow {WORKFLOW_ID}...")
    try:
        r = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS)
        if r.status_code != 200:
            print(f"Failed to fetch workflow: {r.text}")
            return

        wf = r.json()
        updated = False
        
        for node in wf['nodes']:
            # Update Gemini Model Node
            if node['type'] == '@n8n/n8n-nodes-langchain.lmChatGoogleGemini':
                print("Updating Google Gemini Chat Model node...")
                node['parameters']['modelName'] = "models/gemini-1.5-flash"
                node['credentials'] = {
                    "googlePalmApi": {
                        "id": cred_id,
                        "name": CRED_NAME
                    }
                }
                updated = True

            # Update AI Agent Node
            if node['type'] == '@n8n/n8n-nodes-langchain.agent':
                print("Updating AI Agent node...")
                node['parameters']['text'] = "={{ $json.body.body }}"
                node['parameters']['options'] = {
                    "systemMessage": "Eres Sofi, la asistente virtual de EstiloPlus. Eres amable, profesional y respondes de forma concisa."
                }
                updated = True

        if updated:
            print("Saving workflow updates...")
            # Prepare payload for update (removing read-only fields if necessary, though n8n often accepts full object)
            # Safe way: active is handled separately usually, but let's try full payload
            payload = {
                "nodes": wf['nodes'],
                "connections": wf['connections'],
                "settings": wf.get('settings', {}),
                "name": wf['name']
                # "active": wf['active']  <-- REMOVED: Read-only
            }
            
            r_up = requests.put(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS, json=payload)
            if r_up.status_code == 200:
                print("Workflow updated successfully!")
            else:
                 print(f"Failed to update workflow: {r_up.text}")
        else:
            print("No Gemini or AI Agent nodes found to update.")

    except Exception as e:
        print(f"Error updating workflow: {e}")

if __name__ == "__main__":
    # cid = create_credential()
    cid = "2iHQdT5bjBoLFcu8" # Reusing created credential
    if cid:
        update_workflow(cid)
