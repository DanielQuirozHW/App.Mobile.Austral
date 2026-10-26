# CLAUDE.md — App Mobile Austral

App mobile (React Native) para el cliente Austral. Es la versión mobile del Portal Austral (Portal Universidad Austral): se ve como el portal y consume exactamente la misma API. Es un proyecto de prueba/test.

## ALCANCE REAL: MVP DE DEMOSTRACIÓN (leer primero)

**La idea NO es migrar todos los módulos del portal.** La idea es presentar a Austral un **MVP chico y prolijo, con 1 o 2 módulos de prueba**, para que vean la app y decidan si les gusta y si quieren seguir. Lo que tiene que estar muy bien es **lo general**: estructura, configuración, navegación y menús, modo de color (claro / oscuro), notificaciones y aspecto del portal.

- **No se construyen módulos nuevos ni mejoras de módulos** salvo pedido expreso de Daniel en esa conversación.
- **Si Daniel pide un listado para elegir con qué seguir, se le da el listado con una recomendación y se espera su respuesta. No se programa.**
- Lo que ya está escrito queda como está (no se borra, no se amplía). Detalle, reporte de lo terminado y opciones: `docs/ALCANCE-MVP.md`.

Este archivo se escribe con lo verificado en el código de los repos de referencia, no copiado de sus README ni de sus documentos. El detalle verificado está en `docs/contexto/`.

## Cómo retomar el trabajo (leer en este orden)

1. Este archivo.
2. **`docs/ALCANCE-MVP.md` — el alcance real: MVP de demostración, qué está terminado y qué se puede hacer.**
3. **`docs/ESTADO.md` — qué está hecho, qué no, qué hacer al arrancar una sesión nueva y cómo trabaja Daniel.**
4. `docs/DECISIONES.md` (decisiones 1 a 88) y `docs/DECISIONES_89_en_adelante.md` — todo lo que decidió Daniel.
5. `docs/STACK.md` — librerías y versiones aprobadas.
6. `docs/ERRORES.md` — errores ya cometidos y las reglas que salen de ellos.
7. `docs/PENDIENTES.md` — lo que falta, lo que hace Daniel y lo que hay que verificar.
8. `docs/SETUP-NATIVO.md` — checklist de lo que hace Daniel con la PC (proyecto nativo, Firebase, fuentes, logos, pruebas).
9. `docs/contexto/` — lo entendido del código del portal, la API y el prototipo.

Todo lo decidido vive en el repo, no en ningún chat.

**Estado resumido:** está escrito el login, el Tablero de Inicio, Notificaciones, Datos personales, Documentación, Licencias y vacaciones, el Perfil completo y el Plan de Trabajo (todo sin probar). **No se siguen sumando módulos ni mejoras: el objetivo es un MVP de demostración** (`docs/ALCANCE-MVP.md`). Lo que queda por pulir es lo general (menú de navegación, selector de modo de color, ajustes, aspecto contra el tema del portal), a elección de Daniel.

---

## REGLA FUNDAMENTAL: construir sin probar y sin credenciales

Esta regla está por encima de cualquier otra y no tiene excepciones.

- Este proyecto es SOLO construcción. No se prueba absolutamente nada: no se ejecuta la app, no se llama a la API, no se hace login, no se instalan dependencias, no se corren build, lint ni tests. Las pruebas las hace Daniel, cuando el proyecto esté avanzado.
- No se usa ninguna credencial, nunca. Ni para probar, ni "solo una vez", ni aunque aparezca en algún repo.
- Donde el código necesite una credencial, clave, URL privada o secreto, se deja el lugar VACÍO: variable de entorno sin valor en `.env.template`, o campo en blanco con un comentario que diga qué va ahí.
- Si algo parece requerir una prueba o una credencial para avanzar, se frena y se avisa. No se improvisa.
- "No se puede probar" nunca es la razón principal de una recomendación técnica. Las pruebas las hace Daniel.

---

## Lo que NO se debe hacer

