# Stack definitivo

Aprobado por Daniel el 2026-10-18. Versiones verificadas en la web (registro de npm, 2026-10-18), no en los repos de referencia. Criterio de elección: mérito técnico para esta app, no "lo que usa el portal" ni "lo que usa el prototipo".

Columna "Prototipo": **Sigue** = igual que `gmhwapp/Protoype-RN`; **Cambia** = distinto, con el motivo.

## Base

| Área | Elección | Versión verificada | Prototipo |
|---|---|---|---|
| Plataforma | React Native, última estable, proyecto nativo (CLI), SIN Expo ni otro framework | 0.88.0 (`latest` de npm; blog de RN: lanzada con React 19.3) | **Cambia** versión (prototipo: 0.74.3). Sin framework: sigue. |
| React | react | 19.3.0 (peer exacto de RN 0.88: `^19.3.0`) | **Cambia** (prototipo: 18.2.0) |
| Lenguaje | TypeScript, `@react-native/typescript-config` | 0.88.0 | Sigue (TS) |
| Navegación | `@react-navigation/native` + `native-stack`, `react-native-screens`, `react-native-safe-area-context` | 7.5.1 / 7.21.0 / 4.30.0 / 5.10.1 | Sigue react-navigation. **Cambia** el stack: `native-stack` (nativo) en lugar de `stack` (JS). |
| Estado propio | zustand | 5.0.15 | Sigue |
| Datos del servidor | `@tanstack/react-query` | 5.104.3 | Sigue (está en su package.json) |
| Formularios | react-hook-form + `@hookform/resolvers` + yup | 7.90.0 / 5.9.2 / 1.7.1 | Sigue |
| HTTP | axios | 1.20.0 | Sigue |
| Fechas | date-fns | 4.4.0 | **Cambia** (prototipo: moment, que su propio sitio declara "legacy project in maintenance mode") |
| UI | StyleSheet de React Native + componentes propios + tema del prototipo | — | **Cambia** (prototipo: UI Kitten/Eva + React Native Paper) |
| Íconos | `@react-native-vector-icons/ionicons` (paquete por familia) | 13.1.3 | **Cambia** (el paquete único `react-native-vector-icons` figura como deprecado en npm) |
| Teclado | `react-native-keyboard-controller` | 1.22.6 | **Cambia** (decisión de bajo riesgo; reemplaza al scroll con teclado de la skill de UI) |
| Animaciones | `react-native-reanimated` + `react-native-worklets` | 4.7.1 / 0.13.0 (peer: RN 0.86–0.88) | Sigue Reanimated; versión nueva (prototipo: 3.x) |
| Fecha nativa (selector) | `@react-native-community/datetimepicker` | 9.2.1 | Nuevo (el prototipo no tiene selector de fecha nativo) |

## Datos locales y archivos

| Área | Elección | Versión verificada | Prototipo |
|---|---|---|---|
| Almacenamiento seguro | react-native-keychain | 10.0.0 | Sigue |
| Almacenamiento | `@react-native-async-storage/async-storage` | 3.1.1 | Sigue (versión nueva; API de v3 sin verificar, ver PENDIENTES) |
| Elegir imágenes | react-native-image-picker | 8.2.1 | Sigue |
| Elegir documentos (PDF) | `@react-native-documents/picker` | 12.0.2 (RN >= 0.79) | Nuevo |
| Ver documentos | `@react-native-documents/viewer` | 4.0.2 (RN >= 0.79) | **Cambia** (prototipo: react-native-file-viewer, última versión 2.1.5 con marca interna de diciembre de 2021) |
| Archivos / descarga | react-native-blob-util | 0.25.1 | **Cambia** (prototipo: react-native-fs, última versión 2.20.0 con marca interna de mayo de 2022) |
| Variables de entorno | react-native-dotenv, leídas como `process.env.X` | 5.0.0 | Sigue |

Las dos fechas de arriba son inferidas de un campo interno del registro de npm, no de una fecha de publicación explícita. Daniel había pedido mantener `react-native-fs` y `react-native-file-viewer`; se cambian porque la verificación mostró que están sin publicar hace años. Es una desviación consciente y fácil de revertir (ver DECISIONES.md, decisión 20).

## Firebase

| Área | Elección | Versión verificada | Prototipo |
|---|---|---|---|
| Firebase | React Native Firebase: `@react-native-firebase/app`, `auth`, `firestore`, `storage` (todos en la misma versión) | 26.4.0 (`auth` y `storage` piden `app` exacta 26.4.0; el tag `latest` de `firestore` figura en 26.0.0, pero existe 26.4.0 y es la que pide `app`) | **Cambia** (prototipo: SDK web de Firebase corriendo en RN) |

Motivo: el login principal es con cuenta Microsoft. La documentación de React Native Firebase (rnfirebase.io/auth/social-auth) describe el login con `OAuthProvider('microsoft.com')` y `signInWithRedirect(getAuth(), provider)` con el flujo nativo del SDK, y desaconseja obtener el token con otra librería. La configuración de Firebase viene de los archivos nativos (`google-services.json` y `GoogleService-Info.plist`), no de variables de entorno.

## Lo que NO se usa

Expo, UI Kitten, React Native Paper, moment, dayjs, react-native-fs, react-native-file-viewer, `react-native-vector-icons` (paquete único), SDK web de Firebase, Redux.

## devDependencies

Las que genera la plantilla oficial de React Native 0.88 al crear el proyecto (Babel 7, `@react-native/babel-preset`, `@react-native/metro-config`, TypeScript, etc.). Cuando Daniel copie este código al proyecto generado, **las devDependencies de la plantilla mandan**. El `package.json` de este repo las lista solo como referencia.
