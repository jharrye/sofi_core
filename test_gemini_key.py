import requests
import json
import os

# Key from fix_gemini_fallback_v2.py
API_KEY = os.getenv("GEMINI_API_KEY", "your_gemini_key_here")

def test_key():
    print(f"Testing Gemini API Key: {API_KEY[:5]}...{API_KEY[-5:]}")
    
    # Try listing models - a simple read operation
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("SUCCESS: API Key is valid and API is enabled.")
            data = response.json()
            # Check if 1.5 flash is in the list

            models = [m['name'] for m in data.get('models', [])]
            print(f"Available models count: {len(models)}")
            print("Available models:", models)
            if "models/gemini-1.5-flash" in models:
                print("Confirmed: models/gemini-1.5-flash is available.")
            else:
                print("WARNING: models/gemini-1.5-flash NOT found in list.")
        else:
            print("FAILURE: API Key request failed.")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error testing key: {e}")

if __name__ == "__main__":
    test_key()
