# Launch both backend and frontend for PersonalGPT development
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "         Launching PersonalGPT               " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$python = "$root\backend\.venv\Scripts\python.exe"
$node = "C:\Users\^_^\AppData\Local\Programs\NodeJS\node.exe"

# 1. Start Backend in background process
Write-Host "[1/2] Launching Backend on http://localhost:8000..." -ForegroundColor Green
$backendProc = Start-Process -FilePath $python -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000" -WorkingDirectory "$root\backend" -PassThru

# 2. Wait 2 seconds for backend to start up
Start-Sleep -Seconds 2

# 3. Start Frontend
Write-Host "[2/2] Launching Frontend on http://localhost:5173..." -ForegroundColor Green
try {
    Set-Location "$root\frontend"
    & $node node_modules\vite\bin\vite.js --host 0.0.0.0 --port 5173
}
finally {
    Write-Host "Stopping backend process ($($backendProc.Id))..." -ForegroundColor Yellow
    Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
}
