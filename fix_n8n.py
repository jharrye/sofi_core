import requests
import json
import uuid

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def list_workflows():
    try:
        r = requests.get(f"{BASE_URL}/workflows", headers=HEADERS)
        r.raise_for_status()
        return r.json().get('data', [])
    except Exception as e:
        print(f"Error listing workflows: {e}")
        return []

def list_credentials():
    try:
        r = requests.get(f"{BASE_URL}/credentials", headers=HEADERS)
        r.raise_for_status()
        return r.json().get('data', [])
    except Exception as e:
        print(f"Error listing credentials: {e}")
        return []

def delete_workflow(wf_id):
    try:
        r = requests.delete(f"{BASE_URL}/workflows/{wf_id}", headers=HEADERS)
        print(f"Deleted workflow {wf_id}: {r.status_code}")
    except Exception as e:
        print(f"Error deleting workflow {wf_id}: {e}")

def create_workflow(cred_id=None):
    webhook_id = str(uuid.uuid4())
    
    postgres_node = {
        "parameters": {
            "operation": "executeQuery",
            "query": "SELECT * FROM handle_router_logic($1, $2, $3)",
            "additionalFields": {
                "queryParams": "{{ $json.body.wa_phone }}, {{ $json.body.wa_message_id }}, {{ JSON.stringify($json.body) }}"
            }
        },
        "name": "Router Logic",
        "type": "n8n-nodes-base.postgres",
        "typeVersion": 1,
        "position": [680, 460],
        "id": str(uuid.uuid4())
    }

    if cred_id:
        postgres_node["credentials"] = {
            "postgres": {
                "id": cred_id,
                "name": "Supabase Postgres"
            }
        }
    
    # Define nodes with proper JSON structure
    nodes = [
        {
            "parameters": {
                "path": "whatsapp-webhook",
                "responseMode": "lastNode",
                "options": {}
            },
            "name": "WhatsApp Webhook",
            "type": "n8n-nodes-base.webhook",
            "typeVersion": 1,
            "position": [460, 460],
            "webhookId": webhook_id,
            "id": str(uuid.uuid4())
        },
        postgres_node
    ]

    connections = {
        "WhatsApp Webhook": {
            "main": [
                [
                    {
                        "node": "Router Logic",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        }
    }

    payload = {
        "name": "WhatsApp Router Flow",
        "nodes": nodes,
        "connections": connections,
        "settings": {
            "executionOrder": "v1"
        }
    }

    try:
        r = requests.post(f"{BASE_URL}/workflows", headers=HEADERS, json=payload)
        r.raise_for_status()
        wf = r.json()
        print(f"Created Workflow: {wf['id']}")
        
        # Activate
        r_act = requests.post(f"{BASE_URL}/workflows/{wf['id']}/activate", headers=HEADERS)
        if r_act.status_code == 200:
            print("Workflow Activated")
        else:
            print(f"Failed to activate: {r_act.text}")
            
    except requests.exceptions.HTTPError as e:
        print(f"Error creating workflow: {e}")
        print(f"Response: {e.response.text}")
    except Exception as e:
        print(f"Error creating workflow: {e}")

if __name__ == "__main__":
    print("Checking for existing credentials...")
    creds = list_credentials()
    postgres_cred_id = None
    for c in creds:
        # Check against name or type
        if c.get('name') == "Supabase Postgres" or c.get('type') == "postgres":
            print(f"Found Credential: {c['name']} (ID: {c['id']})")
            postgres_cred_id = c['id']
            break
    
    if not postgres_cred_id:
        print("No 'Supabase Postgres' credential found. Creating workflow without bonded credential.")

    print("Cleaning up old workflows...")
    current_wfs = list_workflows()
    for wf in current_wfs:
        if wf['name'] == "WhatsApp Router Flow":
            print(f"Deleting existing corrupted workflow: {wf['id']}")
            delete_workflow(wf['id'])
    
    print("Creating new workflow...")
    create_workflow(postgres_cred_id)
