$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath "PersonalGPT.lnk"

$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $projectDir "backend\.venv\Scripts\pythonw.exe"
$shortcut.Arguments = "`"$projectDir\desktop_app.py`""
$shortcut.WorkingDirectory = $projectDir
$shortcut.Description = "PersonalGPT - Private AI Workstation"
$shortcut.Save()

Write-Host "Created Desktop Shortcut: $shortcutPath"

