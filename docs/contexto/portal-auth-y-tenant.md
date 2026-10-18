# Autenticación y tenant del portal

Todo lo de este documento sale del **código** (no de README). Cada dato indica repo y ruta. Lo que no se leyó todavía está marcado al final.

Repos: `P` = HW-Austral/Portal-Austral-Dev, `A` = HW-Austral/API.Web.Austral.

Puesto, selección de rol, funciones de Nombramientos/Promoción y fotos: ver `roles-puesto-y-fotos.md`.

## Visión general (verificado)

El portal usa **dos capas de autenticación distintas**:

1. **Identidad del usuario**: Firebase Auth (email/password o SAML).
2. **Acceso a la API**: un **usuario de servicio** (email y password salen de variables de entorno). Con él se pide un JWT a la API, y ese JWT va como `Bearer` en todas las llamadas. El token NO es del usuario final.

Fuente: `P:src/context/AuthContext.tsx`, `P:src/stores/useTokenStore.ts`, `P:src/keys.ts`.

## Token de la API (verificado)

- Pedido: `POST {API_URL}api/Usuarios/login` con `{ email, password }` del usuario de servicio. Responde `{ token, expiracion }`. (`P:src/stores/useTokenStore.ts`, `A:Controllers/UsuariosController.cs`)
- El JWT dura **90 minutos** y lleva el claim `email` más los claims del usuario de la API, entre ellos `cliente`. (`A:Controllers/UsuariosController.cs`, método `ConstruirToken`)
- Header en las llamadas: `Authorization: Bearer <token>`.
- El portal guarda en su store el objeto de respuesta completo y usa `token.token` como Bearer. (`P:src/context/AuthContext.tsx`)
- Renovación: el portal **vuelve a pedir el login del usuario de servicio cada 30 minutos** (`setInterval(..., 1800000)`). No usa el endpoint `RenovarToken` para eso. (`P:src/context/AuthContext.tsx`)
- Existe `GET api/Usuarios/RenovarToken` en la API y una acción `refreshTokenAction` en el store del portal, pero en lo leído el refresco periódico usa `loginToken`. (`A:Controllers/UsuariosController.cs`, `P:src/stores/useTokenStore.ts`)
- Single-flight: si ya hay un login en curso se reutiliza la misma promesa. Además, si hubo un login exitoso hace menos de 60 s (`TOKEN_FRESCO_MS = 60000`) y hay token en memoria, no se pide otro. (`P:src/stores/useTokenStore.ts`)
- Si el login devuelve 200 con cuerpo vacío tras los reintentos, **no** se pisa un token válido previo: solo se marca error. (`P:src/stores/useTokenStore.ts`)

## Tenant (verificado)

- La API resuelve el tenant por el claim `cliente` del JWT. (`A:Tenancy/CurrentTenant.cs`)
- `TenantCredentialFilter` corta con **401** ("Cliente no asociado") si el token no trae `cliente`, y con **400** ("Credenciales inexistentes") si no hay credenciales de Dataverse para ese cliente. (`A:Filters/TenantCredentialFilter.cs`)
- El `cliente` es un atributo del usuario de la API (se carga al registrarlo, `UsuariosController.Registrar`). Por lo tanto **el tenant queda fijado por el usuario de servicio** que se use. El portal no tiene un selector de tenant en runtime.
- Consecuencia para la app: el tenant no se elige en la app; lo define el usuario de servicio configurado en el entorno.

## Pantalla de login (verificado, `P:src/app/(blank)/login/page.tsx`)

- Campos: `email` (obligatorio y con formato válido: "El campo de correo electrónico es requerido", "Ingresa una dirección de correo electrónico válida") y `password` (mínimo 5: "La contraseña debe tener al menos 5 caracteres").
- "Recordarme" (`rememberMe`) viene tildado por defecto.
- Envío: `auth.login({ email, password, recordar })`. Si falla, el mensaje amigable (`getFriendlyErrorMessage`) se muestra como error del campo `email`.
- Botón de SSO: `auth.loginSAML()`. Enlace "¿Olvidaste la contraseña?".
- Analítica: evento `screen_view` con `firebase_screen: 'Iniciosesion'` y `firebase_screen_class: 'Login'` (Firebase Analytics; en mobile se define si se migra).
- Guards: `GuestGuard` (rutas públicas: ir a inicio si ya hay sesión) y `AuthGuard`/`ProtectedRoute` (sin usuario → login; sin permiso → 401). Rutas públicas: `/login`, `/olvidaste-contrasena`, `/registro`, `/404`, `/login-portal`, `/401`.

