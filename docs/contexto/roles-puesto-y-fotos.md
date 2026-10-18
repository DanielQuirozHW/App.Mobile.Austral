# Puesto, funciones y fotos de perfil

`P` = HW-Austral/Portal-Austral-Dev. Todo verificado leyendo el código.

## Puesto y selección de rol

- `user.puesto` puede ser un array (`["docente","codocente"]`), un string o vacío (`P:src/context/roleContext.tsx`).
- El rol elegido se guarda (`selectedRole`). Al iniciar: si el guardado está entre los roles del usuario se usa; si no, el primero, y se guarda.
- `P:src/app/(blank)/seleccionar-puesto/page.tsx`: tarjetas de rol. `docente` → "Docente" ("Acceso al portal docente y plan de trabajo"); `codocente` → "Staff" ("Acceso al portal de gestión del desempeño"). Si hay un solo rol, se elige solo y se entra a inicio. Título "Seleccioná tu puesto"; subtítulo "Este usuario tiene múltiples puestos asignados. Seleccioná con cuál querés ingresar."
- Rutas: `ProtectedRoute` acepta `allowedRoles`, `allowedFunciones` y `allowedFuncionesPromocion`. Sin usuario → login; sin permiso → pantalla 401. Datos personales exige `docente` o `codocente`.

## Funciones de Nombramientos

`P:src/nombramientos/business/roles.ts`, enum `RolNombramientos` en `P:src/nombramientos/domain/enums.ts`: `SA`, `AdSA`, `VRAA`, `AdVRAA`, `docente`.

- Se resuelve **por cada posición activa** del empleado (`new_posicion` filtrado por `new_empleadoactual`), y se acumulan: `user.funcionNombramientos` es un array (puede tener 0, 1 o varias).
- `normalizarTexto(s)`: minúsculas, sin diacríticos (NFD), cualquier carácter no `a-z0-9` pasa a espacio, trim.
- `resolverFuncionNombramientos(nombrePosicion)`, en este orden:
  1. vacío → `null`.
  2. contiene `asistente` → `null`.
  3. contiene `adjunt` y (token `sa` o `secretari`+`academic`) → `AdSA`.
  4. contiene `adjunt` y (token `vraa` o `vicerrector`+`academic`) → `AdVRAA`.
  5. contiene `vicerrector` y `academic` → `VRAA`.
  6. contiene `secretari` y `academic` → `SA`.
  7. si no → `null`.
- No se usa `new_unidadacademicaquecategoriza` (suele venir vacío). La unidad académica la resuelve el backend.
- El portal tiene un override de desarrollo por `localStorage` (`dev:funcionNombramientos`). **No se migra**: es de web y de desarrollo.

## Funciones de Promoción

`P:src/promocion/business/roles.ts`, enum `RolPromocion`: `SA`, `AdSA`, `VRAA`, `AdVRAA`, `ReferenteMathu`, `docente`.

- Por **nombre exacto** de posición normalizado (no por palabras sueltas): `VICERRECTOR DE ASUNTOS ACADÉMICOS` → VRAA; `ADJUNTO VRAA` → AdVRAA; `SECRETARIO ACADEMICO` → SA; `ADJUNTO SA` → AdSA; `REFERENTE MATHU` → ReferenteMathu. La lista es la misma que `PosicionesPromocion` de la API.
- Funciones efectivas: si el usuario tiene `funcionPromocion` propia, se usa; si no, se toman de `funcionNombramientos` las que existan en `RolPromocion`.
- Helpers: `esSAoAdSA`, `esVRAAoAdVRAA`, `esReferenteMathu`. El override `dev:funcionPromocion` tampoco se migra.

## Foto de perfil y portada

- Imágenes en Firebase Storage: perfil `{uid}/foto perfil`, portada `{uid}/foto portada`. Las URLs se guardan en el documento de `usuarios` (`photoURL`, `photoPORTADA`).
- `actualizarFotoPerfil(imgEditada: Blob)` (`P:src/context/AuthContext.tsx`): aviso "Cargando..."; `uploadBytes` a `{uid}/foto perfil`; `getDownloadURL`; busca el documento de `usuarios` con `where('uid','==',uid)`; `updateDoc(photoURL)`; actualiza `user.photoURL`; "Tu foto se ha cargado correctamente.". Errores: "Usuario no encontrado.", "UID de usuario no definido.", "Error al actualizar la foto de perfil". `actualizarFotoPortada` es igual con `{uid}/foto portada` y `photoPORTADA`.
- Cabecera del legajo (`P:src/app/(dashboard)/legajo/_components/UserProfileBanner.tsx`, **leído**): tarjeta con avatar (72 px; foto o iniciales con `getInitials(user.fullname)`), botón de cámara de 24 px que abre el selector de archivos (acepta png, jpg, jpeg; si no: "El formato de la foto debe ser png/jpg/jpeg"), nombre completo, puesto (`DOCENTE`, `STAFF`, `DOCENTE · STAFF`) y la sede (`localidadLabel`). **No muestra foto de portada.** `LegajoPageHeader.tsx` es solo un breadcrumb "Legajo > {página}".
- La carpeta `_components/component` del portal tiene también un `PerfilHeader.tsx`; la página de Datos personales importa `UserProfileBanner`, no `PerfilHeader`. No se leyó `PerfilHeader` ni se confirmó si alguna pantalla lo usa, por eso la portada no se migra (ver PENDIENTES).
- Reglas de Storage/Firestore (`P:firestore.rules`): cualquier usuario autenticado lee y escribe todo. Es del portal; la app no lo toca.
- El prototipo (`config/adapters/firebase-uses.ts`) ya tiene un patrón para esto: `uploadBytes` + `getDownloadURL` + `updateDoc` del documento `usuarios` por `uid`, y `updateProfile` aislado en un try/catch. **Se toma el patrón, no la ruta**: el prototipo usa `foto_perfil` y el portal `foto perfil`.

## En la app

`infrastructure/auth/fotosStorage.ts` (Storage), `infrastructure/archivos/seleccionFoto.ts` (galería o cámara, valida png/jpg/jpeg), `application/auth/fotoPerfilService.ts` (flujo del portal) y `presentation/components/legajo/PerfilLegajoBanner.tsx` (cabecera).
