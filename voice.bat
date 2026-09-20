@echo off
cd /d "%~dp0"

echo.
echo  Reading the bot...
echo.

python scripts/telegram_sync.py

echo.
echo  Voice notes are in the voice folder. They are not committed and not published.
echo.
pause
