---
name: cliente-http-api
description: Usar al construir la capa de llamadas a la API (cliente HTTP, reintentos, endpoints, catálogos). Resume cómo lo hace el portal.
---

# Cliente HTTP y endpoints

Detalle verificado: `docs/contexto/cliente-http-y-endpoints.md`. Recordar: **no se llama a la API ni se prueba nada**; solo se escribe el código.

## Reglas

- Se hace lo que hace el portal en cada pantalla. No se elige "v1" o "legacy" por criterio propio.
- Header en todas las llamadas: `Authorization: Bearer <token>`. La URL base viene de una variable de entorno vacía en el repo.
- Cliente con reintentos: timeout de 30 s, 2 reintentos por defecto, backoff exponencial desde 300 ms, y reintento de **200 con cuerpo vacío** (`""`, `null`, `undefined`). Un `[]`, un `{}` o un 204 son válidos y no se reintentan.
- Reintentos solo en lecturas y logins. **Nunca en escrituras** (evita doble aplicación).
- Un cuerpo no-array tras reintentar es fallo transitorio, no "sin datos": no se pisa lo que ya había.
- Lecturas legacy: `POST api/consultafetch` o `consultafetchs` con `{ entidad, fetch }` (FetchXML). Copiar la variante que use cada pantalla.
- Catálogos: `GET api/v1/catalogos/{clave}[?parentId=]` devuelve `[{ id, nombre }]`. Localidades siguen por legacy y se filtran por provincia en el cliente.

## Antes de agregar un endpoint

Verificar en el código del portal que lo usa la pantalla en cuestión y, si hace falta, el contrato en la API. Si no está en el código, no se inventa: se pregunta.
