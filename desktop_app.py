import sys
import os
import threading
import time
import subprocess
from pathlib import Path
import urllib.request

root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / "backend"
sys.path.insert(0, str(backend_dir))

def is_backend_running(port=8000):
    try:
        req = urllib.request.Request(f"http://127.0.0.1:{port}/api/v1/health", headers={"User-Agent": "PersonalGPT-App"})
        with urllib.request.urlopen(req, timeout=1.0) as res:
            return res.status == 200
    except Exception:
        return False

def start_backend():
    import uvicorn
    os.chdir(str(backend_dir))
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="warning")

def get_browser_executable():
    candidates = [
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%LocalAppData%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"),
    ]
    for p in candidates:
        if os.path.isfile(p):
            return p
    return "msedge.exe"

def launch_standalone_app():
    browser_exe = get_browser_executable()
    profile_dir = root_dir / "data" / "app_profile"
    profile_dir.mkdir(parents=True, exist_ok=True)

    args = [
        browser_exe,
        "--app=http://127.0.0.1:8000",
        "--window-size=1360,860",
        "--app-id=PersonalGPT",
        f"--user-data-dir={profile_dir}",
    ]
    proc = subprocess.Popen(args)
    proc.wait()

def main():
    # 1. Ensure backend server is running
    if not is_backend_running():
        t = threading.Thread(target=start_backend, daemon=True)
        t.start()
        for _ in range(40):
            if is_backend_running():
                break
            time.sleep(0.3)

    # 2. Launch dedicated standalone desktop application window
    launch_standalone_app()

if __name__ == "__main__":
    main()
