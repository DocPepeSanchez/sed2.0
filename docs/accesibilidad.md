# Accesibilidad — WCAG 2.1 AA por diseño (P-08)

> Auditada anualmente por CONADIS (Parte I §10).

## Criterios cumplidos

| Criterio WCAG | Implementación |
| --- | --- |
| 1.1.1 Texto alternativo | `alt` obligatorio en todo `multimedia` del banco |
| 1.3.1 Información y relaciones | Encabezados semánticos (`h1`/`h2`), `<main id="contenido-principal">` |
| 1.4.3 Contraste mínimo 4.5:1 | Paleta `ceeey-700` sobre blanco, verificada |
| 1.4.4 Cambio de tamaño de texto 200% | `text-size-adjust: 100%` |
| 2.1.1 Teclado | Toda interacción soporta teclado |
| 2.3.3 Reducción de animación | `prefers-reduced-motion` aplica `0.01ms` |
| 2.4.1 Saltar bloques | `.skip-link` a `#contenido-principal` |
| 2.4.7 Foco visible | `outline: 3px solid` con offset 2px |
| 3.1.1 Idioma de la página | `<html lang>` por locale |
| 3.1.2 Idioma de partes | `lang` en bloques traducidos |
| 4.1.2 Nombre, rol, valor | `aria-label`, `aria-pressed` en `LocaleSwitcher` |

## Acomodaciones para BAP (RA-05)

Se aplican automáticamente al iniciar sesión:

- **Tiempo extendido**: 1.5x · 2x · 3x
- **Audio**: lectura en voz alta del enunciado
- **Magnificación**: 2x interfaz
- **Contraste alto**: clase `.alto-contraste`
- **Calculadora**, **escriba**, **lector**, **descansos**, **sala con estímulo reducido**

## Auditoría continua

- `@axe-core/playwright` ejecutado en CI sobre cada PR.
- Lighthouse score ≥ 95 en accesibilidad.
- Pruebas con lector NVDA + VoiceOver al menos cada release.
