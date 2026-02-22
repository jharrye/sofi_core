import requests
import json
import sys

API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def dump_last_execution():
    print("Fetching last execution...")
    try:
        r = requests.get(f"{BASE_URL}/executions?limit=1", headers=HEADERS)
        r.raise_for_status()
        data = r.json().get('data', [])
        
        if not data:
            print("No executions found.")
            return
            
        last_id = data[0]['id']
        print(f"Dumping execution {last_id}...")
        

        r_det = requests.get(f"{BASE_URL}/executions/{last_id}?includeData=true", headers=HEADERS)
        r_det.raise_for_status()
        
        full_data = r_det.json()
        
        with open('last_execution.json', 'w', encoding='utf-8') as f:
            json.dump(full_data, f, indent=2)
            
        print("Done. Saved to last_execution.json")

        # Analysis
        run_data = full_data.get('data', {}).get('resultData', {}).get('runData', {})
        print("\n--- Execution Analysis ---")
        for node_name, runs in run_data.items():
            print(f"Node: {node_name}")
            print(f"  Execution Count: {len(runs)}")
            for i, run in enumerate(runs):
                inputs = run.get('data', {}).get('main', [[]])[0] # simplistic
                outputs = run.get('data', {}).get('main', [[]])[0] # simplistic
                if 'error' in run:
                     print(f"  Run {i+1}: ERROR - {run['error']['message']}")
                else:
                     # Calculate total items
                     input_count = 0 
                     # input structure: run['data']['main'][input_index] = [item1, item2...]
                     # output structure similar
                     
                     # Actually let's just count top level list length for 'main'
                     # Warning: structure is confusing. inputData vs data?
                     # In runData: inputs are NOT stored, only outputs.
                     # Inputs are inferred from previous node outputs.
                     
                     # But we can see output count

                     try:
                        output_items = len(run.get('data', {}).get('main', [[]])[0])
                        print(f"  Run {i+1}: Output Items: {output_items}")
                     except:
                        print(f"  Run {i+1}: Could not determine output count")


            if 'webhook' in node_name.lower():
                 try:
                    output_data = run.get('data', {}).get('main', [[]])[0][0]
                    body = output_data.get('json', {}).get('body')
                    print(f"  [DEBUG] Webhook Body: {json.dumps(body, indent=2)[:500]} ...") # Truncate
                 except:
                    pass
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    dump_last_execution()
