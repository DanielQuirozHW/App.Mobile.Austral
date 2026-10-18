# Licencias y vacaciones

Contrato y reglas del módulo, leídos del código de `HW-Austral/Portal-Austral-Dev` (solo lectura). Lo **inferido** o no confirmado está marcado como tal y repetido en `docs/DECISIONES.md` (48 a 55) y `docs/PENDIENTES.md`.

El módulo fue confirmado por Daniel el 2026-10-18. Es una sola pantalla (`LicenciasScreen`) con pestañas: Licencias, Vacaciones, Calendario y Equipo (esta última solo si la persona es líder).

## Mapa de archivos de la app

| Capa | Archivos |
|---|---|
| `domain/licencias/` | `estados.ts` (statuscode, pestañas, reglas de cancelar / adjuntar / ver), `tipos.ts`, `mapeo.ts` (filas del CRM → tipos), `tiposDeLicencia.ts` (filtros por perfil, rango de meses, límites de días), `validaciones.ts` (formularios y motivos de rechazo), `payload.ts` (cuerpos que se mandan), `vacaciones.ts` (período solicitable y progreso), `calendario.ts` (eventos, colores, grilla del mes), `fechasCrm.ts` (días como texto `yyyy-MM-dd`), `mudanza.ts` |
| `infrastructure/licencias/` | `licenciasApi.ts`, `vacacionesApi.ts`, `equipoApi.ts` |
| `application/licencias/` | `licenciasService.ts` (acciones con sus avisos), `adjuntosService.ts` (listar y abrir adjuntos de una licencia) |
| `presentation/stores/` | `licenciasStore.ts` (propio), `equipoStore.ts` (gestión del líder); cada bloque es `{ datos, cargando, cargado, error }` |
| `presentation/components/licencias/` | Base: `EstadoChip`, `Pestanias`, `ListaPaginada`, `TarjetaSolicitud`, `NotaInfo`, `SelectorArchivos`, `ListaAdjuntosLicencia`, `useAdjuntosDeLicencia`, `DomicilioDeclarado`, `FormularioDomicilio`, `RespuestaLider`, `VacacionesPanel`. Modales: `ModalSolicitarLicencia`, `ModalVerLicencia`, `ModalLicenciaEquipo`, `ModalSolicitarVacaciones`, `ModalVerVacacion`, `ModalAprobarVacacion`, `ModalDetalleCalendario`. Secciones: `MisLicenciasSeccion`, `VacacionesSeccion`, `CalendarioSeccion`, `GestionSeccion` |
| `presentation/screens/licencias/` | `LicenciasScreen.tsx` (pestañas, recarga al tirar hacia abajo, parámetro `seccion`) |

En el portal, los componentes están en `licencias/_components/licencias/Componentes/` (`ModalSolicitud`, `ModalLicencias`, `ModalLicenciasEquipo`, `DomicilioDeclarado`, `ModalSolicitarVacaciones`, `ModalAprobarVacacion`, `ModalVerVacacion`, `ModalCalendario`) y las grillas en `src/columns/` (`columnsLicencias`, `columnsVacaciones`, `columnsGestionSolicitudes`).

## Estados (`statuscode` de `new_licencia`)

| Código | Licencia | Vacación (si difiere) |
|---|---|---|
| 1 | Solicitada | |
| 100000000 | Aprobada | |
| 100000001 | No Aprobada | No aprobada |
| 100000002 | Cancelada | |
| 100000003 | Gozada | |
| 100000004 | Vigente | |
| 100000005 | En curso | En Curso |
| 100000006 | Pendiente de validación por Dirección de Personas | |
| 100000007 | Solicitada. Pendiente Certificado | |
| 100000008 | Validada, documentación pendiente | |

Pestañas de mis licencias: Ingresadas (1, 100000006, 100000007, 100000008), Aprobadas (100000000, 100000003, 100000005), Rechazadas (100000001), Canceladas (100000002). Mis vacaciones: Ingresadas (100000006, 1), el resto igual. Gestión del líder: Ingresadas (1, 100000006, 100000007, 100000008), Aprobadas (100000000, 100000003, 100000004, 100000005), Rechazadas (100000001).

