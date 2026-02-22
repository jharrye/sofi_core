import requests
import json

# Configuration
API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def inspect_hanging_execution(exec_id):
    print(f"Inspecting execution {exec_id} details...")
    try:
        r = requests.get(f"{BASE_URL}/executions/{exec_id}", headers=HEADERS)
        r.raise_for_status()
        details = r.json()
        
        # Check running state
        print(f"Finished: {details.get('finished')}")
        print(f"StoppedAt: {details.get('stoppedAt')}")

        # Check last executed node
        run_data = details.get('data', {}).get('resultData', {}).get('runData', {})
        
        print("\n--- Executed Nodes Order ---")
        # Estimate order by start time if available, or just list them
        nodes_executed = []
        for node_name, node_runs in run_data.items():
            run_count = len(node_runs)
            last_run = node_runs[-1] if node_runs else {}
            start_time = last_run.get('startTime')
            error = last_run.get('error')
            
            nodes_executed.append({
                "name": node_name,
                "count": run_count,
                "startTime": start_time,
                "error": error
            })
            
        # Sort by start time
        nodes_executed.sort(key=lambda x: x['startTime'] or 0)
        
        for n in nodes_executed:
            err_msg = "[ERROR]" if n['error'] else "OK"
            print(f"{n['startTime']} | {n['name']} ({n['count']} runs) - {err_msg}")
            if n['error']:
                 print(f"   -> {n['error']['message']}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_hanging_execution('51')
