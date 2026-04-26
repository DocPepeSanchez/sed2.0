# Política de seguridad — SED 2.0

> Cumple ISO/IEC 27001:2022 + ISO/IEC 27018:2019 (P-05, P-06, P-07).

## Modelo Zero Trust

- Ninguna red ni dispositivo es confiable por defecto.
- Todo acceso se autentica (OAuth 2.1 + OIDC), autoriza (RBAC) y audita.
- MFA obligatorio para todos los roles administrativos (Familia Directiva y Familia Técnica).

## Cifrado

| Capa | Algoritmo |
| --- | --- |
| Tránsito | TLS 1.3 (HSTS habilitado) |
| Reposo (disco) | AES-256 a nivel volumen |
| Reposo (campo PII) | AES-256-GCM con KMS/HSM (ADR-010) |
| Hashing contraseñas | Argon2id (memoria 64 MiB, t=3, p=4) |
| Audit log | SHA-256 encadenado (P-07) |

## Gestión de claves

- Clave maestra `FIELD_ENCRYPTION_KEY` reside en KMS/HSM.
- Rotación anual obligatoria.
- Las claves anteriores se preservan para descifrar registros históricos (key versioning).

## Controles ISO 27001

- A.5 Política de seguridad firmada por Director CEEEY.
- A.8 Gestión de activos con clasificación: público / interno / confidencial / sensible.
- A.9 Control de accesos por RBAC + MFA.
- A.10 Cifrado por defecto.
- A.12 Operaciones: respaldos cifrados, logs centralizados.
- A.16 Gestión de incidentes — notificación ≤ 72 h (LGPDPPSO).
- A.17 Continuidad de negocio: RPO ≤ 15 min · RTO ≤ 4 h.
- A.18 Cumplimiento normativo (LGPDPPSO + ley estatal).

## Pruebas y auditorías

- Pruebas de penetración anuales por proveedor externo certificado.
- Revisión SAST en CI/CD (eslint-plugin-security, semgrep).
- Auditoría externa anual por Oficina de Información o INAIP.
- Auditoría de accesibilidad WCAG 2.1 AA por CONADIS.

## Capacitación

- Todo el personal recibe capacitación anual obligatoria en seguridad.
- Roles directivos y técnicos: capacitación específica adicional en LGPDPPSO.

## Respuesta a incidentes

1. Detección por SIEM o reporte interno
2. Triaje por Oficial de Información (severidad)
3. Contención y erradicación
4. Notificación al titular (LGPDPPSO ≤ 72 h)
5. Lecciones aprendidas y mejora continua (ISO 9001)
