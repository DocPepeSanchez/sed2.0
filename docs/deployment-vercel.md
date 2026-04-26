# Despliegue en Vercel + Neon (10 minutos)

> Esta guía deja una instancia de SED 2.0 funcionando en una URL pública
> de Vercel con PostgreSQL serverless en Neon. Ambos tienen plan gratuito
> suficiente para demos y entornos de pre-producción. Para producción real
> deben sustituirse por infraestructura mexicana (P-01 — soberanía de datos).

## 1. Crear la base de datos en Neon

1. Crear cuenta en <https://neon.tech>
2. **Create Project** → región más cercana (`aws-us-east-1` funciona; en producción real Yucatán requiere infra MX).
3. Copiar la cadena de conexión (`postgresql://USER:PASS@HOST.neon.tech/sed?sslmode=require`).

## 2. Generar secretos locales

```bash
# Genera dos secretos de 32 bytes — copialos para usarlos en Vercel.
openssl rand -base64 32   # → SESSION_SECRET
openssl rand -base64 32   # → FIELD_ENCRYPTION_KEY
```

## 3. Aplicar el esquema y cargar catálogos

Desde tu máquina, contra la BD de Neon:

```bash
git clone https://github.com/docpepesanchez/sed2.0.git
cd sed2.0
npm install

# Crear .env temporal con la URL de Neon
cat > .env <<EOF
DATABASE_URL=postgresql://USER:PASS@HOST.neon.tech/sed?sslmode=require
SESSION_SECRET=$(openssl rand -base64 32)
FIELD_ENCRYPTION_KEY=$(openssl rand -base64 32)
EOF

# Aplica esquema (35+ tablas) + carga catálogos oficiales del Plan 2022
npm run db:setup
```

Output esperado:

```
[seed] Campos formativos…
[seed] Fases…
[seed] Ejes articuladores…
[seed] PDA (muestra)…
[seed] Roles RBAC…
[seed] Escuelas demo…
[seed] Listo.
```

## 4. Conectar Vercel

1. <https://vercel.com> → **Add New** → **Project**
2. Importa `docpepesanchez/sed2.0` (selecciona la rama
   `claude/build-sed-2-platform-d45P8` o `main` según corresponda).
3. Framework: **Next.js** (auto-detectado).
4. Root Directory: `./`
5. **Environment Variables** — añade:

| Nombre | Valor |
| --- | --- |
| `DATABASE_URL` | la URL de Neon con `?sslmode=require` |
| `SESSION_SECRET` | el primero de los `openssl rand` |
| `FIELD_ENCRYPTION_KEY` | el segundo de los `openssl rand` |
| `DEFAULT_LOCALE` | `es` |
| `SUPPORTED_LOCALES` | `es,yua` |
| `LOG_LEVEL` | `info` |

6. **Deploy.** Tras 1–2 minutos tendrás una URL como
   `https://sed-2-0-xxxx.vercel.app`.

## 5. Verificar

- `https://<tu-url>/es` → portada bilingüe.
- `https://<tu-url>/es/banco` → Banco de Retos (vacío al principio).
- `https://<tu-url>/yua` → versión maya yucateca.
- `https://<tu-url>/api/health` → `{"status":"ok","db":"up"}`.
- `https://<tu-url>/api/openapi.json` → contrato OpenAPI 3.1.

## 6. Migraciones futuras

Cuando modifiques el esquema en `src/db/schema/`:

```bash
# Genera el SQL de la migración (lo confirmas al repo)
npm run db:generate

# Aplícalo contra Neon antes de hacer push a Vercel
DATABASE_URL=postgresql://USER:PASS@HOST.neon.tech/sed?sslmode=require \
  npm run db:migrate
```

Para automatizar esto, configura los siguientes secrets en GitHub
(`Settings` → `Secrets and variables` → `Actions`):

- `DATABASE_URL_PROD` — cadena Neon de producción

El workflow `.github/workflows/deploy-migrations.yml` aplicará migraciones
automáticamente al empujar a `main`.

## 7. Limitaciones de la demo

- **Soberanía de datos (P-01)**: Vercel + Neon corren en infraestructura
  estadounidense. Adecuado para demo / pruebas, **no para producción**.
  Para producción real Yucatán debe alojar en datacenter mexicano (Triara,
  KIO, Equinix Querétaro, etc.) según el documento maestro.
- **HSM/KMS**: la `FIELD_ENCRYPTION_KEY` está en variable de entorno; en
  producción debe gestionarse con HSM/KMS (ADR-010).
- **Cold starts**: las funciones serverless pueden tardar ~1 s en
  arrancar. Para operación real durante ventanas de aplicación, despliega
  en Kubernetes con réplicas calientes (ver `docs/deployment.md`).

## 8. Compartir la URL

Por defecto Vercel asigna un dominio `*.vercel.app`. Para el dominio
oficial (`sed.yucatan.gob.mx`) se requiere coordinación con la dirección
de informática de SEGEY y configuración DNS apuntando a Vercel.
