---
name: auth-portal
description: Usar al construir o revisar login, registro, SAML, recuperación de contraseña, token de la API, sesión o tenant. Resume cómo lo hace el portal.
---

# Autenticación y tenant: cómo lo hace el portal

Detalle verificado con rutas de archivo: `docs/contexto/portal-auth-y-tenant.md`. Leerlo antes de escribir código de auth. Recordar la regla fundamental: **sin probar y con credenciales vacías**.

## Resumen

- Dos capas: identidad del usuario con **Firebase Auth** (email/password o SAML) y acceso a la API con un **usuario de servicio** (email y password por variables de entorno, vacías en el repo).
- Token de la API: `POST api/Usuarios/login` con el usuario de servicio. El JWT dura 90 minutos y va como `Authorization: Bearer <token>`. El portal lo vuelve a pedir cada 30 minutos.
- Tenant: lo define el claim `cliente` del JWT del usuario de servicio. No hay selector de tenant en la app.
- Después del login de Firebase se consulta el empleado en la API por `new_correoelectronicoportal`, filtrando docente/codocente. Array vacío = cuenta inexistente (se cierra sesión). Cuerpo no-array = fallo transitorio (NO se cierra sesión).
- Puesto: ambos flags → `["docente","codocente"]` (pide elegir puesto); uno → ese; ninguno → vacío.
- El perfil se cachea en Firestore (`usuarios`) y se revalida en segundo plano contra la API.
- SAML: `signInWithPopup` es de web. Para mobile requiere configuración externa en Firebase (apps iOS/Android). Se construye igual, y se anota en `docs/PENDIENTES.md`.

## Cuidados

- Documentos de `usuarios` con dos formas: ID automático (email y registro) o ID igual al `uid` (SAML). La app debe contemplar ambas.
- El `empleadoid` de la sesión sale del documento de Firestore y se corrige después con la revalidación.
- No se guardan credenciales en el código ni en archivos de configuración.
- Aviso de seguridad pendiente de decisión del equipo: el esquema del portal pone las credenciales del usuario de servicio en el cliente.
