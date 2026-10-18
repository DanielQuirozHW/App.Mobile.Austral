---
name: auth-portal
description: Usar al construir o revisar login, registro, SAML, recuperación de contraseña, token de la API, sesión, puesto, funciones o tenant. Resume cómo lo hace el portal.
---

# Autenticación y tenant: cómo lo hace el portal

Detalle verificado con rutas de archivo: `docs/contexto/portal-auth-y-tenant.md` y `docs/contexto/roles-puesto-y-fotos.md`. Leerlos antes de escribir código de auth. Recordar la regla fundamental: **sin probar y con credenciales vacías**.

## Resumen

- Dos capas: identidad del usuario con **Firebase Auth** (email/password o SAML) y acceso a la API con un **usuario de servicio** (email y password por variables de entorno, vacías en el repo).
- Token de la API: `POST api/Usuarios/login` con el usuario de servicio. El JWT dura 90 minutos y va como `Authorization: Bearer <token>`. El portal lo vuelve a pedir cada 30 minutos.
- Tenant: lo define el claim `cliente` del JWT del usuario de servicio. No hay selector de tenant en la app.
- Después del login de Firebase se consulta el empleado en la API por `new_correoelectronicoportal`, filtrando docente/codocente. Array vacío = cuenta inexistente (se cierra sesión). Cuerpo no-array = fallo transitorio (NO se cierra sesión).
- Puesto: ambos flags → `["docente","codocente"]` (pide elegir puesto); uno → ese; ninguno → vacío. El rol elegido se persiste.
- Funciones de Nombramientos y Promoción: se resuelven por nombre de cada posición activa del empleado (reglas exactas en `roles-puesto-y-fotos.md`). Los overrides de desarrollo por `localStorage` del portal no se migran.
- El perfil se cachea en Firestore (`usuarios`) y se revalida en segundo plano contra la API.
- SAML: `signInWithPopup` es de web. Para mobile requiere configuración externa en Firebase (apps iOS/Android). Se construye igual, preparado y sin probar, y queda anotado en `docs/PENDIENTES.md`.
- "Recordarme": en el portal se guarda cifrado en localStorage; en mobile va a almacenamiento seguro del sistema.

## Cuidados

- Documentos de `usuarios` con dos formas: ID automático (email y registro) o ID igual al `uid` (SAML). La app debe contemplar ambas.
- El `empleadoid` de la sesión sale del documento de Firestore y se corrige después con la revalidación.
- No se guardan credenciales en el código ni en archivos de configuración.
- Los textos de error salen de `authError.ts` del portal.
