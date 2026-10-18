---
name: convenciones-rn-prototipo
description: Usar al crear carpetas, pantallas, navegación, stores, servicios o tema de la app. Resume la estructura y forma de programar del prototipo React Native y en qué difiere la app nueva.
---

# Convenciones de React Native (del prototipo)

Detalle verificado: `docs/contexto/prototipo-estructura.md`. Del prototipo se toma **estructura y estilo, no contenido ni lógica**. No se clona, no se hace fork, no se copia historial. Las librerías de la app nueva están en `docs/STACK.md` y mandan sobre las del prototipo.

## Estructura de `src/` a seguir

`config/api`, `config/adapters`, `domain`, `infrastructure/interfaces`, `services`, `presentation/{screens,navigation,store,providers,theme,components,hooks,utils}`, `types`, `utils`.

## Patrones

- Stores con `zustand`; la sesión persiste con `persist` y AsyncStorage guardando solo lo no sensible. Lo sensible va en almacenamiento seguro (Keychain).
- Datos del servidor con TanStack Query. Los reintentos viven en axios (reglas del portal), no en Query.
- Servicios por dominio con funciones `fetchX` / `updateX` tipadas.
- Cliente HTTP con interceptor de request (Bearer) y de response.
- Formularios con `react-hook-form` y `yup`, validaciones idénticas a las del portal, y confirmación al salir con cambios sin guardar.
- Pantallas agrupadas por área; modales en archivos aparte.
- Navegación con `react-navigation` (`native-stack`; tabs o drawer solo si un módulo confirmado los necesita).

## Errores heredados que NO se arrastran

El typo "Protoype", el nombre `OneClickApp`, el README genérico, el estado `'cheking'`, la ruta `auth.satus`, la URL del backend escrita en el código, la lógica de auth del prototipo, `includeFontPadding` pasado como prop de `Text` (es un estilo) y el acoplamiento del tema con el tema de navegación.

## Para el estilo de la UI

Ver la skill `ui-componentes-propios`.
