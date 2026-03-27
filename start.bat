@echo off
REM Meeting Analyzer - Start Script for Windows

echo ========================================
echo   Meeting Analyzer - Starting
echo ========================================

REM Check if backend is running
netstat -ano | findstr ":8080" >nul
if %errorlevel%==0 (
    echo Backend already running on port 8080
) else (
    echo Starting Backend...
    cd backend
    start /B java -Dpython.command="%CD%\venv\Scripts\python.exe" -jar target\audio-action-extractor-1.0.0.jar > ..\backend.log 2>&1
    cd ..
    timeout /t 8 /nobreak >nul
    echo Backend started on port 8080
)

REM Check if frontend is running
netstat -ano | findstr ":3000" >nul
if %errorlevel%==0 (
    echo Frontend already running on port 3000
) else (
    echo Starting Frontend...
    cd frontend
    start /B npm start > ..\frontend.log 2>&1
    cd ..
    timeout /t 15 /nobreak >nul
    echo Frontend started on port 3000
)

echo.
echo ========================================
echo   Meeting Analyzer is running!
echo.
echo   Backend API:  http://localhost:8080
echo   Frontend:     http://localhost:3000
echo ========================================
