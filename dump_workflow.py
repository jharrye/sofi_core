import requests
import json

# Configuration
API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")
BASE_URL = "http://localhost:5678/api/v1"
HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}
WORKFLOW_ID = "WWFBfwaOceE8Jgke"

def dump_workflow():
    try:
        r = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=HEADERS)
        r.raise_for_status()
        wf = r.json()
        
        print(f"Workflow: {wf['name']} (ID: {wf['id']})")
        
        nodes = wf.get('nodes', [])
        print(f"\nNodes ({len(nodes)}):")
        node_map = {n['name']: n for n in nodes}
        
        for n in nodes:
            print(f" - {n['name']} (Type: {n['type']})")
            if 'parameters' in n:
                # Check for model name in parameters

                model = n['parameters'].get('modelName') or n['parameters'].get('model')
                if model:
                   print(f"   Model: {model}")
            

            if n['type'] == 'n8n-nodes-base.if':
                print(f"   Parameters: {json.dumps(n.get('parameters', {}), indent=2)}")


            if 'agent' in n['type'].lower():
                print(f"   Parameters: {json.dumps(n.get('parameters', {}), indent=2)}")

            if 'postgres' in n['type'].lower():
                 print(f"   Parameters: {json.dumps(n.get('parameters', {}), indent=2)}")
        
        connections = wf.get('connections', {})
        print(f"\nConnections:")
        for source_node, outputs in connections.items():
            for output_name, target_list in outputs.items():
                for target in target_list:
                    # target is list of dicts or just dict? n8n uses list of lists of dicts usually for 'main'
                    # Actually connections structure is: source -> output_type -> [[{node:..., type:..., index:..}]]
                    # target_list is the list of connections from that output
                    
                    # wait, n8n connection format: 
                    # "Node A": { "main": [ [ { "node": "Node B", "type": "main", "index": 0 } ] ] }
                    
                    # My iterator above `for output_name, target_list` 
                    # target_list is `[ [ { ... } ] ]`
                     

                     for connection_group in target_list:
                         for connection in connection_group:
                             print(f" {source_node} [{output_name}:{connection['index']}] -> {connection['node']}")

    except Exception as e:
        print(f"Error dumping workflow: {e}")

if __name__ == "__main__":
    dump_workflow()
