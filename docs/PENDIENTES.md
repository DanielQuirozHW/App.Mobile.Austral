# Pendientes

Se actualiza. Tres tipos: decisiones de Daniel, tareas externas al código y cosas que faltan leer o verificar.

## Decisiones de Daniel

- Qué otros módulos entran en el MVP después de Datos personales, Licencias y vacaciones, Perfil y Plan de Trabajo. Los que Daniel elija entre los que quedan del portal (Documentación, GDD, Indicadores, funciones SA / VRAA, Referente MATHU, notificaciones, Promoción > Postulación).
- Si revierte alguno de los reemplazos de la decisión 20 (fs, file-viewer, íconos, native-stack, teclado).
- Nombre visible de la app (`displayName` en `app.json` está como "Austral", provisorio; el portal se llama "Portal Universidad Austral" en `themeConfig.ts`) y nombre del proyecto nativo (`AustralMobile`).
- Modo claro/oscuro: la app sigue el sistema; el portal arranca en claro y tiene un selector (su `settingsContext` no se leyó). Ver decisión 27.

## Tareas externas al código (las hace Daniel, más adelante)

La lista completa y ordenada está en [`SETUP-NATIVO.md`](SETUP-NATIVO.md). Resumen:

- Generar `android/` e `ios/` con el comando oficial y combinar con este repo.
- Registrar las apps iOS/Android en Firebase; habilitar el proveedor Microsoft; registro de la app en Microsoft Entra.
- Cargar los valores reales en un `.env` local (nombres en `.env.template`). Nunca se commitean.
- **Fuentes Montserrat** (400, 500, 600, 700; en el portal vienen de Google Fonts vía `next/font`; el repo del portal solo trae los .ttf 300, 700 y Regular), permisos (cámara, galería), bloqueo de orientación vertical y plugin de Babel de Reanimated.
- **Imágenes y logos**: los archivos binarios no se pueden subir por el conector. Copiar los logos a `src/assets/images` y completar `src/assets/images/logos.ts` (hoy devuelve `null` y la app muestra "Universidad Austral" en texto). Ver `SETUP-NATIVO.md`.
- Comprobar si el `uid` del login con Microsoft coincide con el del login SAML (los documentos de `usuarios` y las fotos se identifican por `uid`).
- Crear en Firebase las cuentas de usuario y contraseña que hagan falta, **con su documento en la colección `usuarios`** (decisión 36).
- Todas las pruebas.

## Falta verificar (escrito de memoria o con documentación incompleta)

Estos puntos están ya en el código y no se pudieron confirmar con una fuente. Se contrastan con la documentación oficial antes de dar la etapa por cerrada.

