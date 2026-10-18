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
- **Fuentes Montserrat** (400, 500, 600, 700; en el portal vienen de Google Fonts vía `next/font`; el repo del portal solo trae los .ttf 300, 700 y Regular), permisos, bloqueo de orientación vertical y plugin de Babel de Reanimated.
- **Imágenes y logos**: los archivos binarios no se pueden subir por el conector. Cuando una pantalla los necesite, Daniel los copia desde `public/images` del portal a `src/assets/images` (ver lista en `SETUP-NATIVO.md`).
- Comprobar si el `uid` del login con Microsoft coincide con el del login SAML.
- Definir la URL de continuación del correo de recuperación de contraseña.
- Todas las pruebas.

## Falta verificar (escrito de memoria o con documentación incompleta)

Estos puntos están ya en el código y no se pudieron confirmar con una fuente. Se contrastan con la documentación oficial antes de dar la etapa por cerrada.

| Qué | Dónde está en el código | Por qué quedó sin verificar |
|---|---|---|
| `KeyboardProvider` y `KeyboardAwareScrollView` exportados por `react-native-keyboard-controller` 1.22.6 | `AppProviders.tsx`, `Screen.tsx` | La página de instalación pidió un permiso que no se respondió a tiempo |
| Uso de `focusManager.setFocused` con `AppState` en React Native | `src/config/api/queryClient.ts` | Misma causa con la página de TanStack Query |
| Importación `{ Ionicons } from '@react-native-vector-icons/ionicons'` en React Native sin Expo (la página leída muestra la ruta `/static` para carga estática y no cubre la configuración nativa) | `AppIcon.tsx` | La página leída no cubre Android/iOS |
| API de `@react-native-async-storage/async-storage` 3.1.1 | Etapa 2 (adaptador de almacenamiento) | La documentación leída no cubre v3 |
| API de `react-native-keychain` 10.0.0 | Etapa 2 | La página leída no lista las firmas |
| Que los archivos de fuente se llamen `Montserrat-Regular`, `-Medium`, `-SemiBold`, `-Bold` (nombre de archivo en Android, nombre PostScript en iOS) | `typography.ts` | Depende de cómo se agreguen las fuentes en el proyecto nativo |
| Versión de TypeScript que trae la plantilla de RN 0.88 y compatibilidad con `@react-native/typescript-config` 0.88.0 | `tsconfig.json` | La plantilla la define al generar el proyecto |
| Los tokens de color "derivado" de `colors.ts` (variantes con transparencia, `overlay`, `inputDisabled`) no existen tal cual en el portal | `colors.ts` | Son una adaptación; se pueden ajustar viendo la app |

## Falta verificar antes de construir lo que depende de ello

| Qué | Cuándo |
|---|---|
| Foto de portada: confirmar en el portal que existe una pantalla que la use y dónde se muestra `photoPORTADA` | Etapa 5 |
| Ruta de la foto de perfil en Storage: el portal usa `{uid}/foto perfil` (con espacio) y el prototipo `{uid}/foto_perfil`. Vale el portal. | Etapa 5 |
| Tipos de archivo y tamaño que acepta `FileUploaderMultiple` | Etapa 6 |
| Campos de `ModalConyuge` | Etapa 6 (Familia) |
| URL y parámetros de `getAdjuntosXFamiliarXEmpleado` y `cargarAdjuntosPorFamiliares` en `useLegajoStore` | Etapa 6 |
| Textos completos de `useAuth.ts` y `authError.ts` | Etapa 3 |
| Componentes de campo del portal (`CustomTextField`, `CustomSearchSelect`, `CustomDateField`): comportamiento y aspecto (alto 36 px en web; en mobile se usa el alto táctil mínimo) | Etapa 6 |
| Estilos del portal de select/autocomplete, diálogos, chips y tablas (`src/@core/theme/overrides/*`) | Cuando se construya cada componente |
| Controllers de la API (`HROneClickController`, `ConsultafetchController`, `V1/*`) y diferencia entre `consultafetch` y `consultafetchs`, si hace falta | Cuando un contrato lo requiera |
| `cliente-http-y-endpoints.md` tiene secciones "No leído" | Etapa 2 |

## Plan de etapas

1. Base del proyecto. (**hecha**, sin probar; tema con los valores del portal)
2. Cliente HTTP, token y endpoints; adaptadores de almacenamiento.
3. Autenticación: Microsoft, email/contraseña, registro, recuperación, validación del empleado, `usuarios` en Firestore, cierre de sesión.
4. Navegación, selección de puesto y guardas por rol.
5. Foto de perfil y de portada.
6. Datos personales (Identidad, Contacto, Domicilio real, Contacto de emergencia, Familia), con confirmación al salir con cambios sin guardar.
7. Funciones de Nombramientos y Promoción.
