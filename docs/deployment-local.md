# Despliegue local con Docker Compose (1 comando)

> Esta guía deja una instancia completa de SED 2.0 corriendo en tu máquina:
> Postgres 16 + Next.js + esquema aplicado + catálogos del Plan 2022 cargados.
> Útil para demos, talleres y revisión técnica sin depender de internet.

## Requisitos

- Docker Desktop ≥ 4.30 (o Docker Engine ≥ 24 + Compose v2 en Linux)
- 2 GB de RAM libres
- Puertos `3000` y `5432` libres

## Arranque en un comando

```bash
git clone https://github.com/docpepesanchez/sed2.0.git
cd sed2.0
make demo
```

El target `demo` ejecuta en orden:

1. `docker compose build` — construye la imagen multi-stage (~3 min la primera vez).
2. `docker compose up -d db app` — arranca Postgres y la app.
3. `make migrate` — aplica el esquema Drizzle (35+ tablas).
4. `make seed` — carga catálogos oficiales (Plan 2022, INALI, BAP, roles) y escuelas demo.

Al terminar verás:

```
✦ SED 2.0 listo en http://localhost:3000/es
  · Maya yucateca:       http://localhost:3000/yua
  · Health:              http://localhost:3000/api/health
  · OpenAPI 3.1:         http://localhost:3000/api/openapi.json
```

## Sin Make (Docker Compose puro)

```bash
docker compose build
docker compose up -d db app
docker compose run --rm migrate
docker compose run --rm seed
docker compose logs -f app
```

## Variables de entorno

`docker-compose.yml` provee valores por defecto **solo aptos para
desarrollo**. Para una demo más realista, crea un `.env` en la raíz:

```env
SESSION_SECRET=$(openssl rand -base64 32)
FIELD_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

Compose los inyectará automáticamente.

## Operación diaria

| Acción | Comando |
| --- | --- |
| Arrancar | `make up` o `docker compose up -d` |
| Ver logs | `make logs` |
| Apagar (datos persisten) | `make down` |
| Apagar y borrar BD | `make clean` |
| Re-aplicar seed | `make seed` |
| Tests | `make test` |
| Typecheck | `make typecheck` |
| Shell de la BD | `docker compose exec db psql -U sed -d sed` |

## Solución de problemas

**El puerto 3000 está ocupado.**
Edita `docker-compose.yml` y cambia `"3000:3000"` por `"3001:3000"`.

**El build falla con error de `argon2`.**
Estamos usando `node:20-bookworm-slim` con `python3 make g++`; si tu Docker
no tiene espacio o memoria suficiente, libera ~3 GB y reintenta.

**`make migrate` falla con "connection refused".**
Postgres aún está arrancando. Espera 5 segundos y reintenta (el healthcheck
debería atajarlo, pero en máquinas lentas a veces es marginal).

**Quiero modificar el código y verlo en caliente.**
Compose monta la imagen construida, no el código fuente. Para desarrollo
con HMR usa el flujo nativo:

```bash
npm install
npm run dev
# (apuntando DATABASE_URL al Postgres del compose)
DATABASE_URL=postgresql://sed:sed_dev_password@localhost:5432/sed npm run dev
```

## Limitaciones de la demo local

- **Soberanía de datos (P-01)**: tu máquina, no datacenter mexicano. OK
  para demo, no para producción real.
- **HSM/KMS**: la `FIELD_ENCRYPTION_KEY` está en variable de entorno; en
  producción debe gestionarse con HSM/KMS (ADR-010).
- **Bus de eventos**: el bus es in-memory; en producción se sustituye por
  Kafka/RabbitMQ.
- **Réplicas / alta disponibilidad**: un solo contenedor. Para operación
  con miles de aplicaciones simultáneas véase `docs/deployment.md`.

## Compartir la demo en una red local

Si quieres que un compañero en la misma red la use:

```bash
# averigua tu IP local
ip addr show | grep inet   # Linux
ifconfig | grep inet       # macOS
```

Comparte `http://<tu-ip>:3000/es`. Para exponerla públicamente con HTTPS
considera `ngrok http 3000` o `cloudflared tunnel`.
