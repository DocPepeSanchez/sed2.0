# ADR-003 — PostgreSQL como base transaccional

* **Estado**: Adoptado
* **Fecha**: 2026-04

## Contexto

El modelo de datos del SED tiene 35+ entidades, requiere transacciones ACID, soporte JSON, extensiones geoespaciales y trazabilidad. La capa transaccional debe ser open-source y soberana.

## Decisión

PostgreSQL 16+ como base transaccional única. Drizzle ORM como capa de abstracción type-safe.

Extensiones obligatorias:

- `pg_trgm` para búsqueda de retos por texto
- `pgcrypto` para HMAC en audit log
- `PostGIS` para geometría de escuelas (Capa 4)
- `pgvector` (futuro) para embeddings de retos en calificación con IA

## Consecuencias

- ACID completo · soporta JSONB para metadatos flexibles del banco.
- Open-source y maduro · operable por DBA con licencia Apache.
- Para analítica masiva (Observatorio): pipeline a ClickHouse o BigQuery vía Kafka — fuera del alcance de este ADR.
