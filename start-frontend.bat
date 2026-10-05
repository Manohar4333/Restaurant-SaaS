@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
title Multi-Tenant Restaurant SaaS - Frontend (Port 5173)
echo Starting Frontend on http://localhost:5173 ...
cd frontend
npm run dev
pause
