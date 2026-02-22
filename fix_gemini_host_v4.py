import requests
import json
import uuid

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}
WORKFLOW_ID = "WWFBfwaOceE8Jgke"
GOOGLE_KEY = "AIzaSyDkTcR207gn0vCRvfpj2x1qDABeYfe4Hdg"

def create_cred_with_host():
    cred_payload = {
        "name": f"Google Gemini Key (Sofi) {uuid.uuid4().hex[:4]}", 
        "type": "googlePalmApi",
        "data": {
            "apiKey": GOOGLE_KEY,
            "host": "generativelanguage.googleapis.com" # Required by validator apparently
        }
    }
    
    print("Creating 'googlePalmApi' WITH host...")
    cred_id = None
    try:
        r = requests.post(f"{BASE_URL}/credentials", headers=HEADERS, json=cred_payload)
        if r.status_code == 200:
            cred_id = r.json()['id']
            print(f"Credential Created: {cred_id}")
        else:
            print(f"Failed to create: {r.text}")
            return
    except Exception as e:
        print(f"Error: {e}")
        return

    # Link
    print(f"Linking {cred_id}...")
    try:
        r_wf = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS)
        wf = r_wf.json()
        nodes = wf.get('nodes', [])
        
        gemini_node = next((n for n in nodes if 'gemini' in n['type'].lower()), None)
        if gemini_node:
            gemini_node['credentials'] = {
                "googlePalmApi": {
                    "id": cred_id,
                    "name": cred_payload['name']
                }
            }
            # Update workflow
            payload = { "name": wf['name'], "nodes": nodes, "connections": wf['connections'], "settings": wf['settings'] }
            r_up = requests.put(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS, json=payload)
            r_up.raise_for_status()
            print("Workflow updated.")
            
    except Exception as e:
        print(f"Error updating: {e}")

if __name__ == "__main__":
    create_cred_with_host()