## Login con email y password (verificado, `P:src/context/AuthContext.tsx`, `handleLogin`)

1. `signInWithEmailAndPassword(auth, email, password)` (Firebase).
2. Si el usuario marcó "recordar", el portal guarda `userData` **cifrado** en localStorage (AES de CryptoJS con una clave de entorno, `P:src/@core/utils/data-encrypt.ts`). En mobile corresponde almacenamiento seguro del sistema (Keychain/Keystore), como hace el prototipo; así no hace falta replicar esa clave de cifrado.
3. `POST api/Usuarios/login` con el usuario de servicio, con reintentos. Si no llega token: error transitorio, **no** se desloguea.
4. `POST api/consultafetchs` con FetchXML sobre `new_empleado`: empleado con `new_correoelectronicoportal = email` y (`new_tieneusuarioportaldocente = 1` o `new_tieneusuarioportalcodocente = 1`). Atributos pedidos: `new_name`, `new_empleadoid`, `new_correoelectronicoportal`, `new_tieneusuarioportaldocente`, `new_tieneusuarioportalcodocente`, `new_roldocente`, `new_posicin`.
5. Si la respuesta es un array **vacío** → `signOut` y error "No existe una cuenta con ese correo en nuestro sistema o no se encuentra habilitada". Si la respuesta **no es array** → error transitorio, no se desloguea.
6. Se calcula el `puesto`: ambos flags → `["docente", "codocente"]`; uno solo → `"docente"` o `"codocente"`; ninguno → `""`.
7. Se calculan las funciones de Nombramientos y Promoción consultando todas las posiciones activas del empleado (`new_posicion` por `new_empleadoactual`) con `resolverFuncionNombramientos` y `resolverFuncionPromocion` (reglas en `roles-puesto-y-fotos.md`).
8. Se busca el documento del usuario en Firestore, colección `usuarios`, con `where("uid", "==", uid)`. Si existe: `updateDoc` con `puesto`, funciones y `fullname` (el nombre sale del BO, no de Firestore) y se arma el usuario de sesión con `empleadoid`, `usuarioPortalRh`, `photoURL`, `photoPORTADA` que vienen **del documento de Firestore**.
9. Si el documento no existe, en este camino **no hay rama else**: no se crea nada. (El camino SAML sí lo crea.)
10. Si hay más de un rol → pantalla de selección de puesto (`/seleccionar-puesto`); si no, a `/`.

## Login SAML (verificado, `handleLoginSAML`)

- `signInWithPopup(auth, providerSAML)`, con `providerSAML = new SAMLAuthProvider('saml.oauth')`. (`P:src/configs/firebaseConfig.ts`)
- Después: login del usuario de servicio, consulta del empleado por `new_correoelectronicoportal = user.email` (con el mismo filtro docente/codocente), y calcula puesto y funciones igual que arriba.
- Usa `doc(firestore, "usuarios", user.uid)`: el **ID del documento es el uid**. Si existe lo actualiza con `updateDoc`; si no, lo crea con `setDoc`. Esto difiere del camino email/password y del registro, que buscan por el campo `uid` y crean con `addDoc` (ID automático). Es una inconsistencia del portal; la app debe contemplar ambas formas de documento.
- Errores manejados (`handleError`): `auth/account-exists-with-different-credential`, `auth/popup-closed-by-user` y `auth/cancelled-popup-request` (no se muestra nada), `auth/operation-not-allowed` (el SSO no está disponible en ese entorno) y un mensaje genérico para el resto.
- **Mobile:** `signInWithPopup` es de web. La forma de hacer SAML en mobile y el registro de las apps iOS/Android en Firebase **no se resuelven con el código del portal**: es configuración externa (ver `docs/PENDIENTES.md`). El código se deja preparado y sin probar.

## Registro (verificado, `handleRegister` y `P:src/app/(blank)/registro/page.tsx`)