1. No ejecutar ni probar nada (ver regla fundamental).
2. No usar ni escribir credenciales, claves, tokens, URLs privadas ni secretos, en ningún archivo.
3. No modificar nunca los 3 repos de solo lectura: ni commits, ni ramas, ni PRs, ni issues, ni comentarios, ni forks, ni archivos.
4. No clonar ni descargar los repos de referencia. No agregarlos a la sesión con `add_repo`. No usar `git` sobre ellos. Se leen solo por el conector MCP de GitHub, con herramientas de lectura.
5. No escribir en ningún repo que no sea `DanielQuirozHW/App.Mobile.Austral`. Antes de cada escritura se verifica owner/repo. Ante la duda, no se escribe y se pregunta.
6. No modificar la API ni proponer modificarla. Si algo parece requerir un cambio en la API, se avisa y se busca cómo resolverlo del lado de la app.
7. No elegir por criterio propio "la API v1" o "la legacy". Se hace lo que hace el portal.
8. No tomar como fuente la documentación de los otros repos (README, ARCHITECTURE, CLAUDE.md, etc.): puede estar desactualizada o mal. Vale el código. Si no coinciden, se avisa la discrepancia.
9. No clonar, hacer fork ni copiar contenido o historial del prototipo. Del prototipo se toma estructura y forma de programar, no contenido, lógica ni aspecto.
10. No arrastrar errores heredados del prototipo (por ejemplo el typo "Protoype" o su README genérico de React Native).
11. **No construir módulos ni mejoras que Daniel no haya pedido de forma expresa, y no migrar "todo": es un MVP de demostración con 1 o 2 módulos.** Registro y recuperar contraseña **no** se construyen (decisión 36).
12. No inventar endpoints, payloads ni reglas de negocio: si no están en el código, se pregunta.
13. No presentar como verificado algo que se supuso.
14. No preguntar por la publicación de las apps ni por el registro en Firebase: se deja todo preparado y Daniel lo hace cuando decida.
15. No plantear el tema de seguridad de las credenciales del usuario de servicio: es del portal.
16. No agregar ni cambiar una dependencia sin verificar su versión en la web (registro de npm o sitio oficial) y registrarla en `docs/STACK.md`. Las versiones no se miran en los repos de referencia.
17. No usar Expo, UI Kitten, React Native Paper, moment, dayjs ni el SDK web de Firebase (ver `docs/STACK.md`).
18. No elegir una librería "porque la usa el portal" o "porque la usa el prototipo". Se elige por mérito técnico, con fuente.
19. No dejar de implementar la confirmación al salir con cambios sin guardar en los formularios (el portal la tiene).
20. Responder solo lo que Daniel preguntó, sin repetir tablas ni recapitular. Ver `docs/ERRORES.md`.
21. **La app es del portal de Austral, no de Humanware.** Colores, tipografía (Montserrat), radios, botones, campos, textos y logos salen del portal (`src/@core/theme`, páginas de `src/app`), nunca del prototipo. Ver decisión 26 y `docs/ERRORES.md` #11.
22. No copiar datos de ejemplo ni de personas que aparezcan en el código del portal (por ejemplo los `uiname` fijos de sus consultas FetchXML). Ver decisión 67.
23. No copiar pasajes de libros ni de otros textos con derechos (los 18 mensajes del mes del Tablero de Inicio quedan vacíos y los pega Daniel). Ver decisión 89.
24. **No programar cuando Daniel pidió un listado o una opinión para elegir.** Se responde con el listado y una recomendación, y se espera.

---

## Repositorios y permisos

| Repo | Rol | Permiso |
|---|---|---|
| HW-Austral/Portal-Austral-Dev | Fuente de verdad de la lógica y del aspecto (Next.js) | SOLO LECTURA |
| HW-Austral/API.Web.Austral | API que se consume (.NET) | SOLO LECTURA |
| gmhwapp/Protoype-RN | Referencia de estructura y forma de programar | SOLO LECTURA |
| DanielQuirozHW/App.Mobile.Austral | Este repo | LECTURA Y ESCRITURA |

