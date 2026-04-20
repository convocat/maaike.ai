@echo off
REM Double-click to stop the eval stack.

setlocal
cd /d "%~dp0.."

set BASH=
if exist "C:\Program Files\Git\bin\bash.exe" set BASH="C:\Program Files\Git\bin\bash.exe"
if exist "C:\Program Files (x86)\Git\bin\bash.exe" set BASH="C:\Program Files (x86)\Git\bin\bash.exe"
if "%BASH%"=="" where bash >nul 2>&1 && set BASH=bash

if "%BASH%"=="" (
    echo ERROR: bash not found
    pause
    exit /b 1
)

%BASH% scripts/eval-dev.sh --stop
timeout /t 2 /nobreak >nul
