# Pendientes

Se actualiza. Tres tipos: decisiones de Daniel, tareas externas al código y cosas que faltan leer o verificar.

## Decisiones de Daniel

- **Orden de trabajo acordado (2026-10-26)**: primero configuración y estructura (revisada, ver [`VERIFICACIONES.md`](VERIFICACIONES.md)); después cerrar los puntos inferidos leyendo el portal; después UI (ajustar contra el tema del portal, iniciales del avatar y cabecera, foto de portada); después los módulos nuevos: Tablero de Inicio real (**hecho**), notificaciones (**hecho**) y Documentación (**sigue**), junto con mejoras de lo ya hecho (Plan de Trabajo, Licencias, Vacaciones). **Nombramientos y Promoción va al final.**
- Módulos que quedan pendientes sin pedido: GDD, Indicadores, funciones SA / VRAA, Referente MATHU y Promoción > Postulación.
- Si revierte alguno de los reemplazos de la decisión 20 (fs, file-viewer, íconos, native-stack, teclado).
- Nombre visible de la app (`displayName` en `app.json` está como "Austral", provisorio; el portal se llama "Portal Universidad Austral" en `themeConfig.ts`) y nombre del proyecto nativo (`AustralMobile`).
- Modo claro/oscuro: la app sigue el sistema; el portal arranca en claro y tiene un selector (su `settingsContext` no se leyó). Ver decisión 27.
- Foto de portada: **construida el 2026-10-26** a pedido de Daniel (decisión 88, reemplaza la 46). El portal hoy no la muestra (`PerfilHeader` no usa `actualizarFotoPortada`); si el equipo prefiere que la app sea idéntica al portal, se saca la franja de `PerfilLegajoBanner.tsx`.
- **Notificaciones en tiempo real** (decisión 90): hoy la app recarga cada 5 minutos. Para igualar al portal habría que sumar `@microsoft/signalr` (dependencia nueva) y escuchar `NuevaNotificacion`. Lo decide Daniel con el equipo.

## Tareas externas al código (las hace Daniel, más adelante)

La lista completa y ordenada, con checklist, está en [`SETUP-NATIVO.md`](SETUP-NATIVO.md). Resumen:

- Generar `android/` e `ios/` con el comando oficial y combinar con este repo.
- Registrar las apps iOS/Android en Firebase; habilitar el proveedor Microsoft; registro de la app en Microsoft Entra.
- Cargar los valores reales en un `.env` local (nombres en `.env.template`). Nunca se commitean. `PORTAL_CAE_URL` es opcional.
- **Fuentes Montserrat** (400, 500, 600, 700; en el portal vienen de Google Fonts vía `next/font`; el repo del portal solo trae los .ttf 300, 700 y Regular), permisos (cámara, galería), bloqueo de orientación vertical y plugin de Babel de Reanimated.
- **Imágenes y logos**: los archivos binarios no se pueden subir por el conector. Copiar los logos a `src/assets/images` y completar `src/assets/images/logos.ts` (hoy devuelve `null` y la app muestra "Universidad Austral" en texto). Ver `SETUP-NATIVO.md`.
- **Mensaje del mes**: pegar los 18 textos de `src/@core/data/frases-mensuales.ts` del portal en `src/domain/inicio/frasesMensuales.ts`, en el mismo orden (el campo `texto` de cada entrada está vacío a propósito; decisión 89).
- Comprobar si el `uid` del login con Microsoft coincide con el del login SAML (los documentos de `usuarios` y las fotos se identifican por `uid`).
- Crear en Firebase las cuentas de usuario y contraseña que hagan falta, **con su documento en la colección `usuarios`** (decisión 36).
- Todas las pruebas.

## Falta verificar (escrito de memoria o con documentación incompleta)

Estos puntos están ya en el código y no se pudieron confirmar con una fuente. Los que ya se contrastaron con documentación oficial están en [`VERIFICACIONES.md`](VERIFICACIONES.md) y se sacaron de esta tabla.

