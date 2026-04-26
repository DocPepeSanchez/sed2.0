# Reglas de negocio del SED 2.0

> Catálogo completo en correspondencia con Parte IV §32–37 del Documento Maestro.

## RB · Banco de retos (`src/server/banco/service.ts`)

| Código | Regla | Implementación |
| --- | --- | --- |
| RB-01 | Solo Elaborador certificado puede crear | `crearReto()` + RBAC ELABORADOR |
| RB-02 | Doble revisión ciega | `registrarRevision()` con `tokenCiego` y máquina de estados |
| RB-03 | Revisión filológica obligatoria | Estado `REVISADO_FILOLOGICO` |
| RB-04 | Pertinencia cultural para población maya | Revisión `PERTINENCIA` |
| RB-05 | Calibración con muestra ≥ 500 | `calibrarReto()` lanza error si `nMuestra < 500` |
| RB-06 | Versionamiento inmutable | `retoVersiones` append-only con `contenidoHash` |
| RB-07 | Retiro lógico, no borrado | `retirarReto()` cambia estado a `RETIRADO` |
| RB-08 | Exposición ≤ 30% | Penalización en CAT (`seleccionarSiguienteReto`) |
| RB-09 | Diccionario de claves del Comité | Validación Zod en `NuevoRetoSchema.clave` |
| RB-10 | Bilingüización obligatoria año 2+ | `pareId` enlaza versiones es/yua |

## RM · Motor adaptativo (`src/lib/psicometria/cat.ts`)

| Código | Regla | Implementación |
| --- | --- | --- |
| RM-01 | Modelo TRI declarado | `parametros_tri.modelo` |
| RM-02 | Estimación θ tras cada respuesta | `aplicarRespuesta()` |
| RM-03 | Selección por información de Fisher | `seleccionarSiguienteReto()` |
| RM-04 | Cumplimiento de blueprint | Filtros duros por PDA y dificultad |
| RM-05 | Sin presentación duplicada | `retosPresentados: Set<string>` |
| RM-06 | Equating con anclaje 10–20% | `proporcionAnclaje` y `retosAnclaje` |
| RM-07 | Espera calificación de abiertos | Solo se actualiza θ con respuesta calificada |
| RM-08 | Detención por longitud / EE / tiempo | `debeTerminar()` |
| RM-09 | Acomodaciones automáticas | Aplicadas en `iniciarSesion()` |

## RA · Aplicación (`src/server/aplicacion/service.ts`)

| Código | Regla | Implementación |
| --- | --- | --- |
| RA-01 | 30 días de anticipación | Validación en `programarAplicacion()` |
| RA-02 | Aplicador certificado | RBAC + bandera `cert_vigente` |
| RA-03 | Verificación de CURP | `iniciarSesion()` valida padrón |
| RA-04 | Modalidad por censo | Lectura de `escuelas.censoInfraestructura.modalidadAplicacion` |
| RA-05 | Acomodaciones automáticas | `acomodacionesAplicadas` poblado al iniciar sesión |
| RA-06 | Acta firmada para publicar | `cerrarAplicacionConActa()` |
| RA-07 | Bitácora de incidentes | `registrarIncidente()` |
| RA-08 | Ventana de reaplicación | Job programado tras `ventanaFin` |
| RA-09 | Movilidad estudiantil | `estudianteCurp` única persiste cambios |
| RA-10 | Confidencialidad operativa | RBAC restringe lectura durante aplicación |

## RC · Calificación (`src/server/calificacion/service.ts`)

| Código | Regla | Implementación |
| --- | --- | --- |
| RC-01 | Cerrados automáticos | `calificarAutomatico()` |
| RC-02 | IA en abiertos cortos | `calificarIaAbiertoCorto()` |
| RC-03 | QA muestral 5–10% | `TASA_QA_MUESTRAL = 0.075` |
| RC-04 | Casos límite a humano | `requiereHumano` calculado por proximidad al corte |
| RC-05 | Kappa ≥ 0.70 | `monitorearConcordanciaIaHumano()` |
| RC-06 | Doble calificación humana | Flujo de calificación dual con árbitro |
| RC-07 | 95% en ≤ 72 h | KPI medido en `tiempoProcesamientoSeg` |
| RC-08 | Trazabilidad completa | `metodo`, `calificadorRfc`, `concordanciaKappa` |

## RR · Reportes (`src/server/reportes/service.ts`)

| Código | Regla | Implementación |
| --- | --- | --- |
| RR-01 | Cinco niveles | `nivelReporteEnum` |
| RR-02 | Reporte Familias bilingüe | `idioma` en reporte estudiante |
| RR-03 | Lenguaje claro | `sugerencias*()` evita jerga técnica |
| RR-04 | Alerta caída > 1 SD | `evaluarAlertas()` |
| RR-05 | Alerta grupo > 0.5 SD | Job consolidador por grupo |
| RR-06 | Datos abiertos | `Observatorio` publica reportes con licencia abierta |
| RR-07 | Anonimización umbral 5 | `UMBRAL_ANONIMATO` |
| RR-08 | Histórico longitudinal | `cuerpo.longitudinal` |

## RG · Comités

| Código | Regla |
| --- | --- |
| RG-01 | Quórum declarado |
| RG-02 | Acta firmada |
| RG-03 | Conflicto de interés declarado |
| RG-04 | Periodicidad mínima |
| RG-05 | Publicación de acuerdos |
| RG-06 | Doble dictamen para psicométricos |
| RG-07 | Revisión anual de reglamentos |
