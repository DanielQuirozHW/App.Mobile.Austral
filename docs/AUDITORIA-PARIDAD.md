# Auditoría de paridad con el portal (2026-10-26)

Pedido de Daniel: revisar **todos** los módulos del MVP contra el código del portal, dejarlos con la misma lógica y corregir lo que difiera. Se hizo **leyendo**: nada se ejecutó, nada se probó y no se llamó a la API. Fuente: `HW-Austral/Portal-Austral-Dev`, rama `master`, sha `40f665d`. App contrastada en `main` (último commit de código de esta auditoría: `efac2e5`).

Decisiones asociadas: **94**, **95**, **97** y **98** (`DECISIONES_89_en_adelante.md`).

## 1. Resultado por módulo

| Módulo | Contrastado contra | Resultado | Commit |
|---|---|---|---|
| Datos personales | `legajo/datos-personales/page.tsx`, `useLegajoStore.ts`, `ModalHijos`, cónyuge, validaciones, payload, catálogos | Dos divergencias corregidas (ver 2) | `8cbc5b4` |
| Documentación | `legajo/documentacion/page.tsx`, hooks, modales de carga y de adjuntos | Una divergencia corregida (ver 2) | `8cbc5b4` |
| Formación | stores y modales de Formación | Divergencias corregidas | `146bb53` |
| Trayectoria profesional | stores y modales | Divergencias corregidas | `2b1794f` |
| Extensión | stores y modales | Divergencias corregidas | `bc813e7` |
| Gestión académica | stores y modales | Divergencias corregidas | `2253c79` |
| Docencia | stores y modales | Divergencias corregidas | `3b02cf2` |
| Investigación (financiamientos y formación de RR. HH.) | stores y modales | Divergencias corregidas | `c9994925` |
| Investigación (jurados, pertenencia, categorización externa, Prinuar) | stores y modales | Divergencias corregidas | `8b957b1`, `2b2b06a` |
| Aspecto general de las pantallas | tema del portal | Pasada de UI | `1cfe34e` |
| Aspecto contra los overrides del tema (campos, tarjetas, diálogos, pestañas, chips) y márgenes de Notificaciones / Plan de Trabajo | `src/@core/theme/palette` y `overrides` | Corregido (ver 2c) | `edd1de0` |
| Revisión estática de colores escritos a mano, pull-to-refresh, reintentos, Plan de trabajo habilitado | componentes y pantallas de la app | Corregido (ver 2d) | `efac2e5` |
| Licencias (propias y del equipo) | ver 3 | **Sin divergencias encontradas** | (sin cambios) |
| Vacaciones: panel, solicitud, aprobación, detalle, consultas, cancelación | ver 3 | Divergencia corregida en el panel (ver 2b) | `43ec0af` |
| Calendario y pestañas de Licencias y vacaciones | `licencias/page.tsx`, `CalendarioWrapper.tsx`, `Calendar.tsx` | Dos divergencias corregidas (ver 2b) | `8faedbc` |
| Inicio | `(dashboard)/page.tsx`, `useGetFeriados.ts`, `useGetCumpleanios.ts` | **Sin divergencias encontradas** | (sin cambios) |
| Notificaciones | `notificaciones/page.tsx`, `useGetNotificaciones.ts`, `rutaNotificacion.ts`, `getNotificacionesEmpleado` | **Sin divergencias encontradas** | (sin cambios) |

## 2. Divergencias corregidas (Datos personales y Documentación)

- **Guardar datos personales** (`src/application/legajo/legajoService.ts`): el `PUT` de `useLegajoStore.actualizacionLegajo` del portal traga el error y devuelve `undefined`. La app ahora hace lo mismo: `actualizarLegajo(...).catch(() => null)` y devuelve `false` si no hay resultado. La baja del cónyuge (`eliminarFamiliar`) sigue lanzando error.
- **Modal de carga de documento** (`ModalCargarDocumento.tsx`, `DocumentacionScreen.tsx`): el encabezado muestra el nombre del documento y, debajo, su descripción (`titulo`), como el modal del portal.

