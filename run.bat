@echo off
cd /d "%~dp0"
if exist "Start-Offline-App.html" (
    start "" "Start-Offline-App.html"
    exit /b
)
if exist "dist\index.html" (
    start "" "dist\index.html"
    exit /b
)
if exist "index.html" (
    start "" "index.html"
    exit /b
)
