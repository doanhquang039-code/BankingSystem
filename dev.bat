@echo off
title BankingSystem Dev Runner
echo ========================================================
echo   KHOI DONG DONG THOI FRONTEND (REACT) VE BACKEND (MAVEN)
echo ========================================================
echo.

:: Khởi động React Frontend ở một cửa sổ ẩn/phụ
echo [1/2] Dang khoi dong React Frontend (Port 5173)...
start cmd /k "title React Frontend && cd frontend && npm run dev"

:: Khởi động Spring Boot Backend ở cửa sổ hiện tại
echo [2/2] Dang khoi dong Spring Boot Backend (Port 8080)...
echo.
.\mvnw.cmd spring-boot:run
