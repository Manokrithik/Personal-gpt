# Start PersonalGPT Frontend
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\frontend"

$node = "C:\Users\^_^\AppData\Local\Programs\NodeJS\node.exe"
Write-Host "Starting PersonalGPT Vite Frontend Dev Server on http://localhost:5173..."
& $node node_modules\vite\bin\vite.js --host 0.0.0.0 --port 5173