| Qué | Dónde está en el código | Por qué quedó sin verificar |
|---|---|---|
| `KeyboardProvider` exportado por `react-native-keyboard-controller` 1.22.6, y que `KeyboardAwareScrollView` reenvíe el `ref` con `scrollTo` | `AppProviders.tsx`, `Screen.tsx`, `ScrollFormulario.tsx` | La documentación leída no lo cubre (ver `VERIFICACIONES.md`) |
| Uso de `focusManager.setFocused` con `AppState` en React Native | `src/config/api/queryClient.ts` | La página de TanStack Query pidió un permiso que no se respondió a tiempo |
| Importación `{ Ionicons } from '@react-native-vector-icons/ionicons'` en React Native sin Expo | `AppIcon.tsx` | La página leída no cubre Android/iOS |
| Que existan en Ionicons los nombres usados: `lock-closed-outline`, `shield-checkmark-outline`, `open-outline`, `swap-horizontal-outline`, `briefcase-outline`, `school-outline`, `id-card-outline`, `checkbox`, `square-outline`, `cloud-upload-outline`, `cloud-offline-outline`, `folder-open-outline`, `images-outline`, `camera-outline`, `document-text-outline`, `eye-outline`, `create-outline`, `trash-outline`, `information-circle`, `information-circle-outline`, `person-outline`, `search-outline`, `calendar-outline`, `close-circle`, `chevron-down`, `location-outline`, y en Licencias y vacaciones `add-circle-outline`, `checkmark-circle-outline`, `close-circle-outline`, `chevron-back`, `chevron-forward`, `home-outline`, `close`, en Inicio `clipboard-outline`, `gift-outline` y `sparkles-outline`, y en Notificaciones `notifications-outline`, `arrow-forward-outline`, `checkmark-outline`, `checkmark-done-outline` y `refresh-outline` | Pantallas de ingreso, `AppCheckbox`, Datos personales, cabecera, Licencias y vacaciones, Inicio y Notificaciones | Escritos de memoria; el tipo `AppIconName` (todos los nombres de Ionicons) los valida al compilar |
| `types.images`, `types.doc` y `types.docx` de `@react-native-documents/picker` 12.0.2 | `seleccionArchivos.ts` | La documentación leída solo muestra `types.pdf` |
| `viewDocument({ uri, mimeType, grantPermissions })`: nombres de `mimeType` y `grantPermissions` | `visorArchivos.ts` | Falta el README del paquete del visor |
| API de `react-native-blob-util` 0.25.1: `fs.dirs.CacheDir` y `fs.writeFile(ruta, base64, 'base64')` | `visorArchivos.ts` | La documentación leída no las cubre |
| Que `FormData.append('file', { uri, name, type })` suba bien archivos `content://` de Android | `familiaresApi.ts`, `licenciasApi.ts`, `perfilApi.ts` (`subirArchivos`), `ptaApi.ts` | Es el patrón habitual de React Native; sin confirmar con la versión |
| Exportaciones modulares de `@react-native-firebase/storage` 26.4.0: `getStorage`, `ref`, `putFile`, `getDownloadURL` (las usan la foto de perfil y la de portada) | `infrastructure/auth/fotosStorage.ts` | Escrito de memoria |
| Que `putFile` acepte la ruta `file://` que devuelve `react-native-image-picker` y deduzca el tipo de contenido | `fotosStorage.ts`, `seleccionFoto.ts` | Escrito de memoria |
| API de `@react-native-async-storage/async-storage` 3.1.1: se usa `import AsyncStorage` con `getItem/setItem/removeItem` | `infrastructure/storage/almacenamiento.ts` | La documentación leída muestra ese uso pero no dice si es de v2 o v3 |
| API de `react-native-keychain` 10.0.0 | Todavía no se usa (el portal no guarda nada sensible en el cliente) | Las páginas oficiales pidieron un permiso que no se respondió |
| `signInWithRedirect(getAuth(), provider)` de `@react-native-firebase/auth` devuelve `UserCredential` con `.user` en el flujo nativo | `application/auth/authService.ts` (`loginConMicrosoft`) | Visto en rnfirebase.io/auth/social-auth, no se confirmó el tipo de retorno en v26 |
| Código de error que devuelve el SDK nativo cuando el usuario cancela el login Microsoft (se usan los dos del portal) | `authService.ts` (`CODIGOS_CANCELACION`) | Sin fuente |
| API modular de `@react-native-firebase/firestore` 26 (`getFirestore`, `collection`, `query`, `where`, `getDocs`, `doc`, `getDoc`, `setDoc`, `updateDoc`, `snapshot.exists()`) | `usuariosFirestore.ts` | Escrito de memoria |
| Forma de la respuesta de `api/Usuarios/login`: solo se confirmó el campo `token` | `tokenStore.ts` (`TokenServicio`) | El portal solo lee `token` |
| Que el portal agregue el Bearer en todas las llamadas con header explícito (la app lo suma por interceptor si falta) | `apiClient.ts` | Se leyó solo `AuthContext` y `useTokenStore` |
| Que los archivos de fuente se llamen `Montserrat-Regular`, `-Medium`, `-SemiBold`, `-Bold` | `typography.ts` | Depende de cómo se agreguen las fuentes en el proyecto nativo |
| Versión de TypeScript que trae la plantilla de RN 0.88 y compatibilidad con `@react-native/typescript-config` 0.88.0 | `tsconfig.json` | La plantilla la define al generar el proyecto |
| Los tokens de color "derivado" de `colors.ts` (variantes con transparencia, `overlay`, `inputDisabled`) no existen tal cual en el portal | `colors.ts` | Son una adaptación; se pueden ajustar viendo la app |
| Tipos de `NativeStackScreenProps`, `createNativeStackNavigator`, `DefaultTheme`/`DarkTheme` y que el tema de v7 conserve `fonts` al hacer `spread`; que `beforeRemove` se dispare con el botón atrás de Android y el gesto de iOS | `navigation/*`, `DatosPersonalesScreen.tsx` | Escrito con la API conocida de react-navigation 7; sin consultar la documentación de la versión exacta |
| `useRoute<RouteProp<RootStackParams, 'Licencias'>>()` y el parámetro opcional `seccion` | `LicenciasScreen.tsx`, `navigation/tipos.ts` | Escrito con la API conocida de react-navigation 7 |
| El texto "Cerrando sesión…" y el tiempo de 1500 ms del overlay son los del portal (`AuthContext`), pero su aspecto exacto no se leyó | `OverlayCerrandoSesion.tsx` | Aspecto propio, sin fuente |
| Aspecto de la pantalla de selección de puesto: se leyó la estructura y los textos, no cada valor de estilo (el círculo del ícono lleva color liso en vez de degradado) | `SeleccionarPuestoScreen.tsx` | Aproximación |
| Aspecto de los componentes de campo, diálogos y chips del portal (`src/@core/theme/overrides/*`) | `components/form/*`, `AppModal.tsx`, `Etiqueta.tsx` | Aproximación con los tokens del portal |
| Cabecera del legajo: alto (110 pt) y color de relleno de la portada, y borde del avatar (el portal usa 3 px `azulLight`; la app usa 2 px del color de la tarjeta) | `PerfilLegajoBanner.tsx` | La portada no existe en el portal (decisión 88); el borde del avatar es aproximación |
| Campos del CRM de Licencias y vacaciones: `new_tienelimiteanual` como booleano, `_new_vacaciones_value` para distinguir vacaciones, estructura de `reportaA`, vacaciones sin filtro de `statecode`, orden de las notas, notas sin filtro `isdocument`, `diasCorrespondientes` en "Período Actual" | `domain/licencias/mapeo.ts`, `infrastructure/licencias/*` | Inferidos de cómo los usa el portal; ver decisión 54 |
| Aspecto de la grilla del calendario, de las tarjetas de solicitud y de la disposición de los cuatro números del panel de vacaciones | `CalendarioSeccion.tsx`, `VacacionesPanel.tsx`, `TarjetaSolicitud.tsx` | Adaptación propia a celular; el portal usa `react-big-calendar` y grillas de MUI |
| Tamaño y tipografía de las insignias de estado (colores y textos sí son los del `StatusBadge`) | `EstadoChip.tsx` | Aproximación; el portal usa un `Chip` de MUI de 24 px |
| Fechas del modal de producción científica (`diaADocenciaApi`) y que `CustomDateField` entregue un `Date` (las de estancias y jornadas ya se cerraron, decisión 87) | `domain/perfil/produccionCientifica.ts`, `domain/perfil/resultados.ts` | El modal de producción y `CustomDateField` no se releyeron para esto |
| Lectura de las producciones "por autor" sin el link-entity externo del portal (el FetchXML de `getProduccionCientificaPorAutor` está en el store, no leído), y `new_tipodecaso` sin enviar (diferencia consciente) | `infrastructure/perfil/resultadosApi.ts`, `armarPayloadProduccion` | Parcial: el armado, filtro, deduplicado y orden ya coinciden con `useGetProduccionCientifica` (decisión 87) |
| Reglas de autores que salen del modal y no de los hooks: "Otras instituciones" no obligatorio, respuesta con `colaboradorNombre` y respaldo en `nombreYApellido` | `domain/perfil/produccionCientifica.ts` | Inferido (decisiones 72 y 87); no se releyó el modal de autores |
| Textos propios de Resultados / Impacto I+D (respuesta de autor, rótulos, vacíos, diálogos de eliminar jornadas y estancias, subtítulos de pestaña) | `InvestigacionResultados.tsx`, `SeccionProducciones.tsx`, `ModalProduccion.tsx` | El portal no los tiene verificados (decisión 73) |
| Campos que el modal de producción acepta con dos nombres de alias | `domain/perfil/produccionCientifica.ts` | Inferido (decisión 72) |
| Plan de Trabajo: el `statuscode` que se manda al enviar es el actual del plan y el backend resuelve la transición | `domain/pta/payloads.ts`, `infrastructure/pta/ptaApi.ts` | Inferido de cómo lo manda el portal (decisión 79) |
| Plan de Trabajo: la fecha de última carga de un adjunto se muestra con la hora del dispositivo (el portal resta 3 horas al texto formateado) | `components/pta/ResumenPta.tsx` | Inferido de que el valor llega en UTC (decisión 80) |
| Plan de Trabajo: texto "Cargo" / "Encargo" de los avisos, mensaje "Solo se permiten letras", aviso "Proceso exitoso" en bajas sin texto verificado, marcas "Otro nivel" / "Otra unidad" de Clases | `domain/pta/secciones.ts`, `domain/pta/catalogos.ts` | Inferidos (decisión 84). Los toasts viven en `usePlanDeTrabajoStore` del portal; para cerrarlos hay que releer ese store sección por sección |
| Plan de Trabajo: la app bloquea altas, ediciones, bajas, guardados y adjuntos con la regla `isDisabled`; en algunos casos el portal podría permitir guardar | `SeccionPta.tsx`, `ResumenPta.tsx`, `DatosDocenciaPta.tsx`, `DatosInvestigacionPta.tsx` | Inferido (decisión 84) |
| Plan de Trabajo: distribución en barras en lugar del gráfico de torta (`PieActiveArc`, no leído) y título propio del recuadro | `components/pta/ResumenPta.tsx` | Adaptación propia (decisiones 81 y 86) |
| Plan de Trabajo: textos propios ("Todavía no hay datos cargados para mostrar.", "Todavía no se cargó ningún informe.", "No hay planes de trabajo en esta pestaña.", "No se encontró el plan de trabajo.", "Los días son requeridos") | `PlanTrabajoScreen.tsx`, `PlanTrabajoDetalleScreen.tsx`, `ResumenPta.tsx`, `DatosInvestigacionPta.tsx` | El portal no los tiene (decisión 86) |
| Plan de Trabajo: encabezado de la página (`PlanTrabajoPageHeader`) | `PlanTrabajoScreen.tsx` | No se leyó |
| Tablero de Inicio: aspecto de las tarjetas (colores y radios se tomaron de los componentes del portal; el degradado del modo oscuro de la tarjeta del mensaje es un color liso) y textos propios ("No hay cumpleaños hoy", "No hay feriados próximos") | `components/inicio/*` | Adaptación propia (decisión 89); ver `contexto/inicio.md` |
| Tablero de Inicio: que el portal use `user.nombre` o el primer nombre de `fullname` para el saludo, y el filtro de empleados activos para cumpleaños (`statecode = 0`) | `domain/inicio/tablero.ts`, `infrastructure/inicio/tableroApi.ts` | Leído en `page.tsx` y los hooks; sin comprobar contra datos reales |
| Notificaciones: sección `equipo` de Licencias como destino de `seccion=gestion`; orden descendente de "Todas"; lista de módulos del filtro tomada de las filas presentes; filtro de fecha que excluye filas sin fecha; ruta disponible para todos los roles | `domain/notificaciones/notificaciones.ts` (`resolverDestino`, `filtrarNotificaciones`), `RootNavigator.tsx`, `NotificacionesScreen.tsx` | Inferido: no se leyó `components/table/Table` ni el menú (decisión 90) |
| Notificaciones: textos propios ("No hay notificaciones en esta pestaña.", "No se pudieron cargar las notificaciones. Intentá nuevamente.", "No se pudo marcar la notificación como leída", "Esta sección todavía no está disponible en la app.", botón "Actualizar") y aspecto de las tarjetas | `NotificacionesScreen.tsx`, `TarjetaNotificacion.tsx`, `notificacionesService.ts` | El portal no los tiene (decisión 90) |
| Notificaciones: `htmlAtexto` con expresiones regulares en lugar de `DOMParser` (entidades poco comunes quedan sin decodificar) | `domain/notificaciones/notificaciones.ts` | Diferencia consciente (decisión 90) |
| Notificaciones: el filtro `tipo` de `/licencias?seccion=gestion&tipo=...` no se usa porque la pantalla de Licencias no lo recibe | `domain/notificaciones/notificaciones.ts` (`resolverDestino`) | Diferencia consciente; evaluar si Licencias debe aceptarlo |
| Revisión estática archivo por archivo del resto de `src/` (imports, exports, tipos) | Todo `src/` salvo el Plan de Trabajo y la configuración (ver `VERIFICACIONES.md`) | Sin hacer |

