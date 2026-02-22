import requests
import json

# Configuration
API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}



def get_recent_execution_error():
    print("Fetching recent executions...")
    try:
        # Get last 50 executions
        r = requests.get(f"{BASE_URL}/executions?limit=50", headers=HEADERS)
        r.raise_for_status()
        executions = r.json().get('data', [])
        
        if not executions:
            print("No executions found.")
            return

        print(f"Found {len(executions)} recent executions.")
        print("Timestamp | ID | Status")
        for ex in executions[:20]: # Print top 20
             print(f"{ex['startedAt']} | {ex['id']} | {ex.get('finished', '?')} | {ex.get('status', '?')}")
        
        # Analyze density
        if len(executions) > 1:
             first_time = executions[0]['startedAt']
             last_time = executions[-1]['startedAt']
             print(f"\nTime span: {last_time} to {first_time}")
             
        latest = executions[0]
        
        # Get full details of the latest execution
        r_det = requests.get(f"{BASE_URL}/executions/{latest['id']}", headers=HEADERS)
        r_det.raise_for_status()

        details = r_det.json()
        print(f"Full Details Dump: {json.dumps(details, indent=2)}")
        

        # Check for top-level error in execution metadata
        if details.get('data', {}).get('resultData', {}).get('error'):
             print(f"\n[CRITICAL] Execution failed with error:")
             print(json.dumps(details['data']['resultData']['error'], indent=2))
        
        run_data = details.get('data', {}).get('resultData', {}).get('runData', {})
        
        error_found = False
        gemini_output_found = False
        
        for node_name, node_runs in run_data.items():
            # Check for errors
            for run_idx, run_info in enumerate(node_runs):
                if 'error' in run_info:
                    error_found = True
                    err = run_info['error']
                    print(f"\n[ERROR] Node: '{node_name}'")
                    print(f"  Message: {err.get('message')}")
                    print(f"  Details: {json.dumps(err.get('description') or err, indent=2)}")
                    print(f"  Timestamp: {run_info.get('startTime')}")

            # detailed check for Gemini nodes
            if 'gemini' in node_name.lower():
                gemini_output_found = True
                print(f"\n[INFO] Gemini Node '{node_name}' output:")
                for run_idx, run_info in enumerate(node_runs):
                    # print the output data (first item usually)
                    try:
                        output_data = run_info.get('data', {}).get('main', [])[0]
                        print(f"  Run {run_idx+1}: {json.dumps(output_data, indent=2)}")
                    except Exception as e:
                        print(f"  Run {run_idx+1}: Could not parse output data ({e})")

        if not error_found:
            print("\nLatest execution finished without explicit node errors (or status was success).")
            
        if not gemini_output_found:
            print("\n[WARNING] No 'Gemini' node execution found in the latest run.")

    except Exception as e:
        print(f"Error analyzing executions: {e}")

if __name__ == "__main__":
    get_recent_execution_error()
