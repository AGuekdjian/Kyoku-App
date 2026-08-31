$ErrorActionPreference = "Stop"
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw "Docker no está instalado o no está en PATH." }
docker info *> $null
if ($LASTEXITCODE -ne 0) { throw "Docker Desktop no está corriendo." }
if (-not (Test-Path -LiteralPath ".env.local")) { throw "Falta .env.local. Copiá .env.example y completá sus valores." }
docker compose up --build --detach
if ($LASTEXITCODE -ne 0) { throw "docker compose up falló." }
for ($attempt = 1; $attempt -le 36; $attempt++) {
  try { $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 3; if ($response.StatusCode -eq 200) { Write-Host "Kyoku está disponible en http://localhost:3000" -ForegroundColor Green; exit 0 } } catch { Start-Sleep -Seconds 5 }
}
docker compose logs app
throw "Kyoku no alcanzó un estado saludable dentro del tiempo esperado."
