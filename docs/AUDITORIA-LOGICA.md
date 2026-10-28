# Auditoría de lógica: app vs. portal (módulos del MVP)

Pedido de Daniel (2026-10-27): "una auditoría completa del funcionamiento. Si es lo mismo del portal a nivel de lógica. De todos los módulos del mvp."

**Método**: solo lectura de código. Portal = `HW-Austral/Portal-Austral-Dev` (rama `master`, sha `b18827e`); app = `DanielQuirozHW/App.Mobile.Austral` (rama `main`). **No se ejecutó, probó ni llamó a la API nada.** Lo "verificado" significa "leído en el portal y en la app y coincide"; lo "inferido" es lo que no se pudo confirmar leyendo.

Módulos auditados: Mi perfil (Datos personales y secciones de Perfil), Licencias y vacaciones, Plan de trabajo, y la base (Inicio, Notificaciones, Ajustes, menú, selección de puesto). Las auditorías anteriores de Mi perfil y de paridad están en `AUDITORIA-DATOS-PERSONALES.md` y `AUDITORIA-PARIDAD.md`; esta las complementa.

## 1. Divergencias encontradas y corregidas

| # | Módulo | Qué difería | Corrección |
|---|---|---|---|
| 1 | Licencias (modales de líder) | El motivo de rechazo guardado no se mostraba en los modales de Gestión. | Se muestra el motivo guardado. |
| 2 | Licencias (solicitud) | El motivo de rechazo de una licencia no se recortaba (trim). | Se recorta como en el portal. |
| 3 | Vacaciones (líder) | El colaborador se tomaba de otro campo. | Se usa `name`, como el portal. |
| 4 | Gestión | El filtro inicial de `tipo` no coincidía. | Igualado al portal. |
| 5 | Notificaciones | "Ir" perdía pestaña, sección y tipo del destino. | Los conserva. |
| 6 | Licencias | `LicenciasScreen` no seguía los parámetros de ruta. | Sigue los parámetros. |
| 7 | Vacaciones (propias) | Se mostraban varios períodos y el botón Solicitar dependía de la ventana de goce. | Un solo período: el primero que no venció, por vencimiento ascendente (`elegirPeriodoSolicitable`). Solicitar habilitado solo si hay uno; si no, aviso "En este momento no hay un periodo activo para la carga de vacaciones." |
| 8 | Vacaciones (propias) | La pestaña Canceladas tenía acciones. | Sin columna de acciones, como el portal. |
| 9 | Calendario | Los feriados usaban el color de estado. | Ámbar `#ff9800`, como `Calendar.tsx`. |

Los commits están en `main` del repo de la app.

## 2. Verificado igual que el portal

**Licencias y vacaciones**
- Pestañas de vacaciones: Ingresadas {1, 100000006}, Aprobadas {100000000, 100000003, 100000005}, Rechazadas 100000001, Canceladas 100000002.
- Acciones: "Ver" oculto en 1 y 100000006; "Cancelar" oculto en 100000003, 100000005 y 100000001.
- Período solicitable: `diaCrm(vencimiento) >= hoy`, orden por vencimiento, primero. Ya filtrado por apertura en el store.
- Tipos de licencia, estados, cálculo de progreso, store y servicio (`domain/licencias/*`, `application/licencias/licenciasService.ts`).

