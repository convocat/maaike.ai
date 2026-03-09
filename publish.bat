@echo off
cd /d "C:\Users\MaaikeGroenewege\Documents\Pythonprojecten\digital-garden"

echo.
echo  Publishing to maaike.ai...
echo.

git add -A
git diff --cached --quiet
if %errorlevel%==0 (
    echo  Nothing new to publish — your site is already up to date.
    echo.
    pause
    exit /b
)

git commit -m "Update content — %date:~-10%"
git push

if %errorlevel%==0 (
    echo.
    echo  Published! Changes will be live on maaike.ai in ~2 minutes.
) else (
    echo.
    echo  Something went wrong. Check your internet connection and try again.
)

echo.
pause
