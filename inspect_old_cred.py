import requests
import json

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}
OLD_CRED_ID = "bhLBi4XtAS9WkQkU"

def inspect_creds():
    print(f"Inspecting credential {OLD_CRED_ID}...")
    try:
        # We need to GET the credential to see its structure (metadata)
        r = requests.get(f"{BASE_URL}/credentials/{OLD_CRED_ID}", headers=HEADERS)
        if r.status_code == 200:
            c = r.json()
            print("Credential Found:")
            print(f"Type: {c['type']}")
            print(f"Name: {c['name']}")
            print(f"Data Keys: {c.get('data', {}).keys()}")
            # We can't see the values but we can see the KEYS present (usually)
            # Actually n8n typically returns data: { apiKey: "..." } masked
        else:
            print(f"Error {r.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_creds()
