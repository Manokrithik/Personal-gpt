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

def launch_native_webview():
    try:
        import webview
        window = webview.create_window(
            title="PersonalGPT — Private AI Workstation",
            url="http://127.0.0.1:8000",
            width=1280,
            height=820,
            min_size=(960, 640),
            text_select=True,
            confirm_close=False,
        )
        webview.start(gui="edgechromium", debug=False)
        return True
    except Exception as e:
        print(f"pywebview fallback: {e}")
        return False

def launch_standalone_app():
    edge_paths = [
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%LocalAppData%\Microsoft\Edge\Application\msedge.exe"),
        "msedge.exe",
    ]
    edge_exe = next((p for p in edge_paths if os.path.exists(p)), "msedge.exe")
    profile_dir = root_dir / "data" / "app_profile"
    profile_dir.mkdir(parents=True, exist_ok=True)

    args = [
        edge_exe,
        "--app=http://127.0.0.1:8000",
        "--window-size=1280,820",
        f"--app-id=PersonalGPT",
        f"--user-data-dir={profile_dir}",
    ]
    proc = subprocess.Popen(args)
    proc.wait()

def main():
    # 1. Start backend server in a background daemon thread if not already running
    if not is_backend_running():
        t = threading.Thread(target=start_backend, daemon=True)
        t.start()
        for _ in range(30):
            if is_backend_running():
                break
            time.sleep(0.4)

    # 2. Launch native application window
    # Try native WebView2 window first, then standalone app mode
    if not launch_native_webview():
        launch_standalone_app()

if __name__ == "__main__":
    main()
