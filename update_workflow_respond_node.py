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

def update_workflow():
    print(f"Fetching workflow {WORKFLOW_ID}...")
    try:
        r = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS)
        r.raise_for_status()
        wf = r.json()
    except Exception as e:
        print(f"Error fetching workflow: {e}")
        return

    # Backup
    backup_file = f"workflow_backup_{int(time.time())}.json"
    with open(backup_file, "w") as f:
        json.dump(wf, f, indent=2)
    print(f"Backup saved to {backup_file}")

    nodes = wf.get("nodes", [])
    connections = wf.get("connections", {})

    # Check if Respond to Webhook already exists
    if any(n["name"] == "Respond to Webhook" for n in nodes):
        print("Node 'Respond to Webhook' already exists. Aborting to avoid duplicates.")
        return

    # Find AI Agent node
    ai_agent_node = next((n for n in nodes if n["name"] == "AI Agent"), None)
    if not ai_agent_node:
        print("AI Agent node not found! Aborting.")
        return

    # Calculate position (200px to the right)
    new_fps = ai_agent_node.get("position", [0, 0])
    new_position = [new_fps[0] + 300, new_fps[1]]

    # Create new node
    new_node = {
        "parameters": {
            "respondWith": "json",
            "responseBody": "{\n  \"output\": \"{{ $json.output }}\"\n}"
        },
        "name": "Respond to Webhook",
        "type": "n8n-nodes-base.respondToWebhook",
        "typeVersion": 1,
        "position": new_position,
        "id": "respond-to-webhook-auto-added" 
    }
    
    # Note on responseBody: The user asked for "Response Body: Arrastra la respuesta de la IA. Debería verse algo como: {{ $json.output }} o {{ $json.text }}."
    # If "Respond With" is "JSON", the body expects a JSON string or object? 
    # Usually in n8n UI, "Respond With JSON" mode expects the "Response Body" field to be the literal JSON we want to send.
    # If we want to send { "output": "some text" }, we put that JSON there.
    # The user instruction: "Response Body: ... {{ $json.output }}" implies they want the raw text or a JSON object containing it?
    # "Respond With: JSON" forces the response header to application/json.
    # If the user literally puts "{{ $json.output }}" in the field, n8n might parse it as the whole body if it's an expression. 
    # Let's play it safe and wrap it in a JSON structure if that is what Make expects, OR just return the whole valid JSON object the user requested.
    # Wait, the user said: "Response Body: ... {{ $json.output }}".
    # If I put just `{{ $json.output }}` (which is a string), and content-type is JSON, it might be invalid JSON if not quoted.
    # Use simple expression: `{{ $json.output }}` assuming the output of AI Agent is ALREADY a JSON object?
    # Specify the parameter as a string that evaluates to the content.
    # Let's use the explicit string: "={{ $json.output }}" which is an expression in n8n.
    # BUT, via API, logic is slightly different.
    # Let's set it to valid JSON object construction:
    # "responseBody": "={{ { \"text\": $json.output } }}" ?
    # Re-reading user request: "Response Body: Arrastra la respuesta de la IA. Debería verse algo como: {{ $json.output }} o {{ $json.text }}."
    # I will set it to use the expression `={{ $json.output }}` directly.
    
    new_node["parameters"]["responseBody"] = "={{ $json.output }}"

    nodes.append(new_node)

    # Add connection
    if "AI Agent" not in connections:
        connections["AI Agent"] = {"main": []}
    
    if "main" not in connections["AI Agent"]:
         connections["AI Agent"]["main"] = []

    if not connections["AI Agent"]["main"]:
        connections["AI Agent"]["main"].append([])

    connections["AI Agent"]["main"][0].append({
        "node": "Respond to Webhook",
        "type": "main",
        "index": 0
    })

    wf["nodes"] = nodes
    wf["connections"] = connections

    print("Updating workflow...")
    try:
        payload = {
            "name": wf["name"],
            "nodes": nodes,
            "connections": connections,
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

if __name__ == "__main__":
    update_workflow()
