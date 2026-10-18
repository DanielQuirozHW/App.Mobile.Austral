---
name: repos-solo-lectura
description: Usar cada vez que haya que leer el Portal, la API o el prototipo, o escribir en el repo de la app. Define qué repos son de solo lectura y cómo se accede.
---

# Repos de solo lectura y repo de escritura

| Repo | Permiso |
|---|---|
| `HW-Austral/Portal-Austral-Dev` | SOLO LECTURA |
| `HW-Austral/API.Web.Austral` | SOLO LECTURA |
| `gmhwapp/Protoype-RN` | SOLO LECTURA |
| `DanielQuirozHW/App.Mobile.Austral` | LECTURA Y ESCRITURA |

## Acceso

- Los 3 repos de solo lectura se acceden ÚNICAMENTE por el conector MCP de GitHub, con herramientas de lectura (`get_file_contents`, `list_commits`, `list_branches`, `search_code`, etc.).
- No se clonan, no se descargan por otra vía, no se agregan a la sesión con `add_repo` y no se usa `git` sobre ellos.
- NUNCA se modifican: sin commits, ramas, PRs, issues, comentarios, forks ni archivos. Aunque haya herramientas de escritura disponibles.

## Escritura

- Todo lo que se escribe va solo en `DanielQuirozHW/App.Mobile.Austral`, por el conector MCP.
- **Antes de cada escritura**, verificar que `owner` sea `DanielQuirozHW` y `repo` sea `App.Mobile.Austral`. Ante la duda, no escribir y preguntar.
- La API no se modifica ni se propone modificarla. Si algo parece requerir un cambio en la API, se avisa y se busca cómo resolverlo del lado de la app.

## Jerarquía de fuentes

1. Código del portal (lógica, flujos, auth, tenant, endpoints, payloads, validaciones, reglas de negocio).
2. Código de la API (contratos, cuando el portal no alcanza).
3. Código del prototipo (solo estructura y forma de programar RN).
4. README y documentación de los repos: solo pistas. Si no coinciden con el código, vale el código y se avisa la discrepancia.

## Lectura de archivos grandes

Si una lectura devuelve un archivo enorme, extraer solo la parte necesaria (por ejemplo con `jq` sobre el resultado guardado) y decir qué parte se leyó y cuál no.
