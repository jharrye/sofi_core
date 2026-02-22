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
GOOGLE_KEY = "AIzaSyDkTcR207gn0vCRvfpj2x1qDABeYfe4Hdg"
DEFAULT_CRED_ID = "bhLBi4XtAS9WkQkU" 

def update_cred_and_link():
    cred_id = DEFAULT_CRED_ID

    # 1. Update Existing Credential
    print(f"Updating credential {cred_id} with new API Key...")
    cred_payload = {
        "name": "Google Gemini(PaLM) Api account", 
        "type": "googlePalmApi",
        "data": {
            "apiKey": GOOGLE_KEY
        }
    }
    
    try:
        r = requests.put(f"{BASE_URL}/credentials/{cred_id}", headers=HEADERS, json=cred_payload)
        if r.status_code == 200:
            print(f"Credential Updated Successfully.")
        else:
            print(f"Failed to update credential: {r.text}")
            if r.status_code == 404:
                print("Credential not found, trying create new one...")
                r_new = requests.post(f"{BASE_URL}/credentials", headers=HEADERS, json=cred_payload)
                if r_new.status_code == 200:
                    cred_id = r_new.json()['id']
                    print(f"Created new credential: {cred_id}")
                else:
                    print(f"Failed create new: {r_new.text}")
                    return

    except Exception as e:
        print(f"Error updating cred: {e}")
        return

    # 2. Re-Link workflow
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
                    "name": "Google Gemini(PaLM) Api account"
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
    update_cred_and_link()
