param (
    [Parameter(Mandatory=$false)]
    [string]$RepoUrl
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$git = "C:\Users\^_^\AppData\Local\Programs\MinGit\cmd\git.exe"

if (-not $RepoUrl) {
    $RepoUrl = Read-Host "Enter your GitHub repository URL (e.g. https://github.com/your-username/PersonalGPT.git)"
}

if (-not $RepoUrl) {
    Write-Error "Repository URL cannot be empty."
    exit 1
}

Write-Host "Configuring remote origin to $RepoUrl..." -ForegroundColor Cyan

# Check if origin already exists
$existingRemote = & $git remote get-url origin 2>$null
if ($existingRemote) {
    & $git remote set-url origin $RepoUrl
} else {
    & $git remote add origin $RepoUrl
}

Write-Host "Renaming branch to main..." -ForegroundColor Cyan
& $git branch -M main

Write-Host "Pushing code to GitHub..." -ForegroundColor Green
& $git push -u origin main

Write-Host "Successfully deployed to GitHub: $RepoUrl" -ForegroundColor Green
