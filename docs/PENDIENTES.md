# Pendientes

Se actualiza. Tres tipos: decisiones de Daniel, tareas externas al código y cosas que faltan leer o verificar.

## Decisiones de Daniel

- Qué otros módulos entran en el MVP después de Datos personales y Licencias y vacaciones.
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
| Que existan en Ionicons los nombres usados: `lock-closed-outline`, `shield-checkmark-outline`, `open-outline`, `swap-horizontal-outline`, `briefcase-outline`, `school-outline`, `id-card-outline`, `checkbox`, `square-outline`, `cloud-upload-outline`, `cloud-offline-outline`, `folder-open-outline`, `images-outline`, `camera-outline`, `document-text-outline`, `eye-outline`, `create-outline`, `trash-outline`, `information-circle`, `information-circle-outline`, `person-outline`, `search-outline`, `calendar-outline`, `close-circle`, `chevron-down`, `location-outline`, y en Licencias y vacaciones `add-circle-outline`, `checkmark-circle-outline`, `close-circle-outline`, `chevron-back`, `chevron-forward`, `home-outline`, `close` | Pantallas de ingreso, `AppCheckbox`, Datos personales, cabecera y Licencias y vacaciones | Escritos de memoria; el tipo `AppIconName` (todos los nombres de Ionicons) los valida al compilar |
| API de `@react-native-community/datetimepicker` 9.2.1: `DateTimePickerAndroid.open` con `onValueChange` / `onDismiss` y el componente con `onValueChange` en iOS | `DateField.tsx` | Visto en la documentación del paquete; no se confirmó contra los tipos de la versión exacta |
| API de `react-native-image-picker` 8.2.1 (`launchCamera`, `launchImageLibrary`, `selectionLimit: 0` para varias, `assets[0].type`) | `seleccionArchivos.ts`, `seleccionFoto.ts` | Escrito de memoria |
| API de `@react-native-documents/picker` 12.0.2: `pick`, `types`, `isErrorWithCode`, `errorCodes.OPERATION_CANCELED` | `seleccionArchivos.ts` | Escrito de memoria |
| API de `@react-native-documents/viewer` 4.0.2: `viewDocument({ uri, mimeType, grantPermissions })` | `visorArchivos.ts` | Escrito de memoria |
| API de `react-native-blob-util` 0.25.1: `fs.dirs.CacheDir` y `fs.writeFile(ruta, base64, 'base64')` | `visorArchivos.ts` | Escrito de memoria |
| Que `FormData.append('file', { uri, name, type })` suba bien archivos `content://` de Android | `familiaresApi.ts`, `licenciasApi.ts` | Es el patrón habitual de React Native; sin confirmar con la versión |
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

## Falta verificar antes de construir lo que depende de ello

| Qué | Cuándo |
|---|---|
| Tablero de inicio del portal (`/`): no se leyó ni se migra; `Inicio` es provisorio | Cuando se definan los módulos del MVP |
| Foto de portada: `PerfilHeader.tsx` (`legajo/_components/component/`) no se leyó y no se encontró qué pantalla lo usa; la cabecera de Datos personales no muestra portada. Si alguna pantalla del MVP la usa, se agrega `actualizarFotoPortada` (`{uid}/foto portada`, `photoPORTADA`) | Cuando se definan los módulos del MVP |
| Uso de `UnidadDeNegocio` (`NEXT_PUBLIC_UNIDAD_NEGOCIO`) en el portal; si hace falta una variable de entorno más | Etapa 2 (endpoints) |
| Controllers de la API (`HROneClickController`, `ConsultafetchController`, `V1/*`) y diferencia entre `consultafetch` y `consultafetchs`, si hace falta | Cuando un contrato lo requiera |

Ya leído y migrado en la etapa 6: tipos y tamaño de archivos (JPG, JPEG, PNG, PDF, DOC, DOCX; 15 MB), campos de `ModalConyuge` y `ModalHijos`, rutas de adjuntos de familiares, `CustomTextField` / `CustomSearchSelect` / `CustomDateField` (comportamiento). Leído y migrado en la etapa 5: `UserProfileBanner`, `LegajoPageHeader` y `actualizarFotoPerfil`. Leído y migrado en la etapa 8: modales de licencias y vacaciones, `columnsLicencias`, `columnsVacaciones`, `columnsGestionSolicitudes`, `StatusBadge`, `useSolicitudesEquipo`, `useCancelarVacacion`, `useVacaciones`, `periodoSolicitable`, `DomicilioDeclarado`.

## Plan de etapas

1. Base del proyecto. (**hecha**, sin probar; tema con los valores del portal)
2. Cliente HTTP, token y endpoints (**escritos**, `config/api/endpoints.ts`). Falta la lectura de `UnidadDeNegocio`.
3. Autenticación: servicio, roles, errores, store y consultas, más pantallas de ingreso y selección de puesto (**escritos**, sin probar). Sin registro ni recuperación (decisión 36).
4. Navegación raíz por estado, overlay de cierre de sesión e `Inicio` provisorio con acceso a Datos personales (**escritos**, sin probar). `escucharSesion()` se conecta en `RootNavigator`.
5. Foto de perfil y cabecera del legajo (**escritas**, sin probar; decisiones 45 a 47). La portada no se construye.
6. Datos personales (Identidad, Contacto, Domicilio real, Familia con documentación, Contacto de emergencia), con confirmación al salir con cambios sin guardar (**escrito**, sin probar; ver decisiones 37 a 44).
7. Funciones de Nombramientos y Promoción (la resolución de funciones ya está en `domain/roles`; falta el uso en navegación y guardas). **Sigue.**
8. Licencias y vacaciones: licencias propias, vacaciones, calendario y gestión del equipo (**escrito** y alineado con el portal, sin probar; decisiones 48 a 56; ver `contexto/licencias-y-vacaciones.md`). Acceso desde `Inicio`.
