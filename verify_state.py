import requests
import json

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}
WORKFLOW_ID = "WWFBfwaOceE8Jgke"

def verify_state():
    print("--- 1. Checking Active Workflow Configuration ---")
    try:
        r = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS)
        wf = r.json()
        
        nodes = wf.get('nodes', [])
        connections = wf.get('connections', {})
        
        # Check Gemini Node
        gemini = next((n for n in nodes if 'gemini' in n['type'].lower()), None)
        if gemini:
            print(f"Gemini Model: {gemini['parameters'].get('modelName')}")
            print(f"Gemini Creds: {gemini.get('credentials')}")
        else:
            print("Gemini Node: MISSING")

        # Check AI Agent
        agent = next((n for n in nodes if 'agent' in n['type'].lower()), None)
        if agent:
            print(f"Agent Prompt: {agent['parameters'].get('text')}")
        
        # Check Connections
        print("Connections from Router Logic:")
        if "Router Logic" in connections:
            print(json.dumps(connections["Router Logic"], indent=2))
        else:
            print("Router Logic is disconnected!")

    except Exception as e:
        print(f"Error checking workflow: {e}")

    print("\n--- 2. Fetching Latest Error Details ---")
    try:
        r = requests.get(f"{BASE_URL}/executions?limit=1&includeData=true", headers=HEADERS)
        data = r.json().get('data', [])
        if data:
            last_id = data[0]['id']
            # Sometimes list doesn't include full data even with param, need individual fetch
            r_det = requests.get(f"{BASE_URL}/executions/{last_id}?includeData=true", headers=HEADERS)
            details = r_det.json()
            
            # Print specifically the error data
            run_data = details.get('data', {}).get('resultData', {}).get('runData', {})
            error_found = False
            for node, runs in run_data.items():
                for run in runs:
                     if 'error' in run:
                         error_found = True
                         print(f"ERROR in Node '{node}':")
                         print(json.dumps(run['error'], indent=2))
            
            if not error_found:
                print("No specific node error found in execution data.")
                print(f"Status: {details.get('status')}")
                if details.get('status') == 'error':
                    # Check top level error
                    print("Top Level Error info (if any):")
                    # Sometimes n8n puts error at top level for crasher
                    print(details.get('data', {}).get('resultData', {}).get('error'))

    except Exception as e:
        print(f"Error fetching logs: {e}")

if __name__ == "__main__":
    verify_state()
