$ErrorActionPreference = "Stop"
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw "Docker no está instalado o no está en PATH." }
docker compose down --volumes --remove-orphans
if ($LASTEXITCODE -ne 0) { throw "No se pudo detener el entorno local de DojoNexo." }
Write-Host "Entorno Docker local de DojoNexo eliminado. MongoDB Atlas no fue modificado." -ForegroundColor Green