## 2b. Divergencias corregidas (Vacaciones y calendario)

- **Panel de vacaciones** (`src/presentation/components/licencias/VacacionesPanel.tsx`, commit `43ec0af`). Portal: `licencias/_components/vacaciones/components/VacacionesPanel.tsx`.
  - El portal dibuja **tres** tarjetas (la de "Días a Gozar" está comentada allá): Días Solicitados, Días Pendientes y Días Gozados. La app dibujaba cuatro números; se quitó "Días a gozar".
  - Faltaban las descripciones ("Días en proceso de solicitud / Días aprobados", "Días pendientes de ser solicitados", "Días ya utilizados"), el texto de ayuda de Solicitados y el desglose de Pendientes (correspondientes, adicionales, período anterior, con total) y de Gozados. Ahora están; el Popover y el Tooltip del portal pasan a un diálogo que se abre al tocar la tarjeta.
  - Colores de la barra: el portal usa `success.main` (gozados), `primary.main` (solicitados) y `primary.light` (pendientes). La app usaba warning / info. `primary.light` del portal es `#B0B3E0` en claro y `#9FE6F0` en oscuro (`src/@core/theme/palette/index.ts`); se agregó el token `primaryMid` a `theme/colors.ts` con esos valores.
- **Color por persona del calendario** (`src/domain/licencias/calendario.ts`, commit `8faedbc`). Portal: `calendar/Calendar.tsx`, `colorFromName`: `hash = char + ((hash << 5) - hash)` y `hue = Math.abs(hash) % 360`. La app usaba `(hash * 31 + char) % 360`, que da otro tono (el desplazamiento del portal trabaja en 32 bits con signo). Ahora es la misma cuenta.
- **Nombre de la pestaña de líderes** (`LicenciasScreen.tsx`, commit `8faedbc`): en el portal se llama "Gestión" (`licencias/page.tsx`); la app decía "Equipo". La clave interna sigue siendo `equipo`.

## 2c. Aspecto contra el tema del portal y márgenes (commit `edd1de0`)

Pedido de Daniel (2026-10-27): "más importante que se vea bien a que siga la UI del portal, colores sí debe seguirlos en ambos modos". Se leyó `src/@core/theme/palette` y `src/@core/theme/overrides` (`input`, `card`, `dialog`, `tabs`, `button`, `chip`) y se contrastó con los componentes de la app. **Leído, no ejecutado: no se vio ninguna pantalla.**

