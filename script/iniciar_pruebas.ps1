Write-Host "===================================================" -ForegroundColor Magenta
Write-Host "  Iniciando Entorno de Pruebas Locales (Vue 3 SPA)" -ForegroundColor Magenta
Write-Host "===================================================" -ForegroundColor Magenta
Write-Host ""

# Obtener ruta raiz del proyecto
$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
Set-Location $ProjectRoot

# Instalar dependencias si no existen
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Carpeta node_modules no encontrada. Instalando dependencias..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Hubo un problema al instalar las dependencias." -ForegroundColor Red
        Read-Host "Presiona Enter para salir..."
        exit $LASTEXITCODE
    }
}

# Formatear codigo
Write-Host "[INFO] Formateando el codigo con Prettier..." -ForegroundColor Cyan
npm run format

# Lanzar servidor
Write-Host ""
Write-Host "[SUCCESS] Todo listo. Iniciando el servidor de desarrollo de Vite..." -ForegroundColor Green
Write-Host ""
npm run dev
