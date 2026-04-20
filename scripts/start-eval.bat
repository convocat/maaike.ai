@echo off
REM ═════════════════════════════════════════════════════════════════════
REM start-eval.bat — double-click to start the eval stack
REM
REM Drops you into the dashboard in one action. Handles:
REM   - finding bash (Git Bash comes with Windows Git)
REM   - running eval-dev.sh
REM   - opening the browser when the stack is up
REM ═════════════════════════════════════════════════════════════════════

setlocal

REM Find repo root (this script sits in scripts/)
cd /d "%~dp0.."
set REPO=%CD%

REM Find bash (Git for Windows installs it here by default)
set BASH=
if exist "C:\Program Files\Git\bin\bash.exe" set BASH="C:\Program Files\Git\bin\bash.exe"
if exist "C:\Program Files (x86)\Git\bin\bash.exe" set BASH="C:\Program Files (x86)\Git\bin\bash.exe"
if "%BASH%"=="" where bash >nul 2>&1 && set BASH=bash

if "%BASH%"=="" (
    echo.
    echo [start-eval] ERROR: could not find bash.exe
    echo [start-eval] Install Git for Windows from https://git-scm.com
    echo.
    pause
    exit /b 1
)

echo.
echo [start-eval] Starting eval stack...
echo.

%BASH% scripts/eval-dev.sh

REM If the script succeeded, open the dashboard in the default browser
if %ERRORLEVEL% EQU 0 (
    start "" http://localhost:8782/eval.html
    echo.
    echo [start-eval] Dashboard opened in browser.
    echo [start-eval] This console stays open so you can read logs.
    echo [start-eval] Close this window OR run stop-eval.bat to shut down.
    echo.
)

pause