- **Bordes** (`src/presentation/theme/colors.ts`). El token `border` mezclaba el borde de los campos con el divisor del portal. Ahora `border` es el divisor (`palette.divider`: `rgba(46,48,146,0.15)` claro, `rgba(255,255,255,0.08)` oscuro) y el nuevo `inputBorder` es el de los campos (`overrides/input.ts`: `rgba(46,48,146,0.25)` claro, `rgba(79,195,215,0.12)` oscuro). Usan `inputBorder`: `AppTextField`, `SelectField` (caja y buscador), `DateField`, `MultiSelectField`, `FormTileSelector` y los chips de `Pestanias`. Tarjetas, diálogos y líneas toman el divisor sin tocar su código.
- **Pestañas** (`components/licencias/Pestanias.tsx`): variante `estilo="subrayado"` (`overrides/tabs.ts`: línea inferior, 2 px primario en la activa, texto primario). Se usa en el nivel de arriba de `InvestigacionScreen` y de `PlanTrabajoDetalleScreen`, que apilaban dos filas de chips iguales. Los chips de abajo no cambian.
- **`Etiqueta`**: el tipo neutro usaba el mismo fondo que la tarjeta y no se veía; ahora `surfaceSecondary`, con radio 6 (`overrides/chip.ts`).
- **`AppModal`**: el diálogo centrado usa radio 16 y todos los paneles llevan borde fino del divisor (`overrides/dialog.ts`).
- **Márgenes**: `NotificacionesScreen`, `PlanTrabajoScreen` y `PlanTrabajoDetalleScreen` repetían `padding: spacing.lg` encima del que ya pone `Screen` (redundante y distinto al resto); ahora solo `gap` y `paddingBottom`. Se leyó `InvestigacionActividad`, `InvestigacionAfiliaciones`, `InvestigacionResultados`, `InvestigacionScreen` y las pantallas de Perfil: solo usan `gap`, sin cambios.
- **Leídos sin cambios necesarios**: `AppButton`, `SeccionCard`, `SeccionRegistros`, `TarjetaSolicitud`, `Screen`, `DocenciaScreen`, `ExtensionScreen`, `FormacionScreen`, `GestionAcademicaScreen`, `MiPerfilScreen`, `TrayectoriaScreen`, `DocumentacionScreen`, `InicioScreen`, `ModuloVacioScreen`, `AjustesScreen`, `LicenciasScreen`, `DatosPersonalesScreen`.
- **Diferencias conscientes de aspecto** (pensadas para celular): área táctil mínima de 48 (Android) / 44 (iOS) px en lugar de los 36 px de los campos del portal; sin el anillo de foco con sombra (el foco se marca con el borde primario); sombra negra en lugar de la azul; sin efectos de hover.

## 2d. Revisión estática, pull-to-refresh, reintentos y Plan de trabajo (commit `efac2e5`)

Pedido de Daniel (2026-10-27): "hace todos esos puntos, debían estar ya". **Leído, no ejecutado.**

- **Colores escritos a mano → tokens.** `legajo/TarjetaDocumento.tsx`: `VERIFICADO` el verde `#4caf50` del check pasó a `success` y el punto de "temporal" a `warning`. `licencias/SelectorArchivos.tsx`: el borde de la zona de carga usa `inputBorder` (es un campo, no un divisor). Resto de lo leído: ya usaba tokens. `SeccionRegistros` conserva el borde punteado del estado vacío en `border` (divisor), a propósito.
- **Pull-to-refresh** (`components/Screen.tsx`, prop `onRefresh`): `RefreshControl` con `tintColor` / `colors` en `accentPrimary` y fondo `card`. Conectado en Inicio, Notificaciones, Documentación, Formación, Trayectoria, Extensión y Plan de trabajo (lista). Propio de la app (el portal es web). Licencias ya lo tenía.
- **Reintentar en errores**: `licencias/ListaPaginada.tsx` (prop `onReintentar`, usada por `MisLicenciasSeccion`, `VacacionesSeccion` y `GestionSeccion`) y `NotificacionesScreen`.
- **Notificaciones**: el spinner solo aparece sin datos cargados, para no desmontar el scroll durante el pull-to-refresh.
- **Plan de trabajo habilitado** (`navigation/modulosMenu.ts`, `enDemo: true`). La lógica ya estaba contrastada con el portal en las decisiones 75 a 87.
- **Leídos sin cambios necesarios**: `components/perfil/*` (`SeccionRegistros`, `SeccionProyectos`, `SeccionProducciones`, `AutoresDeProduccion`, `ParticipantesDelProyecto`, `ResultadosDelProyecto`, `SeccionesFormacion`, `SeccionesTrayectoria`, `CamposComunes`), `legajo/BloqueFamilia`, `legajo/ModalVerAdjuntos`, `navigation/RootNavigator`, `AccionIcono`, `ConfirmDialog`, `InfoAlert` (solo se quitó un import sin usar), `ToastHost`, `LoadingScreen`, `OverlayCerrandoSesion`, `ErrorBoundary`, `AuthLayout`, `AppCheckbox`, `theme/estadoColores.ts` y `components/pta/CajaPta`, `ActividadPta`, `ResumenPta`, `TotalesPta`, `SeccionPta`.
- **`estadoColores.ts`**: la paleta de insignias del portal (`status-badge`) tiene versión clara y oscura; los colores de texto y fondo están definidos en ambos modos.