1. Con el token del usuario de servicio, `POST api/consultafetch` (singular) buscando `new_empleado` por `new_correoelectronicoportal = email` (atributos `new_name`, `new_correoelectronicoportal`, `new_empleadoid`, `new_puesto`, `ownerid`).
2. Si no hay resultados → error "No existe una cuenta con ese correo en nuestro sistema".
3. Si hay, `createUserWithEmailAndPassword` y `addDoc` en `usuarios` con `correoElectronico`, `empleadoid`, `fullname`, `ownerid`, `uid`, `usuarioPortalRh`, `puesto` (id del puesto o vacío), `photoURL: ""` y `photoPORTADA: ""`.
4. Validación de la contraseña en el formulario: mínimo 8, una minúscula, una mayúscula, un dígito, un carácter no alfanumérico (`\W`), máximo 15; el campo de repetir debe coincidir. Los errores de Firebase (`auth/email-already-in-use`, etc.) se traducen con el mapa de `authError.ts`.

## Recuperar contraseña (verificado, `P:src/app/(blank)/olvidaste-contrasena/page.tsx`)

- `sendPasswordResetEmail(auth, correo, actionCodeSettings)` con el correo normalizado (`trim` y minúsculas). La URL de continuación es `{origin}/login`. En mobile no hay `origin`: la URL de continuación es una configuración externa pendiente (se deja como variable vacía).
- Mensaje de éxito (el mismo exista o no la cuenta): "Si el correo corresponde a una cuenta con contraseña, te enviamos el enlace de recuperación. Revisá también la carpeta de correo no deseado. Si iniciás sesión con tu usuario Austral (SSO), no tenés contraseña para recuperar."

## Sesión persistente y revalidación (verificado)

- `onAuthStateChanged`: si hay usuario Firebase, lee el documento `usuarios` por `uid`, arma el usuario de sesión, pide el token de la API y arranca el timer de 30 minutos. Si no hay usuario, limpia sesión y token.
- Revalidación en segundo plano (`revalidarPuestoEnBackground`): vuelve a consultar el empleado en el BO por correo y corrige en la sesión y en Firestore `puesto`, funciones, `fullname`, `empleadoid` y `usuarioPortalRh` si cambiaron. Motivo (comentario del código): el GUID del empleado puede cambiar si el CRM lo recrea, y el documento de Firestore queda desactualizado. Si falla el CRM, se usa lo guardado.

## Cierre de sesión (verificado)

- `signOut(auth)`, limpia el usuario y borra `userData` y `selectedRole` del almacenamiento local, y navega a `/login`.

## Firestore y Storage (verificado, `P:firestore.rules`)

Las reglas permiten a cualquier usuario autenticado leer y escribir. Es configuración del portal: la app solo la usa.

## Mensajes de error transitorio (verificado)

- Si el backend responde 200 con cuerpo vacío tras reintentar, el portal muestra "No pudimos validar tu sesión en este momento. Por favor, intentá nuevamente en unos segundos." y **no** desloguea a un usuario válido.
- Los textos de los errores de Firebase salen de `P:src/configs/authError.ts` (mapas completos en español). Se copian de ahí al construir, no de esta nota.

## Variables de entorno del portal (verificado en código)

Solo nombres. `P:src/keys.ts` y `P:src/configs/firebaseConfig.ts`:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_CORREO` y `NEXT_PUBLIC_CORREO_CLAVE` (usuario de servicio)
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `..._AUTH_DOMAIN`, `..._PROJECT_ID`, `..._STORAGE_BUCKET`, `..._APP_ID`
- Para el sender id, el **código** lee `NEXT_PUBLIC_FIREBASE_MASSAGING_SENDER_ID` (con "MASSAGING"), mientras que el README del portal lo documenta como `MESSAGING`. Discrepancia: manda el código.
- `NEXT_PUBLIC_ENCRYPT_SECRET` (clave del cifrado de "recordarme"): no se replica; en mobile se usa almacenamiento seguro.
- Hay otras claves de funciones que no entran en el alcance actual (mapas, reCAPTCHA, flags de módulos, etc.).

## No leído todavía

- `P:src/hooks/useAuth.ts` (solo se confirmó que expone `login`, `loginSAML` y compañía a las pantallas).
- Textos completos de `authError.ts` y `getFriendlyErrorMessage`: se leen al construir.
- Pantallas `login-portal`, `401` y `404` del portal (UI y textos).
