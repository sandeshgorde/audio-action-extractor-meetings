@echo off
REM Meeting Analyzer - Stop Script for Windows

echo Stopping Meeting Analyzer...

REM Stop backend (Java process on port 8080)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo Backend stopped

REM Stop frontend (node processes)
taskkill /F /IM node.exe >nul 2>&1
echo Frontend stopped

echo All services stopped
