@echo off
title GitHub Turbo Uploader - zongton
color 0b

echo ====================================================
echo    [GitHub Sync] Starting Turbo Transfer...
echo    Account: zongton / 3482803772@qq.com
echo ====================================================

:: 1. Force enter directory
cd /d "D:\协调文档中心"

:: 2. Identity Config
git config user.name "zongton"
git config user.email "3482803772@qq.com"

:: 3. Initial check
if not exist ".git" (
    git init
)

:: 4. Use Mirror Proxy (ghp.ci) to bypass connection issues
echo [*] Connecting via Turbo Proxy...
git remote remove origin >nul 2>&1
git remote add origin https://ghp.ci/https://github.com/zongton/coord-docs.git

:: 5. Commit
echo [*] Packing and Committing...
git add .
git commit -m "Turbo Upload: Full Backup"

:: 6. Push with timeout increase
echo [*] Blasting off to GitHub...
git branch -M main
git push -u origin main --force

if %errorlevel% neq 0 (
    echo.
    echo [FAILED] Still blocked? Try these:
    echo 1. Check if you created 'coord-docs' repo on GitHub.
    echo 2. Try running the script again in 1 minute.
) else (
    echo.
    echo [SUCCESS] Magic Success! Code is on GitHub!
)

echo ====================================================
pause