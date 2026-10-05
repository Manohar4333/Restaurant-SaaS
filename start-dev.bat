@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
title Multi-Tenant Restaurant SaaS - Full Stack Dev Server
echo ====================================================================
echo Starting Multi-Tenant Restaurant SaaS (Backend + Frontend)...
echo ====================================================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo Swagger:  http://localhost:5000/api-docs
echo ====================================================================
npm run dev
pause