Todo se accede por el conector MCP de GitHub. La escritura va solo en este repo.

## Jerarquía de fuentes de verdad

1. Código del portal: manda en lógica, flujos, autenticación, multi-tenant, endpoints, payloads, validaciones, reglas de negocio y aspecto visual.
2. Código de la API: confirma contratos (rutas, parámetros, respuestas) cuando el portal no alcanza.
3. Código del prototipo: solo para estructura de carpetas, convenciones, navegación y forma de programar una app RN. Donde el prototipo no tiene patrón, se usa uno propio y se documenta.
4. README, ARCHITECTURE, CLAUDE.md y demás documentación de los repos: pistas, nunca fuente.

## Stack (resumen; el detalle y las versiones están en `docs/STACK.md`)

React Native 0.88 (última estable), proyecto nativo sin Expo, TypeScript. react-navigation (native-stack), zustand, TanStack Query, react-hook-form + yup, axios, date-fns, StyleSheet con componentes propios y el aspecto del portal, Reanimated, React Native Firebase (login con Microsoft, Firestore, Storage), Keychain, AsyncStorage, image-picker, documents picker/viewer, blob-util, datetimepicker, react-native-dotenv.

## Cómo se construye

- Todo desde cero, archivo por archivo, por el conector MCP.
- Credenciales y secretos: nunca se commitean. Se usa `.env.template` con nombres de variables sin valores, y `.env` queda en `.gitignore`. No hay valores reales en ningún archivo.
- Los README, este archivo y las skills se escriben con lo verificado en el código.
- Las carpetas `android/` e `ios/` no existen en este repo: las genera Daniel con el comando oficial cuando tenga la PC (ver `docs/SETUP-NATIVO.md`).
- `push_files` reemplaza el archivo completo: para cambiar un archivo se reenvía entero.
- Cada commit termina con las líneas de atribución que indique la sesión.
- Al terminar un trabajo se actualizan `docs/ESTADO.md`, las decisiones (`docs/DECISIONES_89_en_adelante.md` desde la 89), `docs/PENDIENTES.md`, este archivo y el contexto en `docs/contexto/`.

## Orden de trabajo (lo que se hizo)

1. Base del proyecto (hecha): configuración, entorno, tema del portal, responsive, componentes base, providers.
2. Cliente HTTP, token y endpoints; adaptadores de almacenamiento.
3. Autenticación (Microsoft, email/contraseña, validación del empleado, `usuarios` en Firestore, cierre de sesión). Sin registro ni recuperación.
4. Navegación, selección de puesto y guardas por rol.
5. Foto de perfil, foto de portada y cabecera del legajo (decisiones 45, 47 y 88).
6. Datos personales completo, con confirmación al salir con cambios sin guardar.
7. Funciones de Nombramientos y Promoción (**no se hace**, salvo pedido expreso).
8. Licencias y vacaciones (licencias propias, vacaciones, calendario y gestión del equipo).
9. Perfil: Formación y Trayectoria profesional (decisiones 57 a 63).
10. Perfil: Extensión y Gestión académica (decisión 64).
11. Perfil: Docencia (decisiones 64 y 66).
12. Perfil: Investigación, con Afiliaciones, Actividad I+D y Resultados / Impacto I+D (decisiones 65 a 74).
13. Plan de Trabajo, solo docente (decisiones 75 a 86): hecho.
14. Tablero de Inicio real (decisión 89): hecho.
15. Notificaciones (decisión 90): hecho.
16. Documentación (decisión 91): hecho.
17. **Cancelado:** mejoras de Plan de Trabajo, Licencias y Vacaciones. El objetivo es un MVP de demostración (`docs/ALCANCE-MVP.md`).

Cada trabajo se contrasta contra el código del portal, leyendo; no se verifica ejecutando. Daniel autorizó avanzar sin pedir aprobación **dentro de lo que pide**; se frena ante una decisión que no se pueda deshacer o una duda real.

## Alcance