| Qué | Dónde está en el código | Por qué quedó sin verificar |
|---|---|---|
| `KeyboardProvider` y `KeyboardAwareScrollView` exportados por `react-native-keyboard-controller` 1.22.6 | `AppProviders.tsx`, `Screen.tsx`, `ScrollFormulario.tsx` | La página de instalación pidió un permiso que no se respondió a tiempo |
| Que `KeyboardAwareScrollView` acepte `ref` con `scrollTo`, `onScroll` y `scrollEventThrottle` como un `ScrollView` | `ScrollFormulario.tsx` | Escrito de memoria |
| Uso de `focusManager.setFocused` con `AppState` en React Native | `src/config/api/queryClient.ts` | Misma causa con la página de TanStack Query |
| Importación `{ Ionicons } from '@react-native-vector-icons/ionicons'` en React Native sin Expo | `AppIcon.tsx` | La página leída no cubre Android/iOS |
| Que existan en Ionicons los nombres usados: `lock-closed-outline`, `shield-checkmark-outline`, `open-outline`, `swap-horizontal-outline`, `briefcase-outline`, `school-outline`, `id-card-outline`, `checkbox`, `square-outline`, `cloud-upload-outline`, `cloud-offline-outline`, `folder-open-outline`, `images-outline`, `camera-outline`, `document-text-outline`, `eye-outline`, `create-outline`, `trash-outline`, `information-circle`, `information-circle-outline`, `person-outline`, `search-outline`, `calendar-outline`, `close-circle`, `chevron-down`, `location-outline`, y en Licencias y vacaciones `add-circle-outline`, `checkmark-circle-outline`, `close-circle-outline`, `chevron-back`, `chevron-forward`, `home-outline`, `close`, y en Inicio `clipboard-outline` | Pantallas de ingreso, `AppCheckbox`, Datos personales, cabecera, Licencias y vacaciones e Inicio | Escritos de memoria; el tipo `AppIconName` (todos los nombres de Ionicons) los valida al compilar |
| API de `@react-native-community/datetimepicker` 9.2.1: `DateTimePickerAndroid.open` con `onValueChange` / `onDismiss` y el componente con `onValueChange` en iOS | `DateField.tsx` | Visto en la documentación del paquete; no se confirmó contra los tipos de la versión exacta |
| API de `react-native-image-picker` 8.2.1 (`launchCamera`, `launchImageLibrary`, `selectionLimit: 0` para varias, `assets[0].type`) | `seleccionArchivos.ts`, `seleccionFoto.ts` | Escrito de memoria |
| API de `@react-native-documents/picker` 12.0.2: `pick`, `types`, `isErrorWithCode`, `errorCodes.OPERATION_CANCELED` | `seleccionArchivos.ts` | Escrito de memoria |
| API de `@react-native-documents/viewer` 4.0.2: `viewDocument({ uri, mimeType, grantPermissions })` | `visorArchivos.ts` | Escrito de memoria |
| API de `react-native-blob-util` 0.25.1: `fs.dirs.CacheDir` y `fs.writeFile(ruta, base64, 'base64')` | `visorArchivos.ts` | Escrito de memoria |
| Que `FormData.append('file', { uri, name, type })` suba bien archivos `content://` de Android | `familiaresApi.ts`, `licenciasApi.ts`, `ptaApi.ts` | Es el patrón habitual de React Native; sin confirmar con la versión |
| Exportaciones modulares de `@react-native-firebase/storage` 26.4.0: `getStorage`, `ref`, `putFile`, `getDownloadURL` | `infrastructure/auth/fotosStorage.ts` | Escrito de memoria |
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
| Iniciales del avatar: el portal usa `getInitials` (`@core/utils/get-initials`), que no se leyó; la app toma la primera letra de las dos primeras palabras | `PerfilLegajoBanner.tsx` | Aproximación |
| Campos del CRM de Licencias y vacaciones: `new_tienelimiteanual` como booleano, `_new_vacaciones_value` para distinguir vacaciones, estructura de `reportaA`, vacaciones sin filtro de `statecode`, orden de las notas, notas sin filtro `isdocument`, `diasCorrespondientes` en "Período Actual" | `domain/licencias/mapeo.ts`, `infrastructure/licencias/*` | Inferidos de cómo los usa el portal; ver decisión 54 |
| Aspecto de la grilla del calendario, de las tarjetas de solicitud y de la disposición de los cuatro números del panel de vacaciones | `CalendarioSeccion.tsx`, `VacacionesPanel.tsx`, `TarjetaSolicitud.tsx` | Adaptación propia a celular; el portal usa `react-big-calendar` y grillas de MUI |
| Tamaño y tipografía de las insignias de estado (colores y textos sí son los del `StatusBadge`) | `EstadoChip.tsx` | Aproximación; el portal usa un `Chip` de MUI de 24 px |
| Formato de las fechas de estancias, participación en jornadas y producciones (`diaADocenciaApi`) | `domain/perfil/resultados.ts`, `domain/perfil/produccionCientifica.ts` | Inferido; el portal las manda tal como las guarda su formulario (decisión 72) |
| Lectura de producciones propias sin el link-entity externo del portal (deduplicadas por id), y `new_tipodecaso` sin enviar | `infrastructure/perfil/resultadosApi.ts`, `armarPayloadProduccion` | Inferido (decisión 72) |
| Reglas de autores: "otro" no se envía si el lugar es la UA, el colaborador no se envía si es Otro, "Otras instituciones" no obligatorio, respuesta con `colaboradorNombre` y respaldo en `nombreYApellido` | `domain/perfil/produccionCientifica.ts` | Inferido (decisión 72) |
| Textos propios de Resultados / Impacto I+D (respuesta de autor, rótulos, vacíos, diálogos de eliminar jornadas y estancias, subtítulos de pestaña) | `InvestigacionResultados.tsx`, `SeccionProducciones.tsx`, `ModalProduccion.tsx` | El portal no los tiene verificados (decisión 73) |
| Campos que el modal de producción acepta con dos nombres de alias | `domain/perfil/produccionCientifica.ts` | Inferido (decisión 72) |
| Plan de Trabajo: el `statuscode` que se manda al enviar es el actual del plan y el backend resuelve la transición | `domain/pta/payloads.ts`, `infrastructure/pta/ptaApi.ts` | Inferido de cómo lo manda el portal (decisión 79) |
| Plan de Trabajo: la fecha de última carga de un adjunto se muestra con la hora del dispositivo (el portal resta 3 horas al texto formateado) | `components/pta/ResumenPta.tsx` | Inferido de que el valor llega en UTC (decisión 80) |
| Plan de Trabajo: hooks de alta y edición de áreas, proyectos, publicaciones, congresos, divulgaciones, dirección de tesis y jurado no leídos; los cuerpos salen del store del portal | `domain/pta/payloads.ts`, `domain/pta/secciones.ts` | No se leyeron (decisión 84) |
| Plan de Trabajo: texto "Cargo" / "Encargo" de los avisos, mensaje "Solo se permiten letras", aviso "Proceso exitoso" en bajas sin texto verificado, marcas "Otro nivel" / "Otra unidad" de Clases | `domain/pta/secciones.ts`, `domain/pta/catalogos.ts` | Inferidos (decisión 84) |
| Plan de Trabajo: la app bloquea altas, ediciones, bajas, guardados y adjuntos con la regla `isDisabled`; en algunos casos el portal podría permitir guardar | `SeccionPta.tsx`, `ResumenPta.tsx`, `DatosDocenciaPta.tsx`, `DatosInvestigacionPta.tsx` | Inferido (decisión 84) |
| Plan de Trabajo: distribución en barras en lugar del gráfico de torta (`PieActiveArc`, no leído) y título propio del recuadro | `components/pta/ResumenPta.tsx` | Adaptación propia (decisiones 81 y 86) |
| Plan de Trabajo: textos propios ("Todavía no hay datos cargados para mostrar.", "Todavía no se cargó ningún informe.", "No hay planes de trabajo en esta pestaña.", "No se encontró el plan de trabajo.", "Los días son requeridos") | `PlanTrabajoScreen.tsx`, `PlanTrabajoDetalleScreen.tsx`, `ResumenPta.tsx`, `DatosInvestigacionPta.tsx` | El portal no los tiene (decisión 86) |
| Plan de Trabajo: encabezado de la página (`PlanTrabajoPageHeader`) | `PlanTrabajoScreen.tsx` | No se leyó |