## Falta verificar antes de construir lo que depende de ello

| Qué | Cuándo |
|---|---|
| Uso de `UnidadDeNegocio` (`NEXT_PUBLIC_UNIDAD_NEGOCIO`) en el portal; si hace falta una variable de entorno más | Etapa 2 (endpoints) |
| Controllers de la API (`HROneClickController`, `ConsultafetchController`, `V1/*`) y diferencia entre `consultafetch` y `consultafetchs`, si hace falta | Cuando un contrato lo requiera |
| Documentar en `contexto/perfil.md` el contrato detallado de Extensión, Gestión académica, Docencia, Afiliaciones y Actividad I+D | Antes de cerrar Perfil |
| Módulo Documentación del portal: encontrar la página (el hook `src/hooks/useGetDocumentosEmpleado.ts` existe, pero la página no está bajo `src/app/(dashboard)` con ese nombre), leer su código y escribir `contexto/documentacion.md` | Antes de construirlo (es el siguiente) |

Ya leído y migrado en la etapa 6: tipos y tamaño de archivos (JPG, JPEG, PNG, PDF, DOC, DOCX; 15 MB), campos de `ModalConyuge` y `ModalHijos`, rutas de adjuntos de familiares, `CustomTextField` / `CustomSearchSelect` / `CustomDateField` (comportamiento). Leído y migrado en la etapa 5: `UserProfileBanner`, `LegajoPageHeader`, `PerfilHeader`, `actualizarFotoPerfil` y `actualizarFotoPortada`. Leído y migrado en la etapa 8: modales de licencias y vacaciones, `columnsLicencias`, `columnsVacaciones`, `columnsGestionSolicitudes`, `StatusBadge`, `useSolicitudesEquipo`, `useCancelarVacacion`, `useVacaciones`, `periodoSolicitable`, `DomicilioDeclarado`. Leído y migrado en las etapas 9 a 12: las páginas de Perfil del portal (Formación, Trayectoria, Extensión, Gestión académica, Docencia e Investigación) con sus modales, hooks y store. Leído y migrado en la etapa 13: la página `/planes-de-trabajo`, `ModalPlanDeTrabajoDocente`, `usePlanDeTrabajoStore`, `columnsPlanTrabajo`, los hooks de lectura, de cargos, encargos, transferencia, formaciones y bloques, los modales de cada sección, `TableIndicadores`, `FileUploaderMultiple`, `useEnviarArchivos` y los catálogos de `useAutocompletadosStore`. Leído y migrado en las etapas 14 y 15: `page.tsx` del tablero, los componentes `austral/*` del tablero, `useGetFeriados`, `useGetCumpleanios`, `notificaciones/page.tsx`, `useGetNotificaciones`, `columnsNotificaciones`, `rutaNotificacion`, `getNotificacionesEmpleado` de `useLegajoStore` y `keys.ts`.