**MVP de demostración: 1 o 2 módulos de prueba + lo general muy bien (ver arriba y `docs/ALCANCE-MVP.md`). No se migran todos los módulos.** Lo ya escrito:

- Autenticación: se migra lo que hace el portal, **salvo registro y recuperar contraseña** (decisión 36: las cuentas con usuario y contraseña las crea Austral en Firebase). El login principal es con cuenta Microsoft @austral, por el proveedor Microsoft de Firebase (decisión 18); email y contraseña quedan para algunos usuarios. Se mantiene la selección de puesto. Sin probar y con credenciales vacías.
- Foto de perfil y foto de portada: migradas (la portada la pidió Daniel aunque el portal no la muestra; decisión 88).
- Funciones de Nombramientos y Promoción: se migra su resolución en la sesión, igual que el portal. Su uso en navegación y guardas (etapa 7) **no se hace**.
- Datos personales, migrado completo (Identidad, Contacto, Domicilio real, Familia con cónyuge, hijos/as y su documentación, y Contacto de emergencia). Candidato 1 para la demo.
- Licencias y vacaciones, migrado completo (licencias propias con certificado y domicilio por mudanza, vacaciones con progreso por período, calendario y gestión del equipo para líderes). Ver decisiones 48 a 55. Candidato 2 para la demo.
- Perfil, ya escrito: Formación, Trayectoria profesional, Extensión, Gestión académica, Docencia e Investigación (salvo Promoción > Postulación). Ver `docs/contexto/perfil.md`. Extra.
- Plan de Trabajo (`/planes-de-trabajo`), solo docente, ya escrito. Ver decisiones 75 a 86 y `docs/contexto/plan-de-trabajo.md`. Extra.
- Tablero de Inicio: bienvenida, mensaje del mes (textos por cargar), cumpleaños del día y próximos feriados. Ver decisión 89 y `docs/contexto/inicio.md`.
- Notificaciones: pendientes / completadas / todas, filtros por módulo y fecha, "Ir", marcar como leída y marcar todas. Sin SignalR (recarga cada 5 minutos). Ver decisión 90 y `docs/contexto/notificaciones.md`.
- Documentación (Legajo > Documentación): lista de documentos requeridos del empleado con "Ver adjuntos" y "Cargar archivo". Ver decisión 91 y `docs/contexto/documentacion.md`. Extra.
- **No se hacen:** mejoras de Plan de Trabajo, Licencias y Vacaciones; Nombramientos y Promoción; GDD, Indicadores, Funciones SA / VRAA, Referente MATHU y Promoción > Postulación.

## Cómo comunicar

- Español rioplatense, directo y breve.
- Todo lo que se entrega se entrega COMPLETO, nunca fragmentos.
- Separar siempre lo verificado en el código de lo supuesto o inferido.
- Citar el archivo del repo de donde sale cada dato importante (repo + ruta).
- Si algo no se puede resolver con el código (por ejemplo, configuración externa como registrar las apps iOS/Android en Firebase), decirlo explícitamente en vez de improvisar.
- Ante ambigüedad real, preguntar. Ante algo de bajo riesgo, decidir y avisar.

## Mapa de este repo

