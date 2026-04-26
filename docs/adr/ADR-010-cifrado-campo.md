# ADR-010 — Cifrado a nivel campo (AES-256-GCM)

* **Estado**: Adoptado
* **Fecha**: 2026-04

## Contexto

Datos como Barreras para el Aprendizaje y la Participación (BAP), género declarado y condición socioemocional son datos sensibles según LGPDPPSO. El cifrado a nivel disco solo protege contra robo físico; no protege contra acceso indebido en BD.

## Decisión

Aplicar cifrado a nivel campo (AES-256-GCM) sobre los siguientes atributos:

- `estudiantes.condicion_bap_enc`
- `estudiantes.condicion_socioemocional_enc`
- `estudiantes.genero_declarado_enc`
- `personal.mfa_secret_enc`

Implementación: `src/lib/security/field-encryption.ts`. Clave maestra desde KMS/HSM en producción; variable de entorno en desarrollo.

## Consecuencias

- Cumple ISO/IEC 27018:2019 y P-05.
- Costo: la BD no puede indexar/buscar por estos campos; las consultas se ejecutan en aplicación.
- Las claves rotan anualmente — proceso documentado en `docs/seguridad.md`.