## 3. Licencias y vacaciones: qué se contrastó y qué no

**Contrastado (portal vs app):**

- `src/stores/useLicenciasStore.ts` vs `licenciasApi.ts` / `licenciasService.ts`: FetchXML de tipos de licencia, de licencias propias y de licencias del equipo; `solicitudlicencia`, `aprobarrechazarlicencia`, `marcaradjuntocargado`, cancelación y carga de adjuntos (multipart `body{i}`).
- `ModalLicencias.tsx` (vista propia) vs `ModalVerLicencia.tsx` + `enviarCertificado`: estados que permiten adjuntar (`1`, `100000006`, `100000007`, `100000008`), límite de 15 000 000 bytes, `marcaradjuntocargado` solo en `100000007`, motivo de rechazo visible solo en `100000001`.
- `ModalLicenciasEquipo.tsx` vs `ModalLicenciaEquipo.tsx`: aprobar / rechazar solo si el usuario es `idAprobador1`, el estado es `1` o `100000007` y, cuando `certificadoobligatorio = 2` y `requierevalidacion != 100000000`, hay adjuntos; motivo de hasta 300 caracteres, obligatorio al rechazar; título "Aprobación".
- `ModalSolicitud.tsx`: esquema de domicilio y mensajes de validación (`validaciones.ts`); el armado del payload se contrastó antes con el store.
- `logConsultaTipoLicencias` **sí está** en la app (`registrarConsultaDeTipos`).
- **Vacaciones, consultas**: `src/stores/useVacacionesStore.ts` vs `vacacionesApi.ts` y `equipoApi.ts`. Coinciden `VacacionesFetch` (períodos abiertos: `new_publicado = 1` y `new_fechaapertura` en o antes de hoy), `fetchVacacionesGestion` (solicitudes propias, segmento `100000004`, join externo a `new_vacaciones`), `vacacionesEquipoFetch`, `VacacionesEquipoPendientes` y `fetchLicenciasEquipoCalendario` (dos consultas unidas sin repetir por `new_licenciaid`).
- **Vacaciones, escrituras**: `useSolicitarVacaciones.ts` (`POST hrfactors/vacaciones`, mensaje "Solicitud cargada con éxito"), `useAprobarVacacion.ts` (`PUT hrfactors/aprobarrechazarvacaciones` con `new_licenciaId`, `new_tipodelicencia`, `new_aprobacionsupervisor`, `new_motivoderechazo`; mensajes "Solicitud aprobada" / "Solicitud rechazada") y `useCancelarVacacion.ts` (`DELETE hrfactors/vacaciones` con `new_licenciaid`; "Solicitud cancelada con éxito") vs `payload.ts`, `endpoints.ts` y `licenciasService.ts`.
- **Vacaciones, pantallas**: `ModalSolicitarVacaciones.tsx` (validaciones, notas, comentarios de hasta 200), `ModalAprobarVacacion.tsx` (campos, título "Aprobación", subtítulo "Revisá y gestioná la vacación del equipo", botones solo si `reportaA` es el usuario, motivo obligatorio al rechazar, máximo 200), `ModalVerVacacion.tsx` ("Vacación solicitada" / "Solo lectura") y `VacacionesPanel.tsx` (ver 2b).
- **Calendario**: `CalendarioWrapper.tsx` (se ocultan "Cancelada" y "No Aprobada"; feriados como eventos de un día) y `Calendar.tsx` (color por persona, ver 2b) vs `domain/licencias/calendario.ts`.
- **Pestañas**: `licencias/page.tsx` (Licencias, Vacaciones, Calendario y Gestión solo para líderes).

