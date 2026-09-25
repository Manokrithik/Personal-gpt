param (
    [Parameter(Mandatory=$false)]
    [string]$RepoUrl
)

$env:PATH = "C:\Users\^_^\AppData\Local\Programs\MinGit\cmd;C:\Users\^_^\AppData\Local\Programs\MinGit\mingw64\bin;$env:PATH"
$git = "C:\Users\^_^\AppData\Local\Programs\MinGit\cmd\git.exe"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

if (-not $RepoUrl) {
    $RepoUrl = Read-Host "Enter your GitHub repository URL (e.g. https://github.com/your-username/PersonalGPT.git)"
}

if (-not $RepoUrl) {
    Write-Error "Repository URL cannot be empty."
    exit 1
}

Write-Host "Configuring remote origin to $RepoUrl..." -ForegroundColor Cyan

$remotes = & $git remote
if ($remotes -contains "origin") {
    & $git remote set-url origin $RepoUrl
} else {
    & $git remote add origin $RepoUrl
}

Write-Host "Renaming branch to main..." -ForegroundColor Cyan
& $git branch -M main

Write-Host "Pushing code to GitHub..." -ForegroundColor Green
& $git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully deployed to GitHub: $RepoUrl" -ForegroundColor Green
} else {
    Write-Host "Git push exited with code $LASTEXITCODE. If authentication or branch conflict occurred, please check credentials or rebase." -ForegroundColor Yellow
}
