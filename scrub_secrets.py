import os
import re

# List of strings to scrub
SECRETS = [
    r"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+", # JWT n8n
    r"AIzaSy[A-Za-z0-9_-]{33}", # Gemini API Key
    r"sb_secret_[A-Za-z0-9_-]{32}", # Supabase key
    "YOUR_DATABASE_PASSWORD" # Database password
]

def scrub_file(filepath):
    if not os.path.isfile(filepath): return
    if filepath.endswith(".env") or filepath.endswith(".env.example"): return
    
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    new_content = content
    # Replace N8N API KEY
    new_content = re.sub(r'API_KEY\s*=\s*"eyJhbGci.*?"', 'API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")', new_content)
    new_content = re.sub(r'\$API_KEY\s*=\s*"eyJhbGci.*?"', '$API_KEY = $env:N8N_API_KEY', new_content)
    
    # Replace Gemini Key
    new_content = re.sub(r'API_KEY\s*=\s*"AIzaSy.*?"', 'API_KEY = os.getenv("GEMINI_API_KEY", "your_gemini_key_here")', new_content)
    new_content = re.sub(r'- API Key:\*\* `AIzaSy.*?`', '- API Key:** `YOUR_GEMINI_KEY` (See .env)', new_content)
    new_content = re.sub(r'- \*\*API Key:\*\* `AIzaSy.*?`', '- **API Key:** `YOUR_GEMINI_KEY` (See .env)', new_content)
    
    # Replace DB Pass
    new_content = new_content.replace("YOUR_DATABASE_PASSWORD", "YOUR_DATABASE_PASSWORD")
    
    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Scrubbed: {filepath}")

def main():
    # Only scrub Python, JS, TS, PS1, and MD files in the root (and subdirs except node_modules)
    for root, dirs, files in os.walk("."):
        if "node_modules" in dirs:
            dirs.remove("node_modules")
        if ".git" in dirs:
            dirs.remove(".git")
            
        for file in files:
            if file.endswith((".py", ".js", ".ts", ".ps1", ".md", ".json")):
                scrub_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