## Falta verificar antes de construir lo que depende de ello

| Qué | Cuándo |
|---|---|
| Tablero de inicio del portal (`/`): no se leyó ni se migra; `Inicio` es provisorio | Cuando se definan los módulos del MVP |
| Foto de portada: `PerfilHeader.tsx` (`legajo/_components/component/`) no se leyó y no se encontró qué pantalla lo usa; la cabecera de Datos personales no muestra portada. Si alguna pantalla del MVP la usa, se agrega `actualizarFotoPortada` (`{uid}/foto portada`, `photoPORTADA`) | Cuando se definan los módulos del MVP |
| Uso de `UnidadDeNegocio` (`NEXT_PUBLIC_UNIDAD_NEGOCIO`) en el portal; si hace falta una variable de entorno más | Etapa 2 (endpoints) |
| Controllers de la API (`HROneClickController`, `ConsultafetchController`, `V1/*`) y diferencia entre `consultafetch` y `consultafetchs`, si hace falta | Cuando un contrato lo requiera |
| Documentar en `contexto/perfil.md` el contrato detallado de Extensión, Gestión académica, Docencia, Afiliaciones y Actividad I+D | Antes de cerrar Perfil |

Ya leído y migrado en la etapa 6: tipos y tamaño de archivos (JPG, JPEG, PNG, PDF, DOC, DOCX; 15 MB), campos de `ModalConyuge` y `ModalHijos`, rutas de adjuntos de familiares, `CustomTextField` / `CustomSearchSelect` / `CustomDateField` (comportamiento). Leído y migrado en la etapa 5: `UserProfileBanner`, `LegajoPageHeader` y `actualizarFotoPerfil`. Leído y migrado en la etapa 8: modales de licencias y vacaciones, `columnsLicencias`, `columnsVacaciones`, `columnsGestionSolicitudes`, `StatusBadge`, `useSolicitudesEquipo`, `useCancelarVacacion`, `useVacaciones`, `periodoSolicitable`, `DomicilioDeclarado`. Leído y migrado en las etapas 9 a 12: las páginas de Perfil del portal (Formación, Trayectoria, Extensión, Gestión académica, Docencia e Investigación) con sus modales, hooks y store. Leído y migrado en la etapa 13: la página `/planes-de-trabajo`, `ModalPlanDeTrabajoDocente`, `usePlanDeTrabajoStore`, `columnsPlanTrabajo`, los hooks de lectura, de cargos, encargos, transferencia, formaciones y bloques, los modales de cada sección, `TableIndicadores`, `FileUploaderMultiple`, `useEnviarArchivos` y los catálogos de `useAutocompletadosStore`.

