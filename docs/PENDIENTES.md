# Pendientes

Se actualiza. Tres tipos: decisiones de Daniel, tareas externas al código y cosas que faltan leer.

## Decisiones de Daniel

- Qué otros módulos entran en el MVP después de Datos personales.
- **Seguridad del usuario de servicio**: el portal incluye sus credenciales en el bundle web (`NEXT_PUBLIC_*`). Si la app replica el esquema, quedan dentro del APK/IPA. Decisión del equipo.
- Foto de perfil y de portada (forman parte del `AuthContext` del portal): confirmar si entran con el login.
- Funciones de Nombramientos y Promoción: el portal las calcula en el login y las guarda en la sesión. Confirmar si se migran con el login o junto con esos módulos.
- Pantalla de selección de puesto cuando el usuario es docente y codocente: se migra (está en el login); falta leer cómo la resuelve el portal.
- Fechas: el portal usa `dayjs` y el prototipo `moment`. Se define en el plan.
- Librerías de UI y de formularios para la app (el prototipo usa UI Kitten y React Native Paper). Se define en el plan.
- Cómo se resuelve la advertencia de cambios sin guardar (en web es `beforeunload`; en mobile corresponde una confirmación al salir).

## Tareas externas al código (las hace Daniel)

- Registrar las apps iOS y Android en el proyecto Firebase del portal. Necesario para el login y para SAML.
- Definir y configurar cómo funciona SAML en mobile (en el portal es `signInWithPopup`, propio de web).
- Definir la URL de continuación del correo de recuperación de contraseña (en el portal es `{origin}/login`).
- Cargar los valores reales en un `.env` local (nombres en `.env.template`). Nunca se commitean.
- Archivos de configuración de Firebase para mobile (`google-services.json`, `GoogleService-Info.plist`): están en `.gitignore`.
- Verificar la discrepancia del nombre de la variable del sender id de Firebase: el código del portal lee `..._MASSAGING_SENDER_ID`, y su README dice `MESSAGING`.
- Todas las pruebas.

## Falta leer antes de construir

Ver el final de cada documento de `docs/contexto/`. Lo principal:

- Portal, auth: `roleContext.tsx`, `ProtectedRoute`, `/seleccionar-puesto`, pantallas de login/registro/recuperación, `useAuth.ts`, `authError.ts`, `data-encrypt`, `firestore.rules`, y los resolvedores de funciones de Nombramientos y Promoción.
- Portal, Datos personales: `tipoContratacion.ts`, modales de cónyuge e hijos, adjuntos, columnas, hooks de catálogos, `LegajoPageHeader`, `UserProfileBanner`.
- API: controllers (`HROneClickController`, `ConsultafetchController`, `V1/*`), `Program.cs`, y diferencia entre `consultafetch` y `consultafetchs`.
- Prototipo: `skill-rn-ui.md`, `theme.json`, archivos de tema, componentes compartidos, navegadores y `firebase-uses.ts`.

## Siguiente paso

Plan de construcción (estructura de la app y orden de etapas) para aprobación de Daniel, antes de escribir código.
