@echo off
title Iniciar Pruebas Locales - Antigravity Games
echo ===================================================
echo   Iniciando Entorno de Pruebas Locales (Vue 3 SPA)
echo ===================================================
echo.

:: Navegar al directorio raiz del proyecto (padre de esta carpeta)
cd /d "%~dp0.."

:: Verificar si existe node_modules
if not exist node_modules (
    echo [INFO] Carpeta node_modules no encontrada. Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Hubo un problema al instalar las dependencias.
        pause
        exit /b %errorlevel%
    )
)

:: Formatear codigo
echo [INFO] Formateando el codigo con Prettier...
call npm run format

:: Lanzar servidor de desarrollo
echo.
echo [SUCCESS] Todo listo. Iniciando el servidor de desarrollo de Vite...
echo.
call npm run dev
