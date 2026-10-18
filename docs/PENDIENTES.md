# Pendientes

Se actualiza. Tres tipos: decisiones de Daniel, tareas externas al código y cosas que faltan leer o verificar.

## Decisiones de Daniel

- Qué otros módulos entran en el MVP después de Datos personales.
- Si revierte alguno de los reemplazos de la decisión 20 (fs, file-viewer, íconos, native-stack, teclado).

## Tareas externas al código (las hace Daniel, más adelante)

La lista completa y ordenada está en [`SETUP-NATIVO.md`](SETUP-NATIVO.md). Resumen:

- Generar `android/` e `ios/` con el comando oficial y combinar con este repo.
- Registrar las apps iOS/Android en Firebase; habilitar el proveedor Microsoft; registro de la app en Microsoft Entra.
- Cargar los valores reales en un `.env` local (nombres en `.env.template`). Nunca se commitean.
- Fuentes, permisos y plugin de Babel de Reanimated.
- Comprobar si el `uid` del login con Microsoft coincide con el del login SAML.
- Definir la URL de continuación del correo de recuperación de contraseña.
- Todas las pruebas.

## Falta verificar antes de construir lo que depende de ello

| Qué | Cuándo |
|---|---|
| API de `@react-native-async-storage/async-storage` v3 (el sitio de documentación leído no cubre v3) | Antes del adaptador de almacenamiento (etapa 2) |
| API de `react-native-keychain` v10 (la página leída no lista las firmas) | Antes del adaptador de almacenamiento seguro (etapa 2) |
| Revalidar contra `@react-native/typescript-config` 0.88.0 la versión de TypeScript que trae la plantilla | Al combinar con el proyecto generado |
| Foto de portada: confirmar en el portal que existe una pantalla que la use y dónde se muestra `photoPORTADA` | Etapa 5 |
| Ruta de la foto de perfil en Storage: el portal usa `{uid}/foto perfil` (con espacio) y el prototipo `{uid}/foto_perfil`. Vale el portal. | Etapa 5 |
| Tipos de archivo y tamaño que acepta `FileUploaderMultiple` | Etapa 6 |
| Campos de `ModalConyuge` | Etapa 6 (Familia) |
| URL y parámetros de `getAdjuntosXFamiliarXEmpleado` y `cargarAdjuntosPorFamiliares` en `useLegajoStore` | Etapa 6 |
| Textos completos de `useAuth.ts` y `authError.ts` | Etapa 3 |
| Componentes de campo del portal (`CustomTextField`, `CustomSearchSelect`, `CustomDateField`): solo el comportamiento | Etapa 6 |
| Controllers de la API (`HROneClickController`, `ConsultafetchController`, `V1/*`) y diferencia entre `consultafetch` y `consultafetchs`, si hace falta | Cuando un contrato lo requiera |
| Archivos de tema del prototipo no leídos en detalle (`colors.js`, `typography.ts`, `glass.ts`, `responsive.ts`, `IosStyle.ts`) | Etapa 1 (en curso) |
| Documentos de contexto con secciones "No leído": `cliente-http-y-endpoints.md` | Etapa 2 |

## Plan de etapas

1. Base del proyecto: configuración, entorno, tema, tipografía, responsive, componentes base, providers. (**en curso**)
2. Cliente HTTP, token y endpoints; adaptadores de almacenamiento.
3. Autenticación: Microsoft, email/contraseña, registro, recuperación, validación del empleado, `usuarios` en Firestore, cierre de sesión.
4. Navegación, selección de puesto y guardas por rol.
5. Foto de perfil y de portada.
6. Datos personales (Identidad, Contacto, Domicilio real, Contacto de emergencia, Familia), con confirmación al salir con cambios sin guardar.
7. Funciones de Nombramientos y Promoción.