## Plan de etapas

1. Base del proyecto. (**hecha**, sin probar; tema con los valores del portal)
2. Cliente HTTP, token y endpoints (**escritos**, `config/api/endpoints.ts`). Falta la lectura de `UnidadDeNegocio`.
3. Autenticación: servicio, roles, errores, store y consultas, más pantallas de ingreso y selección de puesto (**escritos**, sin probar). Sin registro ni recuperación (decisión 36).
4. Navegación raíz por estado, overlay de cierre de sesión e `Inicio` provisorio con acceso a Datos personales (**escritos**, sin probar). `escucharSesion()` se conecta en `RootNavigator`.
5. Foto de perfil y cabecera del legajo (**escritas**, sin probar; decisiones 45 a 47). La portada no se construye.
6. Datos personales (Identidad, Contacto, Domicilio real, Familia con documentación, Contacto de emergencia), con confirmación al salir con cambios sin guardar (**escrito**, sin probar; ver decisiones 37 a 44).
7. Funciones de Nombramientos y Promoción (la resolución de funciones ya está en `domain/roles`; falta el uso en navegación y guardas). **Sigue.**
8. Licencias y vacaciones: licencias propias, vacaciones, calendario y gestión del equipo (**escrito** y alineado con el portal, sin probar; decisiones 48 a 56; ver `contexto/licencias-y-vacaciones.md`). Acceso desde `Inicio`.
9. Perfil: Formación y Trayectoria profesional (**escritos**, sin probar; decisiones 57 a 63).
10. Perfil: Extensión y Gestión académica (**escritas**, sin probar; decisión 64).
11. Perfil: Docencia (**escrita**, sin probar; decisiones 64 y 66).
12. Perfil: Investigación, con Afiliaciones, Actividad I+D (proyectos, financiamientos, formación de RRHH y "Más info" de los siete tipos de resultado) y Resultados / Impacto I+D (**escritas**, sin probar; decisiones 65 a 74).
13. Plan de Trabajo (`/planes-de-trabajo`, solo docente): lista, detalle con sus pestañas, dieciocho secciones de registros, resumen con adjuntos y envío (**escrito**, sin probar; decisiones 75 a 86; ver `contexto/plan-de-trabajo.md`). Acceso desde `Inicio`.