| Ruta | Qué hay |
|---|---|
| `docs/ALCANCE-MVP.md` | Alcance real (MVP de demostración), reporte de lo terminado y opciones para seguir |
| `docs/ESTADO.md` | Estado actual, qué falta y qué hacer al retomar en una sesión nueva |
| `docs/DECISIONES.md` | Decisiones tomadas (1 a 88) |
| `docs/DECISIONES_89_en_adelante.md` | Decisiones desde la 89 (Tablero de Inicio, Notificaciones, Documentación y lo que siga) |
| `docs/STACK.md` | Stack definitivo con versiones verificadas |
| `docs/ERRORES.md` | Errores cometidos y reglas para no repetirlos |
| `docs/PENDIENTES.md` | Pendientes, tareas externas y lo que falta verificar |
| `docs/SETUP-NATIVO.md` | Lo que hace Daniel con la PC: proyecto nativo, configuración y checklist en orden |
| `docs/contexto/portal-auth-y-tenant.md` | Cómo autentica el portal y cómo se resuelve el tenant (verificado) |
| `docs/contexto/roles-puesto-y-fotos.md` | Puesto, selección de rol, funciones de Nombramientos/Promoción y fotos (verificado) |
| `docs/contexto/cliente-http-y-endpoints.md` | Cliente HTTP con reintentos y endpoints que usa el portal (verificado) |
| `docs/contexto/datos-personales.md` | Contrato y reglas del módulo Datos personales, incluida Familia (verificado) |
| `docs/contexto/licencias-y-vacaciones.md` | Contrato y reglas del módulo Licencias y vacaciones (verificado; lo inferido está marcado) |
| `docs/contexto/perfil.md` | Contrato y reglas de Perfil: Formación, Trayectoria, Extensión, Gestión académica, Docencia e Investigación (verificado; diferencias e inferidos separados) |
| `docs/contexto/plan-de-trabajo.md` | Contrato y reglas del Plan de Trabajo Anual (verificado; lo inferido está marcado) |
| `docs/contexto/inicio.md` | Contrato y reglas del Tablero de Inicio (verificado; diferencias e inferidos separados) |
| `docs/contexto/notificaciones.md` | Contrato y reglas de Notificaciones: lectura, marcar como leída, ruteo por módulo (verificado; diferencias e inferidos separados) |
| `docs/contexto/documentacion.md` | Contrato y reglas de Documentación del legajo: lista, filtros, ver adjuntos y carga (verificado; diferencias e inferidos separados) |
| `docs/contexto/prototipo-estructura.md` | Estructura y convenciones del prototipo RN (verificado; el aspecto NO se toma de ahí) |
| `.claude/skills/` | Skills de trabajo para este repo (`auth-portal`, `cliente-http-api`, `convenciones-rn-prototipo`, `modulo-datos-personales`, `regla-fundamental`, `repos-solo-lectura`, `stack-y-librerias`, `ui-componentes-propios`) |
| `App.tsx` | Providers + `AppNavigation` |
| `src/config/env.ts` | Variables de entorno (sin valores): API, usuario de servicio, tenant de Microsoft y `PORTAL_CAE_URL` (opcional) |
| `src/config/api/` | `apiClient.ts` (axios con reintentos, port del portal), `tokenStore.ts` (token del usuario de servicio), `endpoints.ts`, `endpointsNotificaciones.ts` y `endpointsDocumentacion.ts` (rutas), `fetchXml.ts` (consultas FetchXML), `apiError.ts`, `queryClient.ts` |
| `src/domain/roles/` | Roles y funciones de Nombramientos/Promoción (port de las reglas del portal) |
| `src/domain/auth/` | Tipos de sesión y textos de error (`authError.ts`) |
| `src/domain/inicio/` | Tablero de Inicio sin UI: `tablero` (feriados, cumpleaños, fecha en Argentina, frase del mes, saludo) y `frasesMensuales` (18 entradas, textos por cargar) |
| `src/domain/notificaciones/` | Notificaciones sin UI: mapeo de la tarea del CRM, pendientes / leídas, texto de la descripción, ruta destino y módulo (`rutaNotificacion`, `moduloNotificacion`), destino dentro de la app (`resolverDestino`) y filtros |
| `src/domain/documentacion/documentos.ts` | Documentación del legajo sin UI: mapeo de la fila, filtros del portal (psicotécnico / examen preocupacional / CUD), fecha de última carga y adjuntos |
| `src/domain/legajo/` | Datos personales sin UI: tipos, opciones fijas, mapeo del CRM, validación (yup), formulario, payloads, teléfono, fechas, archivos, tipo de contratación |
| `src/domain/licencias/` | Licencias y vacaciones sin UI: estados, tipos, mapeo del CRM, tipos de licencia y límites, validaciones, payloads, vacaciones, calendario, fechas del CRM |
| `src/domain/perfil/` | Perfil sin UI: `comun` (fechas del CRM, años, Sí / No, helpers yup); `formacion*` y `trayectoria*` (opciones, tipos, mapeo, payloads, validación); `extension`, `gestionAcademica`, `docencia`; `afiliaciones`; `proyectos`, `resultadosProyecto`, `financiamientos`, `formacionRrhh`; `resultados` (estancias y jornadas) y `produccionCientifica` (13 tipos de material y autores) |
| `src/domain/pta/` | Plan de Trabajo sin UI: `constantes` (estados, textos), `tipos`, `mapeo` (plan, indicadores, adjuntos), `opciones`, `fechas`, `formulario`, `resumen`, `mapeoSecciones` y `lecturas` (lectura de cada sección), `secciones` (las 18 `DefinicionSeccion` con campos, validación y mensajes), `payloads`, `catalogos` |
| `src/infrastructure/auth/` | Consultas de empleado al BO (`empleadoApi.ts`), colección `usuarios` de Firestore (`usuariosFirestore.ts`) y fotos de perfil y de portada en Storage (`fotosStorage.ts`) |
| `src/infrastructure/inicio/tableroApi.ts` | Lecturas del Tablero: feriados y empleados para cumpleaños (caché por día) |
| `src/infrastructure/notificaciones/notificacionesApi.ts` | Lectura de las tareas del CRM del empleado (FetchXML con `link-entity`) y `inactivarTarea` (PUT) |
| `src/infrastructure/documentacion/documentacionApi.ts` | Lectura de los documentos requeridos del empleado y de sus adjuntos (FetchXML) y subida multipart |
| `src/infrastructure/legajo/` | Llamadas a la API de Datos personales: legajo, familiares y adjuntos, catálogos, credencial de servicio |
| `src/infrastructure/licencias/` | Llamadas a la API de Licencias y vacaciones: `licenciasApi`, `vacacionesApi`, `equipoApi` |
| `src/infrastructure/perfil/` | Llamadas a la API de Perfil: `perfilApi` (lectura por empleado, escritura, subida), `formacionApi`, `trayectoriaApi`, `extensionApi`, `gestionAcademicaApi`, `docenciaApi`, `afiliacionesApi`, `actividadApi`, `proyectosApi`, `resultadosApi` |
| `src/infrastructure/pta/ptaApi.ts` | Llamadas a la API del Plan de Trabajo: lectura de planes, secciones, indicadores y adjuntos; escritura de plan y registros; cambio de estado; subida y baja de adjuntos; catálogos |
| `src/infrastructure/archivos/` | Selección de archivos (documentos, galería, cámara), selección de la foto de perfil y visor de adjuntos |
| `src/infrastructure/storage/almacenamiento.ts` | AsyncStorage (rol elegido) |
| `src/application/auth/authService.ts` | Login Microsoft y email, logout (vacía también los stores de Perfil y del Plan de Trabajo), escucha de sesión y revalidación |
| `src/application/auth/fotoPerfilService.ts` | Cambio de foto de perfil y de portada (Storage + `usuarios`) |
| `src/application/notificaciones/notificacionesService.ts` | Marcar como leída y marcar todas (tandas de 5), con los avisos del portal |
| `src/application/documentacion/documentacionService.ts` | Cargar la lista, leer adjuntos de un documento y subir archivos (marca el check temporal solo tras subir bien) |
| `src/application/legajo/legajoService.ts` | Flujos de Datos personales (guardar legajo, cónyuge, hijos/as, bajas, adjuntos) |
| `src/application/licencias/` | `licenciasService.ts` (solicitar, cancelar, certificado, aprobar / rechazar, carga de datos) y `adjuntosService.ts` |
| `src/application/perfil/` | Un servicio por página de Perfil: `formacionService`, `trayectoriaService`, `extensionService`, `gestionAcademicaService`, `docenciaService`, `afiliacionesService`, `actividadService`, `proyectosService` (con `cargarMasInfo` de los siete tipos de resultado) y `resultadosService` |
| `src/application/pta/ptaService.ts` | Flujos del Plan de Trabajo: abrir el detalle, guardar registros y bajas, plan y observaciones, total de investigación, lectura de observaciones, adjuntos y envío |
| `src/presentation/stores/` | `authStore`, `rolStore`, `legajoStore`, `familiaStore`, `catalogosStore`, `licenciasStore`, `equipoStore`, `toastStore`, de Perfil: `formacionStore`, `trayectoriaStore`, `extensionStore`, `gestionAcademicaStore`, `docenciaStore`, `afiliacionesStore`, `actividadStore`, `proyectosStore`, `resultadosStore`, y `ptaStore` (Plan de Trabajo) |
| `src/presentation/hooks/` | `useTablero` (feriados y cumpleaños, TanStack Query) y `useNotificaciones` (lista, pendientes / completadas, acciones; recarga cada 5 minutos) |
| `src/presentation/navigation/` | `RootNavigator.tsx` (pantallas según el estado de sesión y puesto; `PlanesDeTrabajo` y `PlanTrabajoDetalle` solo para docente), `AppNavigation.tsx` (contenedor, tema, avisos y overlay), `navigationTheme.ts`, `tipos.ts` (rutas) |
| `src/presentation/screens/auth/` | `LoginScreen`, `SeleccionarPuestoScreen` |
| `src/presentation/screens/InicioScreen.tsx` | Tablero de Inicio (bienvenida, mensaje del mes, cumpleaños, feriados) con los accesos a los módulos y el cierre de sesión |
| `src/presentation/screens/notificaciones/NotificacionesScreen.tsx` | Pantalla de Notificaciones (pestañas con cantidad, filtros, tarjetas, confirmación de "Marcar todas") |
| `src/presentation/screens/legajo/DatosPersonalesScreen.tsx` | Pantalla de Datos personales |
| `src/presentation/screens/legajo/DocumentacionScreen.tsx` | Pantalla de Documentación (cabecera compacta, aviso, tarjetas, modales de ver y cargar) |
| `src/presentation/stores/documentacionStore.ts` | Lista de documentos del empleado y marcas temporales de carga (solo en memoria) |
| `src/presentation/screens/licencias/LicenciasScreen.tsx` | Pantalla de Licencias y vacaciones (pestañas: Licencias, Vacaciones, Calendario, Equipo) |
| `src/presentation/screens/perfil/` | `FormacionScreen`, `TrayectoriaScreen`, `ExtensionScreen`, `GestionAcademicaScreen`, `DocenciaScreen` e `InvestigacionScreen` (con `InvestigacionAfiliaciones`, `InvestigacionActividad` e `InvestigacionResultados`) |
| `src/presentation/screens/pta/` | `PlanTrabajoScreen` (lista por pestañas) y `PlanTrabajoDetalleScreen` (Datos personales, Observaciones del Sec. Académico y Actividad académica con nueve subpestañas) |
| `src/presentation/theme` | Colores, tipografía y proveedor de tema (valores del portal; `modo` permite forzar claro) |
| `src/presentation/utils/` | `responsive.ts` (escala, espacios, radios) y `toast.ts` (avisos) |
| `src/presentation/components` | Base: `AppText`, `AppButton`, `AppTextField`, `AppCheckbox`, `AppIcon`, `Screen`, `AuthLayout`, `LogoAustral`, `LoadingScreen`, `OverlayCerrandoSesion`. Datos personales: `AppModal`, `ConfirmDialog`, `ToastHost`, `SeccionCard`, `InfoAlert`, `Etiqueta`, `AccionIcono` |
| `src/presentation/components/inicio/` | Tablero: `TarjetaTablero` (marco), `SaludoInicio`, `FraseDelMes`, `CumpleaniosCard`, `ProximosFeriadosCard` |
| `src/presentation/components/notificaciones/TarjetaNotificacion.tsx` | Fila de la grilla de notificaciones como tarjeta, con "Ir" y "Marcar como leída" |
| `src/presentation/components/form/` | Campos de formulario: `SelectField`, `DateField`, `FormTextField`, `FormSelectField`, `FormDateField`, `FormTileSelector`, `ScrollFormulario` |
| `src/presentation/components/legajo/` | `BloqueFamilia`, `ModalConyuge`, `ModalHijo`, `ModalCargarDocumento`, `ModalVerAdjuntos` (los dos sirven a familiares y a Documentación con sus props `subir` / `obtener`), `TarjetaDocumento`, `PerfilLegajoBanner` (cabecera con foto de perfil y de portada; variante `compacto` sin portada), `FilaDato` |
| `src/presentation/components/licencias/` | Secciones (`MisLicenciasSeccion`, `VacacionesSeccion`, `CalendarioSeccion`, `GestionSeccion`), modales de solicitud, detalle, aprobación y calendario, y piezas comunes (`EstadoChip`, `Pestanias`, `ListaPaginada`, `TarjetaSolicitud`, `SelectorArchivos`, `RespuestaLider`, `VacacionesPanel`, `FormularioDomicilio`, `DomicilioDeclarado`) |
| `src/presentation/components/perfil/` | Piezas comunes: `SeccionRegistros` (sección genérica con Ver / Editar / Eliminar), `ModalPerfil` (marco de los modales), `CamposComunes`, `ModalLectura`. Un modal por sección de Formación, Trayectoria, Extensión, Gestión académica, Docencia, Afiliaciones y Actividad I+D. Proyectos: `SeccionProyectos`, `ModalProyecto`, `ParticipantesDelProyecto`, `ModalParticipante`, `ResultadosDelProyecto`, `ModalVincularResultado`, `ModalMasInfoResultado`. Resultados / Impacto I+D: `SeccionProducciones`, `ModalProduccion`, `AutoresDeProduccion`, `ModalAutor`, `ModalJornada`, `ModalEstancia` |
| `src/presentation/components/pta/` | Plan de Trabajo: `SeccionPta` (sección genérica con Ver / Editar / Eliminar) y `ModalSeccionPta` (modal genérico por `DefinicionSeccion`), `CajaPta`, `TotalesPta`, `ActividadPta` (contenido de cada subpestaña), `DatosDocenciaPta`, `DatosInvestigacionPta`, `ResumenPta` (indicadores, observaciones, adjuntos y envío) y `ejecutarPta` (avisos de proceso) |
| `src/assets/images/logos.ts` | Logos (hoy `null` hasta copiar las imágenes; ver `docs/SETUP-NATIVO.md`) |
| `src/presentation/providers/AppProviders.tsx` | Providers de la app |
| `.env.template` | Nombres de variables de entorno, sin valores |

