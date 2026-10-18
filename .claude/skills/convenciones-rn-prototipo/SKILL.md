---
name: convenciones-rn-prototipo
description: Usar al crear carpetas, pantallas, navegación, stores, servicios o tema de la app. Resume la estructura y forma de programar del prototipo React Native.
---

# Convenciones de React Native (del prototipo)

Detalle verificado: `docs/contexto/prototipo-estructura.md`. Del prototipo se toma **estructura y estilo, no contenido ni lógica**. No se clona, no se hace fork, no se copia historial.

## Estructura de `src/` a seguir

`config/api`, `config/adapters`, `domain`, `infrastructure/interfaces`, `services`, `presentation/{screens,navigation,store,providers,theme,components,hooks,utils}`, `types`, `utils`.

## Patrones

- Stores con `zustand`; la sesión persiste con `persist` y AsyncStorage guardando solo lo no sensible. Lo sensible va en almacenamiento seguro (Keychain).
- Servicios por dominio con funciones `fetchX` / `updateX` tipadas.
- Cliente HTTP con interceptor de request (Bearer) y de response.
- Formularios con `react-hook-form` y `yup`, validaciones idénticas a las del portal.
- Pantallas agrupadas por área; modales en archivos aparte.
- Navegación con `react-navigation` (stack, tabs, drawer).

## Errores heredados que NO se arrastran

El typo "Protoype", el nombre `OneClickApp`, el README genérico, el estado `'cheking'`, la ruta `auth.satus`, la URL del backend escrita en el código y la lógica de auth del prototipo.

## Pendiente de leer del prototipo

`skill-rn-ui.md`, `theme.json`, archivos de tema y componentes compartidos (ver `docs/PENDIENTES.md`). Leerlos antes de construir pantallas.
