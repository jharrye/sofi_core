import json

def summarize_workflows():
    try:
        with open("all_workflows_dump.json", "r") as f:
            workflows = json.load(f)
            
        for w in workflows:
            print(f"\n--- Workflow: {w['name']} (ID: {w['id']}) ---")
            nodes = w.get('nodes', [])
            for n in nodes:
                print(f" - {n['name']} ({n['type']})")
                if 'postgres' in n['type'].lower():
                    print(f"   * Database Node Found")
                if 'agent' in n['type'].lower() or 'gemini' in n['type'].lower():
                    print(f"   * AI Node Found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    summarize_workflows()
