# Verificaciones con documentación oficial

Registro de lo que se contrastó contra la documentación de cada librería, sin ejecutar nada. Cada punto dice qué se confirmó, qué sigue sin confirmar y la fuente. Se actualiza al verificar más puntos; lo que sigue abierto está en [`PENDIENTES.md`](PENDIENTES.md).

Límite de este método: se leyó la documentación publicada (en varios casos la rama principal del repositorio, no la etiqueta exacta de la versión que fija `package.json`). Si una prueba real contradice algo de acá, vale la prueba.

## 2026-10-26

### Confirmado

| Qué | Resultado | Fuente |
|---|---|---|
| `@react-native-community/datetimepicker`: `DateTimePickerAndroid.open(params)` con `value`, `mode`, `onValueChange(event, fecha)` y `onDismiss()`; componente con `onValueChange`; `onChange` figura como deprecado | Coincide con `DateField.tsx` (Android imperativo; iOS en rueda con `onValueChange`) | [README del repositorio](https://github.com/react-native-datetimepicker/datetimepicker/blob/master/README.md) |
| `react-native-image-picker`: `launchCamera` / `launchImageLibrary` con `mediaType`, `selectionLimit` (0 = sin límite en iOS 14+ y Android 13+) y `saveToPhotos`; respuesta con `didCancel`, `errorCode`, `errorMessage` y `assets[]` con `uri`, `fileName`, `type`, `fileSize` | Coincide con `seleccionArchivos.ts` y `seleccionFoto.ts` (la fuente es la documentación de la 8.2.0; el proyecto fija la 8.2.1) | [Documentación 8.2.0 (Tessl)](https://tessl.io/registry/tessl/npm-react-native-image-picker/8.2.0/files) |
| `@react-native-documents/picker`: `pick()` devuelve un array; `types.pdf` existe; existen `errorCodes` con `OPERATION_CANCELED` y el helper `isErrorWithCode` | Coincide con `elegirDocumentos()` | [API del picker](https://react-native-documents.github.io/docs/doc-picker-api), [Manejo de errores](https://react-native-documents.github.io/docs/sponsor-only/errors) |
| `@react-native-documents/viewer`: `viewDocument` acepta `uri` (o `bookmark`), devuelve una promesa que resuelve en `null` cuando el sistema abrió la vista previa y rechaza si falla; Android usa `ACTION_VIEW` e iOS QuickLook | Coincide con el uso en `visorArchivos.ts` | [Documentación del picker (índice)](https://docsearch.algolia.com/mcp/docs/repo/react-native-documents/document-picker) |
| `react-native-keyboard-controller`: `KeyboardAwareScrollView` hereda las props de `ScrollView` (de ahí `onScroll` y `scrollEventThrottle`); la documentación pasa un `ref` al componente | Alcanza para `ScrollFormulario.tsx` | [Documentación de KeyboardAwareScrollView](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-aware-scroll-view) |
| `react-native-dotenv`: el plugin reemplaza las referencias a variables antes de ejecutar; el ejemplo de la documentación usa `process.env.API_URL`; recomienda `api.cache(false)` y reiniciar Metro con `--reset-cache` | Coincide con `babel.config.js` y `env.ts` | [README de la 3.4.11 (jsDelivr)](https://cdn.jsdelivr.net/npm/react-native-dotenv@3.4.11/README.md) |
| `axios` + `FormData` en React Native con `Content-Type: multipart/form-data` escrito a mano | Patrón habitual de React Native: el sistema completa el boundary al enviar. Se deja como está; si falla una carga, es lo primero a mirar | Conocimiento general; sin fuente leída en esta sesión |

### Sigue sin confirmar

| Qué | Motivo |
|---|---|
| `KeyboardProvider` exportado por `react-native-keyboard-controller` 1.22.6 | La página leída no lo cubre |
| Que `KeyboardAwareScrollView` reenvíe el `ref` con `scrollTo` | La documentación solo muestra un ejemplo con `ref`; no lo describe |
| `types.images`, `types.doc` y `types.docx` de `@react-native-documents/picker` | La documentación leída solo muestra `types.pdf` |
| `viewDocument({ uri, mimeType, grantPermissions })`: los nombres `mimeType` y `grantPermissions` | La documentación leída no los detalla; falta el README del paquete del visor |
| `fs.dirs.CacheDir` y `fs.writeFile(ruta, base64, 'base64')` de `react-native-blob-util` 0.25.1 | La documentación leída no cubre esas funciones. Aviso de esa documentación: pasar contenido grande en base64 por el puente es costoso; si hay problemas con adjuntos grandes, evaluar otra vía |
| `react-native-dotenv` 5.0.0 (la versión que fija el proyecto) | Se leyó la documentación de la 3.4.11; la forma de uso es la misma en lo que se usa acá |
| Exportaciones modulares de React Native Firebase (auth, firestore, storage) y `signInWithRedirect` | Las búsquedas devolvieron la documentación web de Firebase, no la de React Native Firebase |
| `@react-native-async-storage/async-storage` 3.1.1, `react-native-keychain` 10.0.0, Ionicons (nombres de íconos) | No se consultaron |

### Revisión estática hecha

- Configuración: `package.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `app.json`, `index.js`, `App.tsx`, `.env.template` y `.gitignore` están coherentes entre sí. Las devDependencies de `package.json` son solo de referencia: manda la plantilla de React Native (ver `STACK.md`).
- Plan de Trabajo: `ptaService.ts`, `ptaApi.ts` y `endpoints.ts` se leyeron completos. Los imports, las firmas (`leerCatalogoFetchXml` con filtro extra, `leerRegistrosDeEmpleado`, `escribirRegistro`, `subirArchivos`) y los endpoints que usa el servicio existen y coinciden. No se encontraron errores.
- Sin revisar todavía: el resto de `src/` archivo por archivo. Queda como tarea abierta en [`ESTADO.md`](ESTADO.md).
