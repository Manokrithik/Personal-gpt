# Start PersonalGPT Backend
param (
    [switch]$Reload
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\backend"

$python = "$scriptDir\backend\.venv\Scripts\python.exe"

$args = @("-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000")
if ($Reload) {
    $args += "--reload"
}

Write-Host "Starting PersonalGPT FastAPI Backend on http://127.0.0.1:8000..."
& $python $args
