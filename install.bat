@echo off
echo Installing all dependencies...

echo.
echo [1/2] Installing backend dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [2/2] Installing frontend dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo  All dependencies installed!
echo  Run 'start.bat' to launch the app.
echo ========================================
pause
