@echo off
setlocal
rem ============================================================================
rem  TallerScan - Web en desarrollo (http://localhost:3000)
rem
rem  Corre en ESTA ventana, con los logs a la vista. Ctrl+C la corta.
rem  La API tiene que estar prendida aparte: ApiCore\iniciar-api.bat
rem  (o todo junto con iniciar-todo.bat en la carpeta TallerScan).
rem ============================================================================
chcp 65001 >nul
cd /d "%~dp0"
title TallerScan - Web

where npm >nul 2>nul
if errorlevel 1 (
    echo [X] No se encontro 'npm'. Hace falta Node.js 22.
    pause
    exit /b 1
)

if not exist "node_modules" call npm install
if not exist ".env.local" copy ".env.example" ".env.local" >nul

call npm run dev

rem Sin esto, si next dev se corta o falla la ventana se cierra sin dejar leer por que.
echo.
echo [!] La web se detuvo. Lee el mensaje de arriba.
pause
