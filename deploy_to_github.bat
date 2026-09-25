@echo off
set "PATH=%USERPROFILE%\AppData\Local\Programs\MinGit\cmd;%USERPROFILE%\AppData\Local\Programs\MinGit\mingw64\bin;%PATH%"
cd /d "%~dp0"
echo ========================================================
echo   Deploying PersonalGPT to GitHub
echo   Repository: https://github.com/Manokrithik/Personal-gpt.git
echo ========================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Deployed successfully to https://github.com/Manokrithik/Personal-gpt.git
) else (
    echo [INFO] If prompted above, complete your GitHub sign-in.
)
echo.
pause
