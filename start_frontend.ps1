# Start PersonalGPT Frontend
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\frontend"

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$node = if ($nodeCmd) { $nodeCmd.Source } else { "node" }
Write-Host "Starting PersonalGPT Vite Frontend Dev Server on http://localhost:5173..."
& $node node_modules\vite\bin\vite.js --host 0.0.0.0 --port 5173
