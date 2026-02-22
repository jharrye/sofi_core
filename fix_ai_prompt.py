import requests
import json
import time

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}
WORKFLOW_ID = "WWFBfwaOceE8Jgke"

def fix_prompt():
    print(f"Fetching workflow {WORKFLOW_ID}...")
    try:
        r = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS)
        r.raise_for_status()
        wf = r.json()
    except Exception as e:
        print(f"Error fetching workflow: {e}")
        return

    # Backup
    backup_file = f"workflow_backup_prompt_{int(time.time())}.json"
    with open(backup_file, "w") as f:
        json.dump(wf, f, indent=2)
    print(f"Backup saved to {backup_file}")

    nodes = wf.get("nodes", [])
    updated = False

    # Find AI Agent node
    for node in nodes:
        if node["name"] == "AI Agent":
            print("Found AI Agent node.")
            params = node.get("parameters", {})
            current_text = params.get("text", "")
            
            print(f"Current Prompt: {current_text}")
            
            new_text = "={{ $('WhatsApp Webhook').item.json.body.body }}"
            
            if current_text != new_text:
                params["text"] = new_text
                node["parameters"] = params
                updated = True
                print(f"Updated Prompt to: {new_text}")
            else:
                print("Prompt already correct.")
            break
    
    if updated:
        wf["nodes"] = nodes
        print("Pushing update to n8n...")
        try:
            payload = {
                "name": wf["name"],
                "nodes": nodes,
                "connections": wf["connections"],
                "settings": wf.get("settings", {})
            }
            
            r = requests.put(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS, json=payload)
            r.raise_for_status()
            print(f"Workflow updated successfully! ID: {r.json()['id']}")
            
        except Exception as e:
            print(f"Error updating workflow: {e}")
            try:
                 print(r.text)
            except:
                pass
    else:
        print("No changes needed.")

if __name__ == "__main__":
    fix_prompt()
