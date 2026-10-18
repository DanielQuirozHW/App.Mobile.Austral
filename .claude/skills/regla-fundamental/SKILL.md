---
name: regla-fundamental
description: Usar SIEMPRE antes de cualquier tarea en este repo. Recuerda que el proyecto es solo construcción, sin probar nada y sin usar credenciales.
---

# Regla fundamental: construir sin probar y sin credenciales

Esta regla está por encima de cualquier otra y no tiene excepciones.

## Qué NO se hace

- No se ejecuta ni se prueba nada: no se corre la app, no se llama a la API, no se hace login, no se instalan dependencias, no se corren build, lint ni tests.
- No se usa ninguna credencial, nunca. Ni para probar, ni "solo una vez", ni aunque aparezca en algún repo.
- No se escribe ningún valor real (clave, token, usuario, password, URL privada) en ningún archivo.

## Qué se hace

- Donde el código necesite una credencial, clave, URL privada o secreto, se deja el lugar VACÍO: variable de entorno sin valor en `.env.template`, o un campo en blanco con un comentario que diga qué va ahí.
- La verificación de cada etapa se hace **leyendo** el código del portal y comparando, no ejecutando.
- Si algo parece requerir una prueba o una credencial para avanzar, se frena y se avisa a Daniel. Las pruebas las hace él cuando el proyecto esté avanzado.

Ver `CLAUDE.md` (sección "Lo que NO se debe hacer") y `docs/PENDIENTES.md`.
