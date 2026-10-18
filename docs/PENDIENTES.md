# Pendientes

Se actualiza. Tres tipos: decisiones de Daniel, tareas externas al código y cosas que faltan leer.

## Decisiones de Daniel

- Qué otros módulos entran en el MVP después de Datos personales.
- Fechas: el portal usa `dayjs` y el prototipo `moment`. Se propone en el plan.
- Librerías de UI y de formularios: el prototipo usa UI Kitten (Eva) y React Native Paper. Se propone en el plan.
- Advertencia de cambios sin guardar (en web es `beforeunload`; en mobile corresponde una confirmación al salir). Se propone en el plan.

## Tareas externas al código (las hace Daniel, más adelante)

- Registrar las apps iOS y Android en el proyecto Firebase del portal (necesario para el login y SAML).
- Definir cómo funciona SAML en mobile (en el portal es `signInWithPopup`, propio de web).
- Definir la URL de continuación del correo de recuperación de contraseña (en el portal es `{origin}/login`).
- Cargar los valores reales en un `.env` local (nombres en `.env.template`). Nunca se commitean.
- Archivos de configuración de Firebase para mobile (`google-services.json`, `GoogleService-Info.plist`): están en `.gitignore`.
- Variable del sender id de Firebase: el código del portal lee `..._MASSAGING_SENDER_ID` y su README dice `MESSAGING`. Vale el código.
- Todas las pruebas.

## Falta confirmar en el código del portal

- Foto de portada: `PerfilHeader.tsx` tiene `actualizarFotoPortada`, pero no se confirmó que exista una pantalla que la use ni dónde se muestra `photoPORTADA`. Se lee antes de construir esa parte.
- Ruta de la foto de perfil en Storage: el portal usa `{uid}/foto perfil` (con espacio) y el prototipo `{uid}/foto_perfil`. Vale el portal.
- Tipos de archivo y tamaño que acepta `FileUploaderMultiple` (adjuntos).
- Detalle de campos de `ModalConyuge` (se vuelve a leer al construirlo).
- Componentes de campo del portal (`CustomTextField`, `CustomSearchSelect`, `CustomDateField`): solo se necesita el comportamiento, la UI se hace con los patrones RN.
- API: controllers (`HROneClickController`, `ConsultafetchController`, `V1/*`) y diferencia entre `consultafetch` y `consultafetchs`, si hiciera falta para algún contrato.
- Documentos de contexto por actualizar con lo leído: `portal-auth-y-tenant.md` y `cliente-http-y-endpoints.md` (ver `roles-puesto-y-fotos.md` para lo nuevo).

## Siguiente paso

Plan de construcción (estructura de la app y orden de etapas) para aprobación de Daniel, antes de escribir código.
