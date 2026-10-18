# Pendientes

Se actualiza. Tres tipos: decisiones de Daniel, tareas externas al código y cosas que faltan leer o verificar.

## Decisiones de Daniel

- Qué otros módulos entran en el MVP después de Datos personales.
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
| Que existan en Ionicons los nombres usados: `lock-closed-outline`, `shield-checkmark-outline`, `open-outline`, `swap-horizontal-outline`, `briefcase-outline`, `school-outline`, `id-card-outline`, `checkbox`, `square-outline`, `cloud-upload-outline`, `cloud-offline-outline`, `folder-open-outline`, `images-outline`, `camera-outline`, `document-text-outline`, `eye-outline`, `create-outline`, `trash-outline`, `information-circle`, `information-circle-outline`, `person-outline`, `search-outline`, `calendar-outline`, `close-circle`, `chevron-down` | Pantallas de ingreso, `AppCheckbox` y componentes de Datos personales | Escritos de memoria; el tipo `AppIconName` los valida al compilar |
| API de `@react-native-community/datetimepicker` 9.2.1: `DateTimePickerAndroid.open` con `onValueChange` / `onDismiss` y el componente con `onValueChange` en iOS | `DateField.tsx` | Visto en la documentación del paquete; no se confirmó contra los tipos de la versión exacta |
| API de `react-native-image-picker` 8.2.1 (`launchCamera`, `launchImageLibrary`, `selectionLimit: 0` para varias) | `seleccionArchivos.ts` | Escrito de memoria |
| API de `@react-native-documents/picker` 12.0.2: `pick`, `types`, `isErrorWithCode`, `errorCodes.OPERATION_CANCELED` | `seleccionArchivos.ts` | Escrito de memoria |
| API de `@react-native-documents/viewer` 4.0.2: `viewDocument({ uri, mimeType, grantPermissions })` | `visorArchivos.ts` | Escrito de memoria |
| API de `react-native-blob-util` 0.25.1: `fs.dirs.CacheDir` y `fs.writeFile(ruta, base64, 'base64')` | `visorArchivos.ts` | Escrito de memoria |
| Que `FormData.append('file', { uri, name, type })` suba bien archivos `content://` de Android | `familiaresApi.ts` | Es el patrón habitual de React Native; sin confirmar con la versión |
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
| El texto "Cerrando sesión…" y el tiempo de 1500 ms del overlay son los del portal (`AuthContext`), pero su aspecto exacto no se leyó | `OverlayCerrandoSesion.tsx` | Aspecto propio, sin fuente |
| Aspecto de la pantalla de selección de puesto: se leyó la estructura y los textos, no cada valor de estilo (el círculo del ícono lleva color liso en vez de degradado) | `SeleccionarPuestoScreen.tsx` | Aproximación |
| Cabecera de Datos personales (`PerfilLegajoBanner`): el portal usa `LegajoPageHeader` y `UserProfileBanner`, que todavía no se leyeron | `PerfilLegajoBanner.tsx` | Provisoria; se ajusta cuando se lea el portal (etapa de fotos) |
| Aspecto de los componentes de campo, diálogos y chips del portal (`src/@core/theme/overrides/*`) | `components/form/*`, `AppModal.tsx`, `Etiqueta.tsx` | Aproximación con los tokens del portal |

## Falta verificar antes de construir lo que depende de ello

| Qué | Cuándo |
|---|---|
| Tablero de inicio del portal (`/`): no se leyó ni se migra; `Inicio` es provisorio | Cuando se definan los módulos del MVP |
| `LegajoPageHeader` y `UserProfileBanner` (cabecera del legajo, foto de portada) | Etapa 5 |
| Foto de portada: confirmar en el portal que existe una pantalla que la use y dónde se muestra `photoPORTADA` | Etapa 5 |
| Ruta de la foto de perfil en Storage: el portal usa `{uid}/foto perfil` (con espacio) y el prototipo `{uid}/foto_perfil`. Vale el portal. | Etapa 5 |
| Uso de `UnidadDeNegocio` (`NEXT_PUBLIC_UNIDAD_NEGOCIO`) en el portal; si hace falta una variable de entorno más | Etapa 2 (endpoints) |
| Controllers de la API (`HROneClickController`, `ConsultafetchController`, `V1/*`) y diferencia entre `consultafetch` y `consultafetchs`, si hace falta | Cuando un contrato lo requiera |

Ya leído y migrado en la etapa 6: tipos y tamaño de archivos (JPG, JPEG, PNG, PDF, DOC, DOCX; 15 MB), campos de `ModalConyuge` y `ModalHijos`, rutas de adjuntos de familiares, `CustomTextField` / `CustomSearchSelect` / `CustomDateField` (comportamiento).

## Plan de etapas

1. Base del proyecto. (**hecha**, sin probar; tema con los valores del portal)
2. Cliente HTTP, token y endpoints (**escritos**, `config/api/endpoints.ts`). Falta la lectura de `UnidadDeNegocio`.
3. Autenticación: servicio, roles, errores, store y consultas, más pantallas de ingreso y selección de puesto (**escritos**, sin probar). Sin registro ni recuperación (decisión 36).
4. Navegación raíz por estado, overlay de cierre de sesión e `Inicio` provisorio con acceso a Datos personales (**escritos**, sin probar). `escucharSesion()` se conecta en `RootNavigator`.
5. Foto de perfil y de portada (`actualizarFotoPerfil` / `actualizarFotoPortada` de `AuthContext`: Storage `{uid}/foto perfil`, `{uid}/foto portada` + `updateDoc`). **Sigue.**
6. Datos personales (Identidad, Contacto, Domicilio real, Familia con documentación, Contacto de emergencia), con confirmación al salir con cambios sin guardar (**escrito**, sin probar; ver decisiones 37 a 44).
7. Funciones de Nombramientos y Promoción (la resolución de funciones ya está en `domain/roles`; falta el uso en navegación y guardas).
