# Documento Maestro de Arquitectura — SED 2.0

> **Rector arquitectónico-normativo** · Tiene precedencia sobre cualquier decisión técnica derivada (Parte II §16).

## 1. Marco normativo

| Marco | Aplicación |
| --- | --- |
| ISO/IEC 25010:2011 | Modelo de calidad de producto software |
| ISO/IEC 27001:2022 | SGSI — Sistema de Gestión de Seguridad |
| ISO/IEC 27018:2019 | Protección de datos personales en la nube |
| ISO/IEC 42010:2011 | Descripción arquitectónica |
| TOGAF 9.2 | Metodología (referencia) |
| MAAGTICSI | Manual mexicano de TIC |

## 2. Principios rectores (P-01 a P-12)

| Código | Principio | Implementación |
| --- | --- | --- |
| **P-01** | Soberanía de datos | Infra mexicana (`DATABASE_URL`); cláusula contractual |
| **P-02** | Interoperabilidad por estándares | QTI 3.0, OneRoster, Caliper, OAuth 2.1, OpenAPI 3.1 |
| **P-03** | Identidad federada única | CURP (estudiantes/tutores) · RFC (personal). Validación: `src/lib/security/curp.ts` |
| **P-04** | Inmutabilidad de evidencia | Versionamiento de `retoVersiones`, `respuestas` append-only, hash SHA-256 |
| **P-05** | Cifrado por defecto | TLS 1.3 + AES-256-GCM a nivel campo: `src/lib/security/field-encryption.ts` |
| **P-06** | Mínimo privilegio | RBAC declarativo: `src/lib/security/rbac.ts` |
| **P-07** | Trazabilidad total | Audit log encadenado: `src/lib/security/audit.ts` (7 años) |
| **P-08** | Accesibilidad por diseño | WCAG 2.1 AA en CI/CD, axe-core, Lighthouse |
| **P-09** | Bilingüismo por diseño | `src/messages/es.json`, `yua.json`, next-intl |
| **P-10** | Disponibilidad operativa | RPO ≤ 15 min · RTO ≤ 4 h · uptime ≥ 99.5% |
| **P-11** | Modular y desacoplado | Bus de eventos (Kafka/RabbitMQ): `src/server/eventos/bus.ts` |
| **P-12** | Open-first | TAO, Moodle, PostgreSQL; propietario sólo con justificación documentada |

## 3. Capas técnicas

### Capa 1 — Psicométrica
Motor TRI/CAT con 1PL (entrada) → 2PL → 3PL. Fisher information para selección adaptativa. Implementación: `src/lib/psicometria/tri.ts`, `cat.ts`, `dif.ts`.

### Capa 2 — Equidad
DIF Mantel-Haenszel · formas paralelas español-maya · acomodaciones BAP automáticas (RA-05).

### Capa 3 — Contenidos
Banco QTI 3.0 con doble revisión ciega (token opaco), filológica y de pertinencia cultural. Workflow: `CREADO → REVISADO_1 → REVISADO_2 → ... → OPERATIVO`.

### Capa 4 — Datos
PostgreSQL 16+ transaccional · ClickHouse/BigQuery analítico (futuro) · MinIO/S3 multimedia.

### Capa 5 — Aplicación
Through-Year (Pilotaje + Diagnóstico + 3 Seguimientos) · cuatro modalidades: `1A1`, `ROTACION`, `GRUPAL`, `OMR`. Offline-first con PWA.

### Capa 6 — Calificación
Triple capa: cerrados auto · IA fine-tuned (Llama 3 / Mistral on-prem) · humano en casos límite. QA muestral 5–10 % · kappa ≥ 0.70.

### Capa 7 — Ecosistema
Bus de eventos para integración con MEJOREDU, SisAT, SAASIL, SIPAEVY, SIAT-EMS. Catálogo de eventos en `src/server/eventos/bus.ts`.

### Capa 8 — Institucional
22 roles · ISO 9001 · ISO 27001 · datos abiertos · Observatorio · Informe Técnico Anual.

## 4. Vista de despliegue

- **Producción**: datacenter en territorio mexicano, multi-AZ
- **Pre-producción**: espejo reducido, sin datos personales reales
- **Desarrollo**: entornos por equipo

Componentes:

- Cluster Kubernetes (stateless)
- PostgreSQL gestionado con replicación síncrona
- Kafka/RabbitMQ
- S3 cifrado · CDN · WAF · DDoS protection
- HSM/KMS para gestión de claves criptográficas

## 5. Vista de seguridad — Zero Trust

- MFA obligatorio para roles administrativos
- Cifrado AES-256 en reposo y TLS 1.3 en tránsito
- RPO ≤ 15 min · RTO ≤ 4 h
- Pentesting anual por proveedor externo
- Notificación de incidentes ≤ 72 h (LGPDPPSO)

## 6. Vista de componentes lógicos (12 componentes)

| Código | Componente | Responsabilidad |
| --- | --- | --- |
| C-01 | Authoring | Editor de retos, gestión del banco |
| C-02 | Catálogo y diccionario | PDA, Campos, Fases, Lenguas, BAP |
| C-03 | Motor TRI/CAT | Estimación θ, selección adaptativa |
| C-04 | Instrumentos | Conformación por blueprint |
| C-05 | Aplicación | Cliente PWA, captura |
| C-06 | Calificación | Auto + IA + humano |
| C-07 | Resultados | θ por estudiante, longitudinal |
| C-08 | Reportes | 5 niveles, PDF, push, datos abiertos |
| C-09 | Alertas tempranas | Detección de riesgo |
| C-10 | Acompañamiento | Plan de intervención |
| C-11 | Identidad y autorización | RBAC, OAuth 2.1 |
| C-12 | Audit log y observabilidad | Registro inmutable |

## 7. Cumplimiento WCAG 2.1 AA

- Foco visible (2.4.7) — verde brillante con offset 2px
- Contraste mínimo 4.5:1 — paleta CEEEY auditada
- Reducción de movimiento (`prefers-reduced-motion`)
- Skip-link a contenido principal
- Sin contenido solo dependiente de color
- Compatibilidad lector de pantalla (`aria-label`, `role`)

## 8. Catálogo de eventos del bus (Parte II §25)

```
estudiante.creado            → SED-Aplicación, Programa Analítico
estudiante.movido            → Todos los módulos
reto.publicado               → Banco público, SED-Instrumentos
instrumento.aplicado         → SED-Calificación, SisAT
respuesta.calificada         → SED-Resultados
resultado.generado           → Reportes, Alertas, Programa Analítico
alerta.estudiante            → Director, Supervisor, USAER, SAASIL
intervencion.registrada      → SED, SAASIL, Programa Analítico
observacion.realizada        → SED (contexto), Retroalimentación
programa.analitico.actualizado → SED, Planeación Didáctica
```
