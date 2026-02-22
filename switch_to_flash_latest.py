import requests
import json

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}
WORKFLOW_ID = "WWFBfwaOceE8Jgke"
NEW_MODEL_NAME = "models/gemini-flash-latest"

def update_model_to_latest():
    print(f"Updating workflow {WORKFLOW_ID} to use model: {NEW_MODEL_NAME}")
    try:
        r_wf = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS)
        r_wf.raise_for_status()
        wf = r_wf.json()
        nodes = wf.get('nodes', [])
        
        updated = False
        gemini_node = next((n for n in nodes if 'gemini' in n['type'].lower()), None)
        
        if gemini_node:
            print(f"Found Gemini Node: {gemini_node['name']}")
            current_model = gemini_node.get('parameters', {}).get('modelName')
            print(f"Current Model: {current_model}")
            
            if current_model != NEW_MODEL_NAME:
                if 'parameters' not in gemini_node:
                    gemini_node['parameters'] = {}
                gemini_node['parameters']['modelName'] = NEW_MODEL_NAME
                updated = True
                print(f"Updated to: {NEW_MODEL_NAME}")
            else:
                print("Model name is already correct.")
                
        if updated:
            payload = { 
                "name": wf['name'], 
                "nodes": nodes, 
                "connections": wf['connections'], 
                "settings": wf['settings'] 
            }
            r_up = requests.put(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS, json=payload)
            r_up.raise_for_status()
            print("Workflow saved successfully.")
        else:
            print("No changes needed or node not found.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_model_to_latest()
