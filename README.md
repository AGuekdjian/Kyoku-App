# DojoNexo

Aplicación full-stack para la gestión integral de un dojo de karate. Usa un monolito modular con Next.js App Router, TypeScript estricto, MongoDB/Mongoose y componentes de servidor por defecto.

## Requisitos

- Node.js 24 y npm 11
- Docker Desktop (flujo recomendado)
- MongoDB Atlas

## Configuración

Copiar `.env.example` a `.env.local` y completar `MONGODB_URI`, un `AUTH_SECRET` aleatorio de al menos 32 caracteres y las variables de storage. Nunca versionar `.env.local`.

```powershell
npm install
npm run dev
```

Con Docker:

```powershell
.\scripts\dev-up.ps1
.\scripts\dev-down.ps1
```

`dev-down.ps1` elimina solamente contenedores, redes y volúmenes del Compose de DojoNexo. No modifica Atlas ni ejecuta prune global.

## Calidad

```powershell
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run test:e2e
npm run check
```

Las pruebas unitarias priorizan reglas de grado, resultados con observación, edad, permisos y snapshots históricos. Playwright cubre el flujo real en navegador. El endpoint `GET /api/health` responde `200 healthy` con DB disponible o `503 degraded` sin revelar configuración.

## Arquitectura

- `src/app`: rutas, layouts y boundaries.
- `src/features`: dominio por funcionalidad, schemas y servicios.
- `src/models`: persistencia Mongoose e índices.
- `src/lib`: conexión serverless, autenticación, permisos y logging.
- `tests/e2e`: pruebas de navegador.

Los alumnos no almacenan edad. Las inscripciones a torneo guardan snapshots. Los resultados `PASSED_WITH_OBSERVATION` promueven el grado y crean uno o más pendientes resolubles sin repetir el examen. Las entidades históricas usan soft delete.

La aplicación incluye login sin registro público, roles ADMIN/INSTRUCTOR, alumnos, grados configurables, exámenes y observaciones, actividades, torneos con inscripción masiva y resultados, exportación Excel, biblioteca PDF, usuarios, auditoría, settings y dashboard. Las mutaciones validan con Zod y autorizan en servidor.

El storage local está pensado para Docker/desarrollo. Antes de desplegar carga documental en Vercel debe agregarse otra implementación de `StorageProvider`, porque el filesystem de funciones serverless no es persistente.

### Seed de desarrollo

Definir `SEED_ADMIN_EMAIL` y una `SEED_ADMIN_PASSWORD` de al menos 8 caracteres en `.env.local`, luego ejecutar `npm run seed`. El script se niega a operar en producción o contra una base cuyo nombre no contenga `kyoku_dev`.

## Git, CI y deployment

Todo desarrollo se realiza en `dev`; `main` representa producción. `.github/workflows/ci.yml` valida typecheck, lint, unit/integration, coverage, build y E2E en pushes y PR hacia `main`.

Para desplegar, importar el repositorio en Vercel, seleccionar Next.js, configurar las variables de `.env.example` con valores de producción y usar `main` como rama productiva. Vercel gestiona previews de PR sin guardar tokens en el repositorio.

## Solución de problemas

- Docker no inicia: abrir Docker Desktop y ejecutar `docker info`.
- Health degradado: validar acceso de red de Atlas y `MONGODB_URI`.
- PowerShell bloquea `npm.ps1`: usar `npm.cmd` o ajustar la política local conforme a las reglas del equipo.
- E2E sin navegador: ejecutar `npx playwright install chromium`.
