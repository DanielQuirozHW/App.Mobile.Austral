# Estructura y convenciones del prototipo

Repo de referencia: `gmhwapp/Protoype-RN` (solo lectura). **De aquí se toma estructura y forma de programar, no contenido ni lógica.** La lógica de negocio la define el portal.

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

## Stack (verificado en `package.json`)

- React Native 0.74.3 y React 18.2.0, TypeScript 5.0.4, sin Expo (`@react-native-community/cli`, con `android/` e `ios/`).
- Navegación: `@react-navigation` (native, stack, bottom-tabs, drawer, material-top-tabs).
- Estado: `zustand` (con `persist` y AsyncStorage). Datos: `@tanstack/react-query`.
- Formularios: `react-hook-form` con `yup` y `@hookform/resolvers`.
- UI: `@ui-kitten/components` (tema Eva) y `react-native-paper`.
- HTTP: `axios`. Identidad: `firebase`.
- Almacenamiento seguro: `react-native-keychain`. Local: `@react-native-async-storage/async-storage`.
- Otros: `react-native-dotenv`, `react-native-image-picker`, `react-native-file-viewer`, `react-native-fs`, `moment`, `react-native-calendars`.

Las versiones y librerías de la app nueva se proponen en el plan; este listado es la referencia, no una obligación.

## Armado de la app (verificado, `src/PeopleOneClick.tsx`)

Orden de providers, de afuera hacia adentro: `GestureHandlerRootView` → `ThemeModeProvider` → `ThemeProvider` → `ToastProvider` → `ApplicationProvider` (UI Kitten, tema Eva más `theme.json`) → `PaperProvider` → `NavigationContainer` (con tema derivado de los colores) → `AuthProvider` → navegador principal.

## Navegación (verificado, `StackNavigator.tsx`)

- Un stack con `headerShown: false`. Mientras el store no se rehidrató o el estado es de verificación, muestra `LoadingScreen`.
- Estado autenticado → pantallas de la app; no autenticado → Login, Registro, Contraseña y Recuperar. El cambio de grupo de pantallas lo decide el estado de auth, no `navigate`.
- `RootStackParams` tipa las rutas.
- Se verifica la integridad de sesión al arrancar si ya estaba autenticado.
- El `ProtectedRoute` del prototipo solo distingue autenticado / no autenticado; el de la app nueva debe sumar roles y funciones como el portal.

## Tema y UI (verificado, `skill-rn-ui.md`, `theme.tsx`, `theme.json`)

Son pistas de estilo (el `skill-rn-ui.md` del prototipo es documentación, pero coincide con el código de `theme.tsx`):

- `useThemeColors()` devuelve `globalColors`, `isDark`, `globalStyles`, tipografía, glass y elevación. `ThemeProvider` elige colores claros u oscuros. Nunca colores hardcodeados.
- Tipografía: `Poppins` para títulos y valores destacados; `opensans-regular` para textos secundarios. Tamaños con `platformFontSizes` (xs a massive), espacios con `spacing`, radios con `borderRadius`, `scale()` para dimensiones fijas, sombras con `platformSpecific.shadow(n)`.
- Estilos con `StyleSheet.create` dentro de `createStyles` memoizado con `useMemo`. Sub-componentes `React.memo` que reciben `globalColors` y `theme` por props.
- Botones y tarjetas con `Pressable` y `android_ripple` (nunca `TouchableOpacity`). Mínimo táctil 44 pt iOS / 48 dp Android.
- Android: no combinar `overflow: hidden` y `elevation` en el mismo View; separar wrapper de sombra y contenedor interno.
- Modales tipo bottom sheet: `Modal` → overlay → `KeyboardAwareScrollView` → contenido con `height: '100%'` y `paddingTop` (nunca `marginTop`) → `ScrollView`. Sin `KeyboardAvoidingView`.
- Header con `useSafeAreaInsets`; no combinar `SafeAreaView` con `paddingTop: top+X`.
- Animaciones de entrada con Reanimated 3. Íconos de UI Kitten (Eva) y, si falta, `react-native-vector-icons`. Gradientes con `react-native-linear-gradient` y colores `gradientStart`/`gradientEnd` del tema.
- Paleta del prototipo (tokens, no valores a copiar a ciegas): `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `text`, `textSecondary`, `textTertiary`, `card`, `border`. Para fondos semánticos translúcidos, el color con sufijo de opacidad.

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

## Falta leer

- Componentes compartidos concretos (`presentation/components`), `hooks` y `domain`, a medida que se necesiten.
- `colors.js`, `typography.ts` y `glass.ts`, `responsive.ts`: valores exactos, al armar el tema de la app.