**Cerrado el 2026-10-26** (decisión 87): se leyeron en `HW-Austral/Portal-Austral-Dev` los hooks `src/hooks/plan-de-trabajo/useCargar*` y `useEditar*` (áreas de interés, clases, congresos, dirección de tesis, divulgación, jurado, proyecto, publicaciones y extensión) y, en `src/hooks/investigacion-perfil/`, los de producción científica, autores, estancias y participación en jornadas, con el modal de estancias. Los hooks del Plan de Trabajo son envoltorios finos sobre el store: solo definen qué se vuelve a leer tras cada operación, y la app ya relee lo mismo o más (incluida la demora de 9 s al borrar un proyecto). Los cuerpos y avisos de Resultados / Impacto I+D coinciden con los de la app. No hubo que corregir código. Diferencia de comportamiento nueva: si falla la edición de una extensión, el portal cierra igual el modal y la app lo deja abierto (consciente).

**Cerrado el 2026-10-26** (decisión 88): iniciales del avatar (ahora con la fórmula exacta de `getInitials` del portal) y foto de portada (construida; el portal tiene la función pero su cabecera no la usa).

**Cerrado el 2026-10-26** (decisiones 89 y 90): Tablero de Inicio y Notificaciones construidos leyendo el portal. Queda por cargar a mano el texto de las 18 frases mensuales.

