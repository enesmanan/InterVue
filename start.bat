@echo off
echo Starting Interview Simulation System...
echo.
echo ===============================
echo Starting Backend (Python FastAPI)
echo ===============================
start cmd /k "cd backend && python run.py"

timeout /t 3

echo.
echo ===============================
echo Starting Frontend (React + Vite)
echo ===============================
start cmd /k "npm run dev"

echo.
echo System starting up...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:8080
echo.
echo Press any key to exit this window...
pause > nul