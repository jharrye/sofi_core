import requests
import json
import sys

# Configuration
API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def get_workflows():
    try:
        r = requests.get(f"{BASE_URL}/workflows", headers=HEADERS)
        r.raise_for_status()
        return r.json().get('data', [])
    except Exception as e:
        print(f"Error listing workflows: {e}")
        return []

def get_workflow_details(wf_id):
    try:
        r = requests.get(f"{BASE_URL}/workflows/{wf_id}", headers=HEADERS)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"Error getting workflow {wf_id}: {e}")
        return None

def main():
    workflows = get_workflows()
    target_wf = None
    for wf in workflows:
        if wf['id'] == "WWFBfwaOceE8Jgke":
            target_wf = wf
            break
    
    if not target_wf and workflows:
         # Fallback search
        for wf in workflows:
            if "AI" in wf['name'] or "Gemini" in wf['name']:
                target_wf = wf
                break

    if target_wf:
        print(f"ANALYZING_WORKFLOW: {target_wf['name']} ({target_wf['id']})")
        details = get_workflow_details(target_wf['id'])
        if details:
            nodes = details.get('nodes', [])
            connections = details.get('connections', {})
            
            # 1. Check Connections
            print("\n--- CONNECTIONS ---")
            print(json.dumps(connections, indent=2))
            
            # 2. Inspect Specific Nodes
            ai_agent = next((n for n in nodes if 'agent' in n['type'].lower() or 'chain' in n['type'].lower()), None)
            gemini = next((n for n in nodes if 'gemini' in n['type'].lower()), None)
            webhook = next((n for n in nodes if 'webhook' in n['type'].lower()), None)
            
            print("\n--- NODE DETAILS ---")
            if webhook:
                print(f"WEBHOOK: {webhook['name']}")
                # Check what it sends? usually just inputs.
            
            if ai_agent:
                print(f"AI AGENT: {ai_agent['name']}")
                print(f"  Type: {ai_agent['type']}")
                print(f"  Parameters: {json.dumps(ai_agent.get('parameters', {}), indent=2)}")
                # Check inputs
                inputs = ai_agent.get('typeVersion', 1) 
                # Note: inputs are defined by connections pointing TO it.
            else:
                print("AI AGENT: NOT FOUND")

            if gemini:
                print(f"GEMINI: {gemini['name']}")
                print(f"  Credentials: {gemini.get('credentials', 'NONE')}")
                print(f"  Parameters: {json.dumps(gemini.get('parameters', {}), indent=2)}")
            else:
                print("GEMINI: NOT FOUND")

if __name__ == "__main__":
    main()