**Sin contrastar (queda para revisar):**

- `RespuestaLider` de la app (compartido entre licencias y vacaciones): no se releyó en esta tanda el diálogo de confirmación del portal ("¿Desea aprobar esta licencia?" / "¿Desea rechazar esta licencia?", botones Si / No).
- `ModalCalendario.tsx` (detalle del evento) y `GestionSolicitudes` (grilla de gestión, filtros y el parámetro `?tipo=`), `columnsVacaciones.tsx` (acciones de la grilla, incluida la cancelación) y los hooks `useVacaciones`, `useLicenciasCalendario`, `useEsLiderEquipo`.
- `getSubperiodovacacional` del store del portal (subperíodos por unidad organizativa): la app no lo tiene; no se buscó dónde se usa en el portal.
- Si el portal tiene un flujo de "requiere más información" para licencias (la consulta trae `new_requieremasinformacion`): en los tres modales leídos no aparece; **no se buscó en el store ni en la página** si hay otro punto de entrada. Sin confirmar.

## 4. Diferencias conscientes con el portal (acumuladas)

Las decisiones de diseño de la app que no copian el portal a la letra. Todas están pensadas para celular o para evitar un defecto del portal.

**Aspecto general** (decisiones 97 y 98): área táctil mínima 48 / 44 px en vez de 36; sin anillo de foco con sombra; sombra negra en vez de azul; sin efectos de hover; pestañas de dos niveles con el de arriba subrayado y el de abajo en chips; pull-to-refresh y botón "Reintentar" en errores de lista (propios de la app, el portal es web).

**Licencias y vacaciones**

- Selector de fecha con mes y año, en lugar del campo mes/año del portal.
- Certificado: si la carga del archivo falla, la app no marca el adjunto como cargado (el portal igual llama a `marcaradjuntocargado`).
- Cancelar una vacación también refresca la lista de solicitudes.
- Cancelar una licencia: si la API no devuelve texto, se muestra "No se pudo cancelar la solicitud".
- La lista de adjuntos no trae `documentbody`; el contenido se pide al abrir cada archivo.
- El módulo abre directo en las pestañas; el portal abre antes con tarjetas de inicio y un botón "Volver al inicio".
- Panel de vacaciones: la app agrega un encabezado con el período, el rango para gozar y los días disponibles (en el portal el chip del período está comentado). El desglose y el texto de ayuda se ven en un diálogo al tocar la tarjeta (Popover y Tooltip en el portal). El fondo de cada tarjeta usa los tintes de la app (`accentPrimaryMuted`, `warningLight`, `successLight`); en el portal el de Pendientes es `info.light`, que en oscuro es celeste y en la app queda anaranjado.
- Detalle de una vacación (`ModalVerVacacion`): la app muestra tipo, fechas, días, comentarios y motivo de rechazo; el portal solo muestra los días y el motivo de rechazo.
- Aprobar una vacación: el portal avisa "Límite de 300 caracteres" al pasarse, aunque el tope es 200 (defecto del portal); la app usa 200 con contador.

**Datos personales**

- Aviso antes de salir con cambios sin guardar (`beforeRemove`); una sola columna; sin breadcrumb.
- Fecha vacía: mensaje "obligatoria" (el portal da un `typeError` de yup).

**Documentación**

- El check y la fecha temporales se marcan solo si la subida salió bien (el portal los marca antes y los deja aunque falle). Una respuesta vacía no es error.
- No se copia el `uiname` fijo de la consulta de adjuntos.
- Los adjuntos se piden al abrir "Ver adjuntos".

**Perfil**

