@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
title Multi-Tenant Restaurant SaaS - Backend API (Port 5000)
echo Starting Backend API on http://localhost:5000 ...
cd backend
npm run dev
pause
