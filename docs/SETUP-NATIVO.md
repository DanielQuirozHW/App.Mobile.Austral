# Setup nativo (lo hace Daniel cuando tenga la PC)

El código de este repo está escrito sin las carpetas `android/` e `ios/`. No es un limitante: se generan con la plantilla oficial y después se les aplica la configuración nativa de esta lista.

Nada de esto se ejecutó ni se probó desde acá.

## 1. Generar el proyecto nativo

Comando de la documentación oficial de React Native (recordado de la documentación; verificalo en reactnative.dev si cambió):

```
npx @react-native-community/cli@latest init AustralMobile --version latest
```

Requisitos de la versión 0.88: Node `^22.13.0 || ^24.3.0 || >= 26.0.0` (verificado en el `package.json` de `react-native` 0.88.0 en npm).

## 2. Combinar con este repo

1. Copiar al proyecto generado: `src/`, `index.js`, `App.tsx`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `.env.template`, `.gitignore`, `docs/`, `.claude/`, `CLAUDE.md`, `README.md`.
2. En `package.json`: mantener las devDependencies de la plantilla y agregar las dependencies de este repo.
3. Instalar dependencias y los pods de iOS.
4. Crear `.env` a partir de `.env.template` y completar los valores (nunca se commitea).

## 3. Configuración nativa pendiente

| Tarea | Por qué |
|---|---|
| Registrar las apps iOS y Android en el proyecto Firebase | Login y Storage. Genera `google-services.json` y `GoogleService-Info.plist` (están en `.gitignore`). |
| Plugin de Google Services en Android y configuración de Firebase en iOS | Requisito de React Native Firebase. |
| Habilitar el proveedor Microsoft en Firebase Auth y crear el registro de la app en Microsoft Entra (Client ID y Secret) | Login con cuenta @austral. |
| Huella SHA-1 / SHA-256 de la app en Firebase (Android) y esquema URL personalizado (iOS) | Lo piden las guías de Firebase para el proveedor Microsoft. |
| Fuentes Poppins y Open Sans en `android/app/src/main/assets/fonts` e iOS (`Info.plist` + target) | Tipografía del tema. |
| Plugin de Babel de `react-native-worklets` (último en la lista) | Reanimated 4. |
| Permisos de cámara y galería (`AndroidManifest.xml`, `Info.plist`) | Foto de perfil/portada y adjuntos. |
| Íconos de `@react-native-vector-icons/ionicons` | Configuración de fuentes de íconos del paquete. |
| Keychain: descripción de Face ID en `Info.plist` si se usa biometría | Lo indica el README de react-native-keychain. |
| Reiniciar Metro con `--reset-cache` después de crear o cambiar `.env` | react-native-dotenv inlinea las variables al compilar. |
| Definir la URL de continuación del correo de recuperación de contraseña | En el portal es `{origin}/login`. |

## 4. Qué decide Daniel después de probar

- Si el `uid` que devuelve el login con Microsoft coincide con el de SAML (los documentos de `usuarios` y las fotos están indexados por `uid`).
- Si hace falta restringir el login al dominio de Austral con el parámetro `tenant`.