## Licencias propias

- **Solicitar** (`ModalSolicitud`): tipo, fecha de inicio, fecha fin, días solicitados (calculado, inclusivo), recuadro "Días" con disponibles y máximo de días corridos, y certificado según el tipo: `1` obligatorio al solicitar, `2` obligatorio pero se puede cargar después (la licencia nace en 100000007 si no hay archivos). Licencia por mudanza: sección "Nuevo domicilio a declarar" (calle, nro., piso, depto / lote, código postal, país, provincia, localidad filtrada por provincia).
- **Archivos**: se rechaza todo archivo de 15000000 bytes o más ("El archivo no puede superar los 15 megas"), se vacía la lista y se aborta el envío.
- **Ver** (`ModalLicencias`): "Licencia" / "Solo lectura", pestañas Licencia y Adjuntos; muestra el domicilio declarado si es mudanza y el motivo de rechazo si está No Aprobada. Si el estado permite adjuntar certificado (1, 100000006, 100000007, 100000008) aparece el cargador y "Enviar certificado".
- **Cancelar**: no en No aprobada, Cancelada, Gozada ni En curso, ni en una Aprobada cuya fecha desde ya llegó.

## Vacaciones propias

- Un panel por período con "Progreso de Vacaciones" (gozados + 2 por cada penalidad aplicada, solicitados, pendientes) y días disponibles.
- **Solicitar** (`ModalSolicitarVacaciones`): período, notas (los lunes, goce continuo), fechas, días (máximo = días pendientes totales), comentarios (hasta 200 caracteres / palabras). Las fechas deben ser de hoy en adelante y estar dentro del período de goce.
- El botón Solicitar del período solo aparece si hoy está dentro de las fechas del período.
- **Ver** se oculta en Solicitada y Pendiente de validación. **Cancelar** no en Gozada, En curso ni No aprobada. Textos de confirmación: "¿Desea cancelar la solicitud de vacaciones seleccionada?" / "Esta acción no se puede deshacer." (Si / No).

## Gestión del líder

- **Licencias del equipo** (`ModalLicenciasEquipo`): "Aprobación" si el estado es 1 o 100000007, si no el tipo de licencia. Aprobar / Rechazar solo si `idAprobador1` es el empleado en sesión, el estado es 1 o 100000007 y, cuando el certificado es `2` y la licencia requiere validación, ya hay adjuntos. Rechazar exige motivo (hasta 300 caracteres). Confirmación "¿Desea aprobar/rechazar esta licencia?" con Si / No.
- **Vacaciones del equipo** (`ModalAprobarVacacion`): botones solo si `reportaA` es el empleado en sesión; motivo de hasta 200 caracteres con contador "N caracter(es) restantes".
- **Lista** (`columnsGestionSolicitudes`): columnas Acciones, Tipo, Colaborador, Concepto, Días solicitados, Fecha desde, Fecha hasta, Estado. Vacación: "Responder" si el estado es 1, si no "Ver". Pestañas Ingresadas / Aprobadas / Rechazadas / Días pendientes (Colaborador, Período, Días pendientes, Fecha desde, Fecha hasta).
- Las licencias del equipo se piden por `new_aprobador1` y las vacaciones por `reportaA`: son dos fuentes distintas, igual que en el portal.

## Calendario

El portal usa `react-big-calendar`; la app dibuja una grilla mensual propia (lunes a domingo) con puntos de color por persona (hash del nombre, como el portal), lista del día y detalle (`ModalCalendario`: título "{tipo} — {empleado}", chip de estado, chip de días, Empleado, Período, Solicitado el). No se dibujan las Canceladas ni las No Aprobadas; los feriados sí.

## Fechas

Los días se manejan como texto `yyyy-MM-dd` y nunca se convierten por UTC (regla del portal, `src/@core/utils/fechaCrm`).

## Inferido o no confirmado

Ver decisiones 48 a 55 en `docs/DECISIONES.md`.
