import sys
import json
import urllib.request

def check():
    url = "http://localhost:8000/api/v1/health"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "PersonalGPT-Healthcheck"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                print(f"Health Status: {data.get('status')}")
                print(f"Backend: {data.get('backend')}, DB: {data.get('database')}, LLM: {data.get('llm_provider')}")
                sys.exit(0)
            else:
                print(f"Healthcheck failed with HTTP {response.status}")
                sys.exit(1)
    except Exception as e:
        print(f"Healthcheck failed to reach {url}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check()
