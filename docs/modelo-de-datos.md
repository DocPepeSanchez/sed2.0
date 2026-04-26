# Modelo de Datos — SED 2.0

> Implementación de Parte III (§26–29) del Documento Maestro.

## Dominios

```
┌─ Identidad ──────┐  ┌─ Curricular ─────┐
│ estudiantes      │  │ campos_formativos│
│ personal         │  │ fases            │
│ tutores          │  │ ejes_articulado. │
│ tutor_estudiante │  │ pda              │
│ escuelas         │  │ categorias_ems   │
│ acomodaciones    │  └──────────────────┘
└──────────────────┘
        │
        ▼
┌─ Banco ──────────┐  ┌─ Aplicación ─────┐  ┌─ Resultados ─────┐
│ retos            │  │ instrumentos     │  │ calificaciones   │
│ reto_versiones   │──▶│ formas           │──▶│ resultados_sesion│
│ parametros_tri   │  │ aplicaciones     │  │ reportes         │
│ revisiones       │  │ sesiones         │  │ alertas          │
│                  │  │ respuestas       │  │ planes_intervenc.│
└──────────────────┘  └──────────────────┘  └──────────────────┘

         ┌─ Transversales ────────────────┐
         │ roles · asignaciones_rol       │
         │ audit_log (append-only)         │
         └─────────────────────────────────┘
```

## Inmutabilidad (P-04)

Tablas append-only — no se permite UPDATE ni DELETE:

- `audit_log` — hash SHA-256 encadenado
- `respuestas` — contenido inmutable; correcciones generan nueva respuesta
- `reto_versiones` — toda modificación crea versión nueva con `contenidoHash`

## Cifrado a nivel campo (ADR-010)

Columnas con sufijo `_enc` se cifran con AES-256-GCM:

- `estudiantes.condicion_bap_enc`
- `estudiantes.condicion_socioemocional_enc`
- `estudiantes.genero_declarado_enc`
- `personal.mfa_secret_enc`

## Catálogos cargados en seed

- 4 Campos Formativos
- 6 Fases
- 7 Ejes Articuladores
- ~ 14 PDA (muestra) — el catálogo completo (~ 2,000) se carga desde Programas Sintéticos del DOF
- 22 Roles RBAC con sus capacidades
- 15 Lenguas indígenas + español (INALI)
- 21 tipos de BAP + 11 acomodaciones
- 3 escuelas demo (1 indígena, 1 general, 1 telesecundaria)

## Diccionario completo

El diccionario extendido con las 35 entidades es un anexo del Documento Maestro. Cada tabla en `src/db/schema/` documenta inline su correspondencia con §29.
