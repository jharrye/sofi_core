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

def create_credential():
    # Debug: Try listing to see existing structure
    try:
        print("Attempting to list credentials...")
        r = requests.get(f"{BASE_URL}/credentials", headers=HEADERS) # Try without slash
        if r.status_code == 405:
             r = requests.get(f"{BASE_URL}/credentials/", headers=HEADERS) # Try with slash
        
        if r.status_code == 200:
            data = r.json().get('data', [])
            print(f"List success. Found {len(data)} credentials.")
            if len(data) > 0:
                print(f"Sample type: {data[0].get('type')}")
        else:
            print(f"List failed: {r.status_code} {r.text}")
    except Exception as e:
        print(f"List error: {e}")

    # Create New
    # Payload strategy: Minimal first, then add fields.
    # Actually, Supabase needs 'ssl'. 
    # Let's try sending as 'postgres' type (lowercase).
    
    current_payload = {
        "name": CRED_NAME,
        "type": "postgres",
        "data": {
            "host": "db.otwrjisvqfmlwngbsoiq.supabase.co",
            "user": "n8n_app",
            "password": "YOUR_DATABASE_PASSWORD",
            "database": "postgres",
            "port": 6543,
            "ssl": "require" # Back to string, most likely correct
        }
    }
    
    print(f"Sending Credential Payload: {json.dumps(current_payload, indent=2)}")
    
    try:
        r = requests.post(f"{BASE_URL}/credentials", headers=HEADERS, json=current_payload)
        
        if r.status_code == 200:
            id = r.json()['id']
            print(f"Created Credential '{CRED_NAME}' (ID: {id})")
            return id
        else:
            print(f"Creation failed: {r.status_code}")
            print(f"Response: {r.text}")
            return None
            
    except Exception as e:
        print(f"Error creating credential: {e}")
        return None

def update_workflow(cred_id):
    try:
        r = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS)
        r.raise_for_status()
        wf = r.json()
        
        # Update nodes
        updated = False
        for node in wf['nodes']:
            if node['name'] == "Router Logic":
                print("Updating 'Router Logic' node with new credential...")
                node['credentials'] = {
                    "postgres": {
                        "id": cred_id,
                        "name": CRED_NAME
                    }
                }
                # Ensure SQL and parameters are strict
                node['parameters']['query'] = "SELECT * FROM handle_router_logic($1, $2, $3)"
                updated = True
                
        if updated:
            # PUT update
            # n8n API sometimes requires 'connections' and 'nodes' at top level, stripped of extra props
            payload = {
                "nodes": wf['nodes'],
                "connections": wf['connections'],
                "settings": wf.get('settings', {}),
                "name": wf['name'],
                "active": wf['active'] 
            }
            # n8n V1 API doesn't allow updating boolean active directly in update? Let's try.
            # actually usually you PUT to /workflows/:id
            
            r_up = requests.put(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS, json=payload)
            r_up.raise_for_status()
            print("Workflow updated successfully.")
        else:
            print("Target node 'Router Logic' not found.")
            
    except Exception as e:
        print(f"Error updating workflow: {e}")
        try:
            print(f"Response: {e.response.text}")
        except:
            pass

if __name__ == "__main__":
    cred_id = create_credential()
    if cred_id:
        update_workflow(cred_id)
