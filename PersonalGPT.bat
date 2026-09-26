@echo off
cd /d "%~dp0"
start "" "%~dp0backend\.venv\Scripts\pythonw.exe" "%~dp0desktop_app.py"
exit
