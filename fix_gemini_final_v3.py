import requests
import json
import uuid

# Configuration
API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}
WORKFLOW_ID = "WWFBfwaOceE8Jgke"
GOOGLE_KEY = "AIzaSyDkTcR207gn0vCRvfpj2x1qDABeYfe4Hdg"

def create_cred_and_link():
    # 1. Create NEW Credential
    # We use googlePalmApi type since googleGeminiApi failed
    print("Creating NEW 'googlePalmApi' credential...")
    cred_payload = {
        "name": f"Google Gemini Key (Sofi) {uuid.uuid4().hex[:4]}", 
        "type": "googlePalmApi",
        "data": {
            "apiKey": GOOGLE_KEY
        }
    }
    
    cred_id = None
    try:
        r = requests.post(f"{BASE_URL}/credentials", headers=HEADERS, json=cred_payload)
        if r.status_code == 200:
            cred_id = r.json()['id']
            print(f"Credential Created: {cred_id}")
        else:
            print(f"Failed to create credential: {r.text}")
            return

    except Exception as e:
        print(f"Error creating cred: {e}")
        return

    # 2. Link workflow
    print(f"Linking credential {cred_id} to workflow {WORKFLOW_ID}...")
    try:
        r_wf = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS)
        wf = r_wf.json()
        nodes = wf.get('nodes', [])
        updated = False
        
        gemini_node = next((n for n in nodes if 'gemini' in n['type'].lower()), None)
        if gemini_node:
            print(f"Updating Gemini Node: {gemini_node['name']}")
            gemini_node['credentials'] = {
                "googlePalmApi": {
                    "id": cred_id,
                    "name": cred_payload['name']
                }
            }
            updated = True
        
        if updated:
            payload = {
                "name": wf['name'],
                "nodes": nodes,
                "connections": wf['connections'],
                "settings": wf.get('settings', {})
            }
            r_up = requests.put(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS, json=payload)
            r_up.raise_for_status()
            print("Workflow updated successfully.")
        else:
            print("Gemini node not found, could not link.")

    except Exception as e:
         print(f"Error updating workflow: {e}")

if __name__ == "__main__":
    create_cred_and_link()
