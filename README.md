# SED — Sistema de Evaluación Adaptativa Multi-Etapa

Plataforma de la **Prueba de Concepto (Etapa 1)** para evaluar el pensamiento
crítico mediante un flujo cognitivo de tres pasos por reactivo.

**Renacimiento Maya / Yucatán 2024–2030**

## Identidad de marca

| Elemento | Valor |
| --- | --- |
| Color primario | Berry/Magenta `#970E48` (Pantone 7641 C) |
| Color secundario | Dorado `#C2995C` (Pantone 7562 C) |
| Fondos | Off-white `#EFEDEA` · Crema `#E2DED7` |
| Tipografía | Calibri (alternativa a Lato) |

Elementos aplicados: barra superior berry, líneas doradas decorativas,
separadores con fondo berry y acento dorado, pie de página institucional y
portada/cierre estilo manual de presentaciones.

## Funcionalidad implementada

- **Flujo cognitivo de 3 pasos** por reactivo: producción abierta (1A),
  reconocimiento discriminativo con barajado Fisher-Yates (1B) y autorreporte
  procedimental (1C).
- **Máquina de estados finita determinista** (12 estados) con invariantes
  INV-01..06 y **commit transaccional** de los 3 pasos como unidad atómica
  (con rollback).
- **Triple coordenada cognitiva**: habilidades de Facione, niveles de
  Anderson-Krathwohl y componentes metacognitivos de Pintrich.
- **Bancos A (Plan 2022 NEM) y B (MCCEMS)** — no se mezclan en un instrumento.
- **RBAC**: estudiante por token de un solo uso; administración del piloto con
  usuario y contraseña.
- **Auditoría append-only** encadenada con hash SHA-256 e **idempotencia** por
  `sync_event_id` único.
- **Patrones inferenciales P1–P8**, perfil cognitivo y **exportación
  anonimizada** en CSV UTF-8 (BOM).
- **Panel de administración**: ventana de aplicación, generación de tokens,
  monitoreo de sesiones, auditoría y exportación.

## Stack

Next.js 14 (App Router), TypeScript, Tailwind CSS. Sin dependencias nativas:
hashing con `node:crypto` (scrypt/HMAC) y almacén en memoria sembrado (POC).

## Desarrollo

```bash
npm install
npm run dev
# http://localhost:3000
```

### Credenciales de demostración (POC)

- **Administración** — usuario `admin`, contraseña `Renacimiento2024`.
- **Estudiantes** — los tokens se generan al sembrar; créalos o consulta desde
  el panel de administración.

> Los datos viven en memoria: se reinician con el servidor. Es una POC de
> Etapa 1, no un despliegue productivo.