## Plan de etapas

1. Base del proyecto. (**hecha**, sin probar; tema con los valores del portal)
2. Cliente HTTP, token y endpoints (**escritos**, `config/api/endpoints.ts` y `endpointsNotificaciones.ts`). Falta la lectura de `UnidadDeNegocio`.
3. Autenticación: servicio, roles, errores, store y consultas, más pantallas de ingreso y selección de puesto (**escritos**, sin probar). Sin registro ni recuperación (decisión 36).
4. Navegación raíz por estado y overlay de cierre de sesión (**escritos**, sin probar). `escucharSesion()` se conecta en `RootNavigator`.
5. Foto de perfil, foto de portada y cabecera del legajo (**escritas**, sin probar; decisiones 45, 47 y 88).
6. Datos personales (Identidad, Contacto, Domicilio real, Familia con documentación, Contacto de emergencia), con confirmación al salir con cambios sin guardar (**escrito**, sin probar; ver decisiones 37 a 44).
7. Funciones de Nombramientos y Promoción (la resolución de funciones ya está en `domain/roles`; falta el uso en navegación y guardas). **Va al final, por pedido de Daniel.**
8. Licencias y vacaciones: licencias propias, vacaciones, calendario y gestión del equipo (**escrito** y alineado con el portal, sin probar; decisiones 48 a 56; ver `contexto/licencias-y-vacaciones.md`). Acceso desde `Inicio`.
9. Perfil: Formación y Trayectoria profesional (**escritos**, sin probar; decisiones 57 a 63).
10. Perfil: Extensión y Gestión académica (**escritas**, sin probar; decisión 64).
11. Perfil: Docencia (**escrita**, sin probar; decisiones 64 y 66).
12. Perfil: Investigación, con Afiliaciones, Actividad I+D (proyectos, financiamientos, formación de RRHH y "Más info" de los siete tipos de resultado) y Resultados / Impacto I+D (**escritas**, sin probar; decisiones 65 a 74 y 87).
13. Plan de Trabajo (`/planes-de-trabajo`, solo docente): lista, detalle con sus pestañas, dieciocho secciones de registros, resumen con adjuntos y envío (**escrito**, sin probar; decisiones 75 a 86 y 87; ver `contexto/plan-de-trabajo.md`). Acceso desde `Inicio`.
14. Tablero de Inicio real (**escrito**, sin probar; decisión 89; ver `contexto/inicio.md`). Faltan los textos del mensaje del mes.
15. Notificaciones (**escritas**, sin probar; decisión 90; ver `contexto/notificaciones.md`). Acceso desde `Inicio`.
16. Documentación (**sigue**).
