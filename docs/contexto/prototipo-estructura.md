# Estructura y convenciones del prototipo

Repo de referencia: `gmhwapp/Protoype-RN` (solo lectura). **De aquí se toma estructura y forma de programar, no contenido ni lógica.** La lógica de negocio la define el portal.

## Estructura real (verificado listando el repo)

Raíz: `index.js`, `app.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `jest.config.js`, `react-native.config.js`, `theme.json`, `firebase-config.js`, `.env.template`, `android/`, `ios/`, `assets/`, `src/`.

`src/`:

| Carpeta | Qué contiene |
|---|---|
| `PeopleOneClick.tsx` | Componente raíz de la app (providers y navegación) |
| `config/api` | Instancia de axios (`dynamicsApi.ts`) |
| `config/adapters` | Adaptadores: almacenamiento, Firebase, imágenes |
| `domain` | Capa de dominio |
| `infrastructure/interfaces` | Interfaces (por ejemplo el tipo de estado de auth) |
| `services` | Servicios por dominio (`empleado.service.ts`, `licencias.service.ts`, etc.) con `index.ts` |
| `presentation/screens` | Pantallas por área (`auth`, `datos-perfil`, `home`, `licencias`, `notificaciones`, etc.) |
| `presentation/navigation` | `BottomNavigator`, `StackNavigator`, `TopTabsNavigator`, `SideScreenNavigations`, `ProtectedRoute` |
| `presentation/store` | Stores de zustand por área (`auth`, `perfil`, `dataVarios`, `licencias`, ...) |
| `presentation/providers` | `AuthProvider`, `ThemeProvider` |
| `presentation/theme` | `colors.js`, `glass.ts`, `theme.tsx`, `typography.ts` |
| `presentation/components`, `hooks`, `utils` | Componentes, hooks y utilidades compartidas |
| `types`, `utils` | Tipos y utilidades globales |

## Stack (verificado en `package.json`)

- React Native 0.74.3 y React 18.2.0, TypeScript 5.0.4. Proyecto creado con `@react-native-community/cli` (indicado en su README, y confirmado por las carpetas `android/` e `ios/`).
- Navegación: `@react-navigation` (native, stack, bottom-tabs, drawer, material-top-tabs).
- Estado: `zustand` (con `persist` y AsyncStorage). Datos: `@tanstack/react-query`.
- Formularios: `react-hook-form` con `yup` y `@hookform/resolvers`.
- UI: `@ui-kitten/components` (tema Eva) y `react-native-paper`.
- HTTP: `axios`. Backend de identidad: `firebase`.
- Almacenamiento seguro: `react-native-keychain`. Local: `@react-native-async-storage/async-storage`.
- Otros: `react-native-dotenv` (devDependency), `react-native-image-picker`, `react-native-file-viewer`, `react-native-fs`, `moment`, `react-native-calendars`.

Las versiones y librerías de la app nueva se deciden en el plan; este listado es la referencia, no una obligación. El portal usa `dayjs` y el prototipo `moment`: queda por decidir.

## Armado de la app (verificado, `src/PeopleOneClick.tsx`)

Orden de providers, de afuera hacia adentro: `GestureHandlerRootView` → `ThemeModeProvider` → `ThemeProvider` → `ToastProvider` → `ApplicationProvider` (UI Kitten, tema Eva más `theme.json`) → `PaperProvider` → `NavigationContainer` (con tema derivado de los colores) → `AuthProvider` → navegador principal.

## Patrones de código (verificado)

- **Store de auth** con zustand y `persist` sobre AsyncStorage; `partialize` guarda solo lo no sensible (`rememberMe`, `savedEmail`). Las contraseñas se guardan en Keychain, no en AsyncStorage. Estado con `status` y `isHydrated`, y rehidratación con `onRehydrateStorage`.
- **Capa de servicios**: funciones `fetchX` / `updateX` por dominio que llaman a una instancia de axios y devuelven los datos, tipadas con los tipos del store.
- **Cliente HTTP**: instancia de axios con interceptor de request (agrega el Bearer del store) y de response (ante 401 reintenta una vez tras refrescar el token).
- **Pantallas** agrupadas por área bajo `presentation/screens`, con modales como archivos aparte (`ModalCuentaBancaria.tsx`).

## Errores heredados a NO arrastrar (verificado)

- El typo "Protoype" en el nombre del repo y el nombre de paquete genérico `OneClickApp`.
- El README genérico de React Native.
- Strings y nombres con typos: el estado `'cheking'` del auth y la ruta `infrastructure/interfaces/auth.satus`.
- La URL base del backend escrita directo en el código de `dynamicsApi.ts`: la app nueva la toma de una variable de entorno vacía.
- La lógica de auth del prototipo (apunta a otro backend y a otro esquema): la app nueva sigue la del portal.

## No leído todavía

- `CLAUDE.md`, `TASKS.md` y `skill-rn-ui.md` del prototipo (documentación: son pistas, pero `skill-rn-ui.md` puede traer convenciones de UI que conviene revisar antes de construir pantallas).
- `theme.json`, `colors.js`, `typography.ts` y `glass.ts` (valores de tema).
- Los componentes compartidos (`presentation/components`), `hooks`, `utils` y `domain`.
- `StackNavigator`, `BottomNavigator` y `ProtectedRoute` en detalle.
- `config/adapters/firebase-uses.ts` (cómo el prototipo usa Firebase).
