@echo off
title PersonalGPT Workstation
echo ============================================================
echo   PersonalGPT - Private AI Assistant Platform
echo ============================================================
echo Opening PersonalGPT in your browser...
start http://localhost:8000
echo Launching unified server...
"%~dp0backend\.venv\Scripts\python.exe" "%~dp0run.py"
pause
