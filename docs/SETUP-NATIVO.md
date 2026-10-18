# Setup nativo (lo hace Daniel cuando tenga la PC)

El código de este repo está escrito sin las carpetas `android/` e `ios/`. No es un limitante: se generan con la plantilla oficial y después se les aplica la configuración nativa de esta lista.

Nada de esto se ejecutó ni se probó desde acá.

## 1. Generar el proyecto nativo

Comando de la documentación oficial de React Native (recordado de la documentación; verificalo en reactnative.dev si cambió):

```
npx @react-native-community/cli@latest init AustralMobile --version latest
```

Requisitos de la versión 0.88: Node `^22.13.0 || ^24.3.0 || >= 26.0.0` (verificado en el `package.json` de `react-native` 0.88.0 en npm).

El nombre `AustralMobile` tiene que coincidir con el `name` de `app.json`.

## 2. Combinar con este repo

1. Copiar al proyecto generado: `src/`, `index.js`, `App.tsx`, `app.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `.env.template`, `.gitignore`, `docs/`, `.claude/`, `CLAUDE.md`, `README.md`.
2. En `package.json`: mantener las devDependencies de la plantilla y agregar las dependencies de este repo (y `react-native-dotenv` en devDependencies).
3. Instalar dependencias y los pods de iOS.
4. Crear `.env` a partir de `.env.template` y completar los valores (nunca se commitea).

## 3. Configuración nativa pendiente

| Tarea | Por qué |
|---|---|
| Registrar las apps iOS y Android en el proyecto Firebase | Login y Storage. Genera `google-services.json` y `GoogleService-Info.plist` (están en `.gitignore`). |
| Plugin de Google Services en Android y configuración de Firebase en iOS | Requisito de React Native Firebase. |
| Habilitar el proveedor Microsoft en Firebase Auth y crear el registro de la app en Microsoft Entra (Client ID y Secret) | Login con cuenta @austral. |
| Huella SHA-1 / SHA-256 de la app en Firebase (Android) y esquema URL personalizado (iOS) | Lo piden las guías de Firebase para el proveedor Microsoft. |
| **Fuentes Montserrat** 400, 500, 600 y 700 (Google Fonts) en `android/app/src/main/assets/fonts` e iOS (`Info.plist` + target). Nombres: `Montserrat-Regular`, `Montserrat-Medium`, `Montserrat-SemiBold`, `Montserrat-Bold` | Tipografía del portal (`src/styles/fonts.ts`). |
| Plugin de Babel de `react-native-worklets` (último en la lista) | Reanimated 4. Ya está en `babel.config.js`. |
| Bloquear la orientación en vertical (Android: `screenOrientation` en el manifest; iOS: orientaciones permitidas) | `responsive.ts` calcula la escala una sola vez al iniciar. |
| Permiso de **cámara** (`android.permission.CAMERA` en `AndroidManifest.xml`; `NSCameraUsageDescription` en `Info.plist`) y de **galería** (`NSPhotoLibraryUsageDescription` en iOS) | Foto de perfil/portada y adjuntos de familiares (`launchCamera`, `launchImageLibrary`). |
| Configuración de `@react-native-documents/picker` y `@react-native-documents/viewer` según su README (en Android el visor puede necesitar el `FileProvider` y el identificador de la aplicación) | Elegir y abrir adjuntos (PDF, imágenes, DOC, DOCX). |
| Configuración de `react-native-blob-util` según su README | Escribir en caché los adjuntos que llegan en base64 antes de abrirlos. |
| Configuración de `@react-native-community/datetimepicker` según su README | Selector de fecha nativo. |
| Fuentes de íconos de `@react-native-vector-icons/ionicons` | Configuración del paquete (ver su README). |
| Keychain: descripción de Face ID en `Info.plist` si se usa biometría | Lo indica el README de react-native-keychain. |
| Reiniciar Metro con `--reset-cache` después de crear o cambiar `.env` | react-native-dotenv inlinea las variables al compilar. |

## 4. Imágenes y logos del portal

Los archivos binarios no se pueden subir por el conector. Copiar desde `public/images` del portal (`HW-Austral/Portal-Austral-Dev`) a `src/assets/images`. Candidatos que existen en el portal: `Logonavbar.png`, `logo_color.png`, `logo_blanco.png`, `logo-horizontal-color.png`, `logo-horizontal-blanco.png`, `favicon.ico`, `profileNull.webp`, `user.webp`. En el portal el fondo de la pantalla de ingreso (`fondo_login.jpg`) se oculta en pantallas chicas; la app no lo usa.

**Logo de las pantallas de ingreso**: la pantalla de ingreso del portal usa `logo-horizontal-color.png` (modo claro) y `logo-horizontal-blanco.png` (modo oscuro). Después de copiar esos dos archivos a `src/assets/images`, editar `src/assets/images/logos.ts` y reemplazar los dos `null` por:

```ts
export const logoHorizontalColor = require('./logo-horizontal-color.png');
export const logoHorizontalBlanco = require('./logo-horizontal-blanco.png');
```

Mientras valgan `null`, `LogoAustral` muestra "Universidad Austral" en texto. No se dejaron los `require` en el código porque, con los archivos ausentes, Metro no compila.

## 5. Qué decide Daniel después de probar

- Si el `uid` que devuelve el login con Microsoft coincide con el de SAML (los documentos de `usuarios` y las fotos están indexados por `uid`).
- Si hace falta restringir el login al dominio de Austral con la variable `MICROSOFT_TENANT`.
- Las cuentas con usuario y contraseña se crean en Firebase Auth y necesitan su documento en la colección `usuarios` (decisión 36).
