# ADR-002 — TRI 1PL como modelo psicométrico de entrada

* **Estado**: Adoptado
* **Fecha**: 2026-04

## Contexto

El SED 2.0 implementa Teoría de Respuesta al Ítem (TRI) con migración planificada hacia modelos más complejos según madure el banco y la cantidad de respuestas calibradas.

Alternativas evaluadas:

| Modelo | Datos requeridos | Complejidad | Apropiado en |
| --- | --- | --- | --- |
| Teoría Clásica de Tests (TCT) | bajos | baja | Línea base — pero limitada |
| 1PL / Rasch | medios (~500/ítem) | baja | Pilotaje y arranque |
| 2PL | medios-altos (~1000/ítem) | media | Banco consolidado |
| 3PL | altos (~2000/ítem) | alta | Banco maduro |

## Decisión

- **Año 1**: 1PL (Rasch). Estimación EAP. Base teórica simple, requiere muestras menores.
- **Año 2**: migración a **2PL** según consolidación del banco (parámetro de discriminación `a`).
- **Año 4**: evaluación de **3PL** para reactivos de opción múltiple en Bachillerato (parámetro de pseudo-azar `c`).

## Consecuencias

- Cumplimiento de **Standards for Educational and Psychological Testing** (AERA-APA-NCME, 2014).
- Implementación: `src/lib/psicometria/tri.ts` soporta los tres modelos desde el inicio para evitar refactor.
- La Unidad Psicométrica (Coordinación/Senior + Analista) define la migración por dictamen formal (RG-06).