- Experiencia: se exige `otroSector` cuando el sector es "Otro".
- Comité: el tope "no futura" se aplica siempre a `fechaFin`.
- Cargos externos: `fechaFin` se limpia al pasar a Vigente.
- FetchXML de encargos y externos: no se copia `uiname`.
- `new_otraunidad` queda vacío al editar.
- Docencia UA: `new_otronivel` se envía siempre. Docencia externa: los `otro*` se vacían si la opción no es "Otro/Otra". Link-entities sin uso y `uiname` no se copian.
- Producción: sin `new_tipodecaso`; `fechainicial` y `fechafinal` también se envían al editar.
- Autores: el texto "otro" / colaborador se limpia según el lugar de trabajo.
- Proyecto: los ids vacíos se omiten; `principalesResultados` se conserva.
- Financiamiento propio (PUT): el portal manda tipo y modalidad en 0; la app manda los elegidos. "Otro financiamiento" y modalidad solo con el tipo que los pide.
- Tesistas: el PUT no envía `new_colaborador`; textos de director / codirector sin uso vacíos; año previsto y fecha de defensa solo con el estado que corresponde; un único campo `tesista`.
- Dirección de becarios: siempre envía el nombre; fin nulo con "En curso".
- Perfiles: el modal del portal está roto en los campos de línea; la app implementa lo que intenta hacer (Sí/No + línea).
- Jurados: `otraActividad` / `otroRol` vacíos salvo "Otro".
- Categorización externa: las columnas que no corresponden a la categoría van en null; con "Otra" el lugar no se manda como lookup; no se manda la unidad certificante; la app lee y escribe el lugar no UA en `insotor` (el portal escribe `new_lugardetrabajouniv`, que no se pudo rastrear en el código); con UA = Sí la categoría no es obligatoria. `new_categoria_investigador_conicet` se manda vacío.
- Prinuar: el modal del portal oculta la UA pero igual la exige (defecto del portal); la app la pide en el formulario.

## 5. Sin verificar / abierto

- La escritura de `new_lugardetrabajouniv` del portal (ver Categorización externa): no se encontró dónde se persiste.
- Íconos de Ionicons que no se confirmaron contra el set instalado: `person-circle-outline`, `alert-circle-outline`, `chevron-forward`, `folder-open-outline` y, del panel de vacaciones, `time-outline`, `hourglass-outline`, `checkmark-circle-outline` e `information-circle-outline` (más los que ya figuran en `PENDIENTES.md`). `AppIconName` es el tipo de nombres de Ionicons: si alguno no existe, el compilador lo marca.
- `FormacionScreen` conserva `any` en el formulario (el valor del selector es una opción de lista).
- **Revisión estática de colores escritos a mano y márgenes: lo que sigue sin leer** (la decisión 98 cerró el resto): los modales de formulario (`Modal*`, `FormInv*`) y los demás componentes de `components/pta/` (`ModalSeccionPta`, `DatosDocenciaPta`, `DatosInvestigacionPta`, `ejecutarPta`), `PlanTrabajoDetalleScreen`, `components/inicio`, `components/notificaciones` y `components/menu` (no se releyeron en esta tanda; las pantallas que los usan sí).
- **Pull-to-refresh sin conectar** en DatosPersonales (formulario: refrescar podría pisar lo que se edita), MiPerfil, GestionAcademica, Docencia, Investigación y Ajustes. Inicio refresca solo las notificaciones. No se verificó si las funciones `cargar*` devuelven una promesa (si no, el indicador se apaga enseguida; no rompe nada).
- El aspecto de los demás overrides del tema del portal (`table`, `menu`, `alert`, `tooltip`, etc.) no se contrastó; la app no tiene equivalentes directos.
- Lo que figura en "Sin contrastar" de la sección 3 (`RespuestaLider`, `ModalCalendario`, gestión, `columnsVacaciones`, hooks de lectura, subperíodos, "requiere más información").

## 6. Cómo leer esto

"Sin divergencias encontradas" quiere decir que, leyendo los archivos citados, la lógica coincide. **No** quiere decir que funcione: nada se ejecutó. Las pruebas las hace Daniel con la PC.
