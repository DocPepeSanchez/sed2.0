# SED 2.0 — Sistema de Evaluación Dinámica del Estado de Yucatán

[![ISO 27001](https://img.shields.io/badge/ISO-27001%3A2022-1f3b58)](docs/seguridad.md)
[![ISO 9001](https://img.shields.io/badge/ISO-9001%3A2015-1f3b58)](docs/calidad.md)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-1f3b58)](docs/accesibilidad.md)
[![License](https://img.shields.io/badge/license-Apache--2.0-26496c)](LICENSE)

Plataforma estatal de evaluación adaptativa, diagnóstica y de seguimiento del **Centro de Evaluación Educativa del Estado de Yucatán (CEEEY)**, alineada con el **Plan de Estudio para la Educación Básica 2022** y el **Marco Curricular Común de Educación Media Superior 2023**, e inscrita en el **Plan «Renacimiento Maya 2024–2030»**.

> Referencia normativa primaria: documento maestro del SED 2.0 (Mérida, abril 2026), partes I–V.

## ✦ Visión arquitectónica — ocho capas

| Capa | Función | Implementación en este repo |
| --- | --- | --- |
| 1 — Psicométrica | Motor TRI/CAT, calibración, equating | `src/lib/psicometria/` |
| 2 — Equidad | DIF, formas paralelas es/yua, acomodaciones | `src/lib/psicometria/dif.ts` · `src/db/schema/identidad.ts` |
| 3 — Contenidos | Banco de retos QTI 3.0, doble revisión ciega | `src/db/schema/banco.ts` · `src/server/banco/service.ts` |
| 4 — Datos | Modelo lógico, audit log inmutable | `src/db/schema/` |
| 5 — Aplicación | Through-Year, 4 modalidades, offline-first | `src/server/aplicacion/service.ts` |
| 6 — Calificación | Cerrados auto + IA + humano | `src/server/calificacion/service.ts` |
| 7 — Ecosistema | Bus de eventos, OneRoster, Caliper, QTI | `src/server/eventos/bus.ts` · `src/app/api/` |
| 8 — Institucional | Roles, gobernanza, datos abiertos | `src/lib/catalogos/roles.ts` · `src/app/[locale]/observatorio/` |

## ✦ Principios arquitectónicos rectores (P-01 a P-12)

Todos los principios están listados en `docs/arquitectura.md`. Los críticos:

- **P-01 Soberanía de datos** — datos en territorio mexicano (`DATABASE_URL` en infra mexicana)
- **P-03 Identidad federada** — CURP/RFC; validación en `src/lib/security/curp.ts`
- **P-04 Inmutabilidad de evidencia** — versionamiento de retos, respuestas append-only
- **P-05 Cifrado por defecto** — TLS 1.3 + AES-256 a nivel campo (`src/lib/security/field-encryption.ts`)
- **P-06 Mínimo privilegio** — RBAC declarativo (`src/lib/security/rbac.ts`)
- **P-07 Trazabilidad total** — audit log encadenado SHA-256 (`src/lib/security/audit.ts`)
- **P-08 Accesibilidad por diseño** — WCAG 2.1 AA en CI/CD
- **P-09 Bilingüismo por diseño** — es/yua en `src/messages/`

## ✦ Decisiones arquitectónicas (ADRs)

Las diez ADRs viven en `docs/adr/`. Resumen:

| ADR | Decisión | Estado |
| --- | --- | --- |
| ADR-01 | TAO como motor evaluativo base | Adoptado |
| ADR-02 | TRI 1PL como modelo de entrada | Adoptado |
| ADR-03 | PostgreSQL transaccional | Adoptado |
| ADR-04 | Arquitectura event-driven (Kafka) | Adoptado |
| ADR-05 | PWA como cliente principal | Adoptado |
| ADR-06 | OMR como modalidad alterna | Adoptado |
| ADR-07 | LLM open-source para calificación | Adoptado |
| ADR-08 | OAuth 2.1 + OIDC | Adoptado |
| ADR-09 | WCAG 2.1 AA en CI/CD | Adoptado |
| ADR-10 | Cifrado a nivel campo | Adoptado |

## ✦ Demo local en un comando (recomendado)

Si tienes Docker instalado, una sola instrucción levanta Postgres + la app
con esquema y catálogos cargados:

```bash
git clone https://github.com/docpepesanchez/sed2.0.git
cd sed2.0
make demo
```

Tras ~3 minutos (la primera vez):

- <http://localhost:3000/es> — portada bilingüe
- <http://localhost:3000/yua> — versión maya yucateca
- <http://localhost:3000/api/health> — `{"status":"ok","db":"up"}`
- <http://localhost:3000/api/openapi.json> — contrato OpenAPI 3.1

Guía completa: [`docs/deployment-local.md`](docs/deployment-local.md).

## ✦ Despliegue rápido en Vercel + Neon

Para verlo accesible públicamente en ~10 minutos:

1. Crea una BD gratuita en <https://neon.tech> y copia la `DATABASE_URL`
2. Genera secretos: `openssl rand -base64 32` (dos veces)
3. Localmente, aplica el esquema + catálogos:
   ```bash
   npm install --legacy-peer-deps
   DATABASE_URL=... SESSION_SECRET=... FIELD_ENCRYPTION_KEY=... npm run db:setup
   ```
4. Importa el repo en <https://vercel.com>, configura las 3 variables de
   entorno, **Deploy**.

Guía detallada en [`docs/deployment-vercel.md`](docs/deployment-vercel.md).

> ⚠️ **Para producción real**: Vercel + Neon es infra estadounidense. Yucatán debe alojar en datacenter mexicano (P-01 — soberanía de datos). Ver `docs/deployment.md` para topología productiva.

## ✦ Cómo arrancar

### Requisitos

- Node.js ≥ 20.10
- PostgreSQL ≥ 16
- (Opcional) Kafka o RabbitMQ para el bus de eventos en producción

### Instalación

```bash
# Clonar e instalar
git clone https://github.com/docpepesanchez/sed2.0.git
cd sed2.0
npm install

# Variables de entorno
cp .env.example .env
# Edite .env con DATABASE_URL, SESSION_SECRET, FIELD_ENCRYPTION_KEY

# Migraciones y seed
npm run db:generate   # genera SQL desde el esquema Drizzle
npm run db:migrate    # aplica las migraciones
npm run db:seed       # carga catálogos oficiales y datos demo

# Arranque
npm run dev           # http://localhost:3000/es
```

### Verificación

```bash
npm run typecheck     # compilación TypeScript estricta
npm run lint          # eslint + reglas Next.js
npm test              # vitest — pruebas psicométricas, RBAC, CURP, audit
```

## ✦ Estructura del repositorio

```
sed2.0/
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── [locale]/         # Rutas i18n (es / yua)
│   │   └── api/              # API REST OpenAPI 3.1
│   ├── components/           # UI accesible (WCAG 2.1 AA)
│   ├── db/
│   │   ├── schema/           # Drizzle — modelo lógico (Parte III)
│   │   ├── client.ts
│   │   ├── migrate.ts
│   │   └── seed.ts
│   ├── lib/
│   │   ├── catalogos/        # Plan 2022, INALI, BAP, Roles, MCCEMS
│   │   ├── i18n/             # next-intl
│   │   ├── observabilidad/   # logger pino
│   │   ├── psicometria/      # TRI / CAT / DIF / kappa
│   │   └── security/         # RBAC, audit, cifrado, CURP, sesión
│   ├── messages/             # es.json, yua.json
│   ├── middleware.ts
│   └── server/               # Servicios de dominio
│       ├── banco/
│       ├── aplicacion/
│       ├── calificacion/
│       ├── reportes/
│       └── eventos/
├── tests/                    # Vitest
├── drizzle/                  # Migraciones generadas
├── docs/                     # Arquitectura, ADRs, deployment
└── scripts/                  # Calibración, mantenimiento
```

## ✦ Estándares adoptados (Parte II §23)

- **Pruebas digitales**: 1EdTech QTI 3.0
- **Adaptación**: 1EdTech CAT
- **Padrones**: 1EdTech OneRoster 1.2
- **Eventos pedagógicos**: 1EdTech Caliper Analytics 1.2
- **Credenciales**: W3C Verifiable Credentials 2.0
- **Identidad**: OAuth 2.1 + OpenID Connect
- **APIs**: OpenAPI 3.1
- **Accesibilidad**: WCAG 2.1 AA
- **Calidad**: ISO/IEC 25010, ISO 9001
- **Seguridad**: ISO/IEC 27001:2022 + 27018:2019
- **Geoespacial**: INEGI MGN

## ✦ Roles RBAC (Parte IV §30)

22 roles agrupados en 5 familias. Catálogo completo en `src/lib/catalogos/roles.ts`. Algunos:

- **Directiva**: Director General CEEEY, Coordinadores
- **Técnica**: Psicometristas, Arquitecto, DBA, Oficial de Información
- **Banco/Aplicación**: Elaborador, Revisores 1/2/Árbitro/Editorial/Pertinencia, Aplicador, Calificador
- **Campo**: Director de escuela, Supervisor, Docente
- **Externa**: Estudiante, Tutor, Auditor, Investigador

## ✦ Reglas de negocio (Parte IV §32-37)

Las reglas están codificadas en los servicios de `src/server/`. Cada regla referenciada por código (`RB-01`, `RM-03`, `RA-04`, `RC-05`, `RR-04`, `RG-06`).

## ✦ Cumplimiento normativo

- **LGPDPPSO** + Ley estatal de protección de datos: AIPDP, aviso bilingüe, ARCO
- **Ley General de Educación 2019** y reformas
- **Plan 2022** (DOF 19/08/2022) y **MCCEMS 2023**
- **Ley General de los Derechos Lingüísticos de los Pueblos Indígenas**

## ✦ Licencia

Apache-2.0. El código del SED 2.0 es propiedad pública del Estado de Yucatán y se publica como software libre bajo licencia abierta para promover su replicabilidad.

---

*Documento maestro del SED 2.0 · Mérida, Yucatán · Abril de 2026*
