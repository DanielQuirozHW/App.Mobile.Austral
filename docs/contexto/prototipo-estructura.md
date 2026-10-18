# Estructura y convenciones del prototipo

Repo de referencia: `gmhwapp/Protoype-RN` (solo lectura). **De aquí se toma estructura y forma de programar, no contenido ni lógica.** La lógica de negocio la define el portal.

> **Este documento describe el prototipo, no la app nueva.** La app nueva difiere en las librerías: ver [`../STACK.md`](../STACK.md) (React Native 0.88, StyleSheet en lugar de UI Kitten/Paper, date-fns en lugar de moment, React Native Firebase en lugar del SDK web, `native-stack`). Donde esta página dice "UI Kitten", "Paper" o "moment", es el prototipo.

## Estructura real (verificado listando el repo)

Raíz: `index.js`, `app.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `jest.config.js`, `react-native.config.js`, `theme.json`, `firebase-config.js`, `.env.template`, `android/`, `ios/`, `assets/`, `src/`.

`src/`:

| Carpeta | Qué contiene |
|---|---|
| `PeopleOneClick.tsx` | Componente raíz de la app (providers y navegación) |
| `config/api` | Instancia de axios (`dynamicsApi.ts`) |
| `config/adapters` | `async-storage.ts` (StorageAdapter), `firebase-uses.ts`, `firebaseResizedImage.ts`, `photoMigration.ts` |
| `domain` | Capa de dominio |
| `infrastructure/interfaces` | Interfaces |
| `services` | Servicios por dominio, con `index.ts` |
| `presentation/screens` | Pantallas por área |
| `presentation/navigation` | `BottomNavigator`, `StackNavigator`, `TopTabsNavigator`, `SideScreenNavigations`, `ProtectedRoute` |
| `presentation/store` | Stores de zustand por área |
| `presentation/providers` | `AuthProvider`, `ThemeProvider` |
| `presentation/theme` | `colors.js`, `glass.ts`, `theme.tsx`, `typography.ts` |
| `presentation/components`, `hooks`, `utils` | Compartidos. `utils`: `responsive.ts`, `IosStyle.ts`, `contrast.ts`, `haptics.ts`, `statusColors.ts` |
| `types`, `utils` | Tipos y utilidades globales |

## Stack del prototipo (verificado en `package.json`)

- React Native 0.74.3 y React 18.2.0, TypeScript 5.0.4, sin Expo (`@react-native-community/cli`, con `android/` e `ios/`).
- Navegación: `@react-navigation` (native, stack, bottom-tabs, drawer, material-top-tabs).
- Estado: `zustand` (con `persist` y AsyncStorage). Datos: `@tanstack/react-query`.
- Formularios: `react-hook-form` con `yup` y `@hookform/resolvers`.
- UI: `@ui-kitten/components` (tema Eva) y `react-native-paper`.
- HTTP: `axios`. Identidad: `firebase` (SDK web).
- Almacenamiento seguro: `react-native-keychain`. Local: `@react-native-async-storage/async-storage`.
- Otros: `react-native-dotenv`, `react-native-image-picker`, `react-native-file-viewer`, `react-native-fs`, `moment`, `react-native-calendars`.

El stack de la app nueva está en `docs/STACK.md`; este listado es solo la referencia.

## Armado de la app (verificado, `src/PeopleOneClick.tsx`)

Orden de providers, de afuera hacia adentro: `GestureHandlerRootView` → `ThemeModeProvider` → `ThemeProvider` → `ToastProvider` → `ApplicationProvider` (UI Kitten, tema Eva más `theme.json`) → `PaperProvider` → `NavigationContainer` (con tema derivado de los colores) → `AuthProvider` → navegador principal.

## Navegación (verificado, `StackNavigator.tsx`)

- Un stack con `headerShown: false`. Mientras el store no se rehidrató o el estado es de verificación, muestra `LoadingScreen`.
- Estado autenticado → pantallas de la app; no autenticado → Login, Registro, Contraseña y Recuperar. El cambio de grupo de pantallas lo decide el estado de auth, no `navigate`.
- `RootStackParams` tipa las rutas.
- Se verifica la integridad de sesión al arrancar si ya estaba autenticado.
- El `ProtectedRoute` del prototipo solo distingue autenticado / no autenticado; el de la app nueva debe sumar roles y funciones como el portal.

## Tema y UI (verificado, `skill-rn-ui.md`, `theme.tsx`, `colors.js`, `typography.ts`, `responsive.ts`)

Lo que sigue vale para la app nueva (ver la skill `ui-componentes-propios`):

- `useThemeColors()` devuelve `globalColors`, `isDark` y la tipografía. Nunca colores hardcodeados.
- Tipografía: `Poppins` para títulos y valores destacados; `opensans-regular` para textos secundarios. Escala con tokens (`displayLg` … `button`), tamaños con `platformFontSizes`, espacios con `spacing`, radios con `borderRadius`, `scale()` para dimensiones fijas, sombras con `platformSpecific.shadow(n)`.
- Estilos con `StyleSheet.create` dentro de `createStyles` memoizado con `useMemo`.
- Botones y tarjetas con `Pressable` y `android_ripple` (nunca `TouchableOpacity`). Mínimo táctil 44 pt iOS / 48 dp Android.
- Android: no combinar `overflow: hidden` y `elevation` en el mismo View.
- Modales tipo hoja inferior: `Modal` → overlay → `KeyboardAwareScrollView` → contenido con `height: '100%'` y `paddingTop`. Sin `KeyboardAvoidingView`.
- Header con `useSafeAreaInsets`; no combinar `SafeAreaView` con `paddingTop: top+X`.
- Animaciones de entrada con Reanimated.

Solo del prototipo (no se usa en la app nueva): íconos de Eva, gradientes con `react-native-linear-gradient`, tokens de "glass" y desenfoque, `ThemeModeProvider` con selector manual de tema.

Tokens de color del prototipo: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `text`, `textSecondary`, `textTertiary`, `card`, `border`, `accentPrimary`, `accentCta`, entre otros. Los valores del prototipo son de la marca de ese prototipo; en la app nueva son provisorios.

## Patrones de código (verificado)

- **Store de auth** con zustand y `persist` sobre AsyncStorage; `partialize` guarda solo lo no sensible. Estado con `status` y `isHydrated`, rehidratación con `onRehydrateStorage`.
- **`StorageAdapter`** (`config/adapters/async-storage.ts`): clase estática con `getItem` (devuelve `null` si falla), `setItem` y `removeItem`.
- **Firebase** (`config/adapters/firebase-uses.ts`): `getFirebaseApp()` idempotente; `getFirebaseAuth()` con `initializeAuth` y persistencia en AsyncStorage (con respaldo a `getAuth` si ya existía); Firestore en modo `lite`; `Alert.alert` para errores con funciones de mensaje por código (`MensajeErroLogin`, `MensajeErrorRegistro`, `MensajeErrorForgotPassword`). Fotos: `uploadBytes` + `getDownloadURL` + `updateDoc`.
- **Capa de servicios**: funciones `fetchX` / `updateX` por dominio que llaman a una instancia de axios.
- **Cliente HTTP**: instancia de axios con interceptor de request (Bearer) y de response (ante 401 reintenta una vez tras refrescar el token).
- **Pantallas** agrupadas por área, con modales como archivos aparte.

## Errores heredados a NO arrastrar (verificado)

- El typo "Protoype" y el nombre genérico `OneClickApp` / `PeopleOneClick`.
- El README genérico de React Native.
- El estado `'cheking'` del auth y la ruta `infrastructure/interfaces/auth.satus`.
- URLs del backend escritas en el código (`dynamicsApi.ts`, y `hw365api.azurewebsites.net` dentro de `firebase-uses.ts`): la app nueva las toma de variables de entorno vacías.
- La lógica de auth del prototipo: usa variables `API_EMAIL` / `API_PASSWORD` y un alta de usuario propia que no coincide con el portal. La app nueva sigue la del portal (y los nombres de `.env.template`).
- La ruta de Storage `foto_perfil`: el portal usa `foto perfil`.
- Pantalla de login embebida como respaldo dentro de `ProtectedRoute`: el portal manda al login.
- Mensajes de error genéricos del prototipo: los textos salen del `authError.ts` del portal.
- `includeFontPadding` pasado como prop de `Text` en `textDefaults` (es un estilo de Text en Android).
- `ThemeProvider` acoplado al tema de navegación mediante `useTheme` y un `try/catch` con `console.log`.
- `scale()` calculado una sola vez al importar el módulo, sin tener en cuenta la rotación. La app nueva lo documenta y bloquea la orientación vertical en el proyecto nativo.

## Falta leer

- Componentes compartidos concretos (`presentation/components`), `hooks` y `domain`, a medida que se necesiten.
- `glass.ts` y `IosStyle.ts`: no se usan en la app nueva.
