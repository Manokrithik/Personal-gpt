$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $projectDir) { $projectDir = (Get-Location).Path }
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath "PersonalGPT.lnk"

$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$projectDir\PersonalGPT.vbs`""
$shortcut.WorkingDirectory = $projectDir
$shortcut.IconLocation = "$projectDir\assets\icon.ico"
$shortcut.Description = "PersonalGPT - Intelligent Personal AI Workstation"
$shortcut.Save()

Write-Host "Created Desktop Shortcut: $shortcutPath"

