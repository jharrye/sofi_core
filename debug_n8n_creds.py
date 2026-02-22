import requests
import json

# Configuration
API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def inspect_credentials_and_node():
    print("--- Listing All Credentials ---")
    try:
        r = requests.get(f"{BASE_URL}/credentials", headers=HEADERS)
        r.raise_for_status()
        creds = r.json().get('data', [])
        
        gemini_creds = []
        for c in creds:
             if "google" in c['name'].lower() or "gemini" in c['name'].lower() or "palm" in c['name'].lower():
                 print(f"Found Credential: {c['name']} (ID: {c['id']}, Type: {c['type']})")
                 gemini_creds.append(c)
        
        if not gemini_creds:
            print("No Google/Gemini credentials found!")

        print("\n--- Checking Workflow Node Config ---")
        wf_id = "WWFBfwaOceE8Jgke"
        r_wf = requests.get(f"{BASE_URL}/workflows/{wf_id}", headers=HEADERS)
        wf = r_wf.json()
        
        nodes = wf.get('nodes', [])
        gemini_node = next((n for n in nodes if 'gemini' in n['type'].lower()), None)
        
        if gemini_node:
            print(f"Gemini Node: {gemini_node['name']}")
            print(f"  Type: {gemini_node['type']}")
            print(f"  Current Configured Credentials: {gemini_node.get('credentials')}")
            print(f"  Parameters: {gemini_node.get('parameters')}")
        else:
            print("Gemini Node NOT FOUND in workflow.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_credentials_and_node()