## Estado actual

**Alcance: MVP de demostración (`docs/ALCANCE-MVP.md`); no se siguen sumando módulos.** Etapa 1 (base) escrita. Etapa 2: cliente HTTP, token y endpoints escritos; falta la lectura de `UnidadDeNegocio`. Etapas 3 y 4 escritas: autenticación (servicio, roles, errores, stores), pantallas de ingreso y selección de puesto y navegación raíz. Etapa 5 escrita: foto de perfil, foto de portada y cabecera del legajo. Etapa 6 escrita: Datos personales completo con aviso de cambios sin guardar. Etapa 8 escrita: Licencias y vacaciones completo (licencias propias, vacaciones, calendario y gestión del equipo). Etapas 9 a 12 escritas: Perfil completo, salvo Promoción > Postulación. Etapa 13 escrita: Plan de Trabajo (solo docente). Etapa 14 escrita: Tablero de Inicio (faltan los textos del mensaje del mes, que pega Daniel). Etapa 15 escrita: Notificaciones. Etapa 16 escrita: Documentación del legajo. Lo general que falta (a elección de Daniel): menú de navegación, selector de modo de color, pantalla de ajustes, ajuste del aspecto contra el tema del portal y revisión estática de `src/`. Todo sin probar. No hay carpetas nativas todavía: las genera Daniel (ver `docs/SETUP-NATIVO.md`). Detalle y próximos pasos en `docs/ESTADO.md`.