**Plan de trabajo**
- Estados: editable con 1 o 100000000; vigente 100000002; pestaña Observaciones solo con 100000000.
- Lectura de observaciones: se registra al entrar a la pestaña (PUT `api/hrfactors/plandetrabajodocente`).
- Edición de Docencia (comentario de horas, asesoramiento: alumnos, entrevistas, horas) y de Investigación (formación/vinculación, tipo de carga con días obligatorios solo con tipo "Días"): mismos campos, mismo tope de 1000 caracteres y mismo botón deshabilitado por estado (`DatosDocenciaPta.tsx`, `DatosInvestigacionPta.tsx` vs. `ModalPlanDeTrabajoDocente.tsx`).
- **Envío a Sec. Académico**: se exige informe del año anterior adjunto (mensaje "No se puede enviar el PTA. Por favor, cargue el Informe PTA del año Anterior."); confirmación "¿Está seguro de enviar el Plan de Trabajo Anual? Luego de esta acción no se podrá modificar."; PUT `api/hrfactors/cambiarRazonParaElEstadoPTA` con `{new_plandetrabajodocenteid, statuscode}`; botón deshabilitado fuera de los estados 1 y 100000000 (portal: `usePlanDeTrabajoStore.cambioEstadoPta`, app: `infrastructure/pta/ptaApi.ts` y `domain/pta/payloads.ts`).
- Alta/edición/baja de cada sección: la app refresca lista, PTA e indicadores tras cada cambio (ver diferencia consciente abajo).

## 3. Diferencias conscientes o menores (no se corrigen)

- Calendario: grilla mensual con lista del día en vez de Mes/Semana/Día/Agenda; el detalle del feriado se abre en la app y no en el portal.
- Chip de estado del modal (tinte) y "día(s)".
- Gestión de líder: si falta el tipo, cae a 'licencias'.
- Sin tarjetas de resumen general.
- Aviso (toast) si falta el id del tipo de vacación.
- Nota del período siempre visible; encabezado "Período / Disponibles" en el panel agregado por la app.
- Leyenda de progreso: muestra Gozados/Solicitados aun sin total (el portal dibuja solo la barra vacía).
- Solicitar deshabilitado: el tooltip del portal pasa a `accessibilityLabel` más el aviso.
- Disposición de la tarjeta de días y del texto de ayuda en la solicitud de licencia.
- El layout del portal no tiene guarda por rol en esas páginas.
- Interceptor: diferencia en cómo se agrega el Bearer.
- PTA: la fecha de lectura de observaciones se manda como `-03:00` (hora de Argentina); el portal usa `utcOffset(180)` (`+03:00`). **Es el mismo instante**, solo cambia la forma de escribirlo. No se alinea.
- PTA: la lectura de observaciones usa los valores guardados del plan, no los del formulario sin guardar.
- PTA: la app refresca siempre las tres lecturas tras un cambio de sección (el portal omite alguna según la sección).
- Menú y visibilidad: aproximaciones ya documentadas en la decisión 100.

## 4. Inferido (no confirmado leyendo)

- `trim` de yup, `licenciaProlongada` indefinido y `extractApiErrorMessage` vs. `mensajeDeErrorApi`: se asumieron equivalentes.
- El código nativo de cancelación no se verificó.
- PTA: de los modales de sección del portal (`modales/`, 18 secciones) se contrastó la estructura y los textos de lo leído antes (definiciones en `domain/pta/*`); **no se releyó una por una cada validación de cada modal en esta pasada**. Si Daniel quiere el barrido campo por campo de las 18, es una tarea aparte.
- `editarDiasHorasInvestigacion` del portal: no se encontró su definición exacta en la copia local del store; el payload de la app (`armarPayloadDiasHoras`) se contrastó en la pasada anterior.
- Botón "Guardar" de Total Investigación: la app lo deshabilita si no hay tipo de carga; el portal lo deja habilitado. Efecto práctico: la app evita un envío sin tipo.

## 5. Lo que NO se pudo comprobar

- **No se corrieron tests**: si el repo tiene tests de `resolverDestino` (notificaciones), puede que la forma del resultado haya cambiado con el arreglo "Ir conserva pestaña, sección y tipo" y haya que ajustarlos.
- No se verificó que `Docencia` e `Investigacion` reaccionen a un cambio de parámetros estando ya montadas.
- Nada se probó contra la API real. Las pruebas las hace Daniel.

## 6. Pendiente de decisión

- Las notificaciones con destino no disponible hoy muestran una alerta; podrían abrir la pantalla "En construcción". No se cambió.
