# ADR-001 — TAO como motor evaluativo base

* **Estado**: Adoptado
* **Fecha**: 2026-04
* **Autores**: Comité Técnico CEEEY

## Contexto

El SED 2.0 requiere una plataforma de pruebas digitales que cumpla 1EdTech QTI 3.0, soporte CAT (Computerized Adaptive Testing), permita extensibilidad y respete la soberanía digital del Estado de Yucatán (P-01).

Alternativas evaluadas:

| Producto | Tipo | Costo (3 años) | QTI 3.0 | CAT | Soberanía |
| --- | --- | --- | --- | --- | --- |
| TAO (open-source) | Open-source | bajo | sí | sí | total (on-prem) |
| Cambium iAM | Propietario | alto | sí | sí | parcial |
| Construcción interna | Custom | medio-alto | si construido | si construido | total |
| Smarter Balanced (subset) | Open-source | bajo | sí | parcial | total |

## Decisión

Adoptar **TAO** como motor evaluativo base, con extensiones propias del CEEEY para:

- integración con padrón `SAASIL` y CURP federada
- bilingüización español-maya
- workflow de doble revisión ciega (RB-02)
- conector al motor TRI/CAT propio

## Consecuencias

- **Positivas**: cumplimiento total de QTI 3.0, P-12 (open-first), comunidad activa, capacidad de auditar el código.
- **Negativas**: requiere expertise interno en PHP (TAO está construido en PHP); mitigado con capacitación al equipo de Tecnología.
