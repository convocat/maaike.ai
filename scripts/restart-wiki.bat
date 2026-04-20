@echo off
REM ------------------------------------------------------------
REM restart-wiki.bat — one-shot zombie-proof restart
REM
REM Kills anything on WIKI_PORT (default 8780), then starts a fresh
REM serve.py. If the port is still occupied after the kill, aborts
REM loudly instead of stacking another zombie.
REM ------------------------------------------------------------

setlocal enabledelayedexpansion

set WIKI_PORT=8780
if not "%1"=="" set WIKI_PORT=%1

echo.
echo [restart-wiki] Target port: %WIKI_PORT%
echo [restart-wiki] Searching for processes bound to %WIKI_PORT%...

set KILLED=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%WIKI_PORT% ^| findstr LISTENING') do (
    echo [restart-wiki] Killing PID %%a
    taskkill /F /PID %%a >nul 2>&1
    set /a KILLED+=1
)

if !KILLED! EQU 0 (
    echo [restart-wiki] No existing listeners found.
) else (
    echo [restart-wiki] Killed !KILLED! process^(es^).
    timeout /t 2 /nobreak >nul
)

REM Verify the port is actually free before starting
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%WIKI_PORT% ^| findstr LISTENING') do (
    echo [restart-wiki] ERROR: port %WIKI_PORT% is still in use by PID %%a
    echo [restart-wiki] Aborting to avoid another zombie. Kill it manually and retry.
    exit /b 1
)

echo [restart-wiki] Port %WIKI_PORT% is free. Starting serve.py...
echo.

cd /d "%~dp0..\tools\karpathy-wiki"
python tools\serve.py
