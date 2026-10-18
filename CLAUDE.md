# CLAUDE.md — App Mobile Austral

App mobile (React Native) para el cliente Austral. Hace lo mismo que el Portal Austral y consume exactamente la misma API. Es un proyecto de prueba/test.

Este archivo se escribe con lo verificado en el código de los repos de referencia, no copiado de sus README ni de sus documentos. El detalle verificado está en `docs/contexto/`.

---

## REGLA FUNDAMENTAL: construir sin probar y sin credenciales

Esta regla está por encima de cualquier otra y no tiene excepciones.

- Este proyecto es SOLO construcción. No se prueba absolutamente nada: no se ejecuta la app, no se llama a la API, no se hace login, no se instalan dependencias, no se corren build, lint ni tests. Las pruebas las hace Daniel, cuando el proyecto esté avanzado.
- No se usa ninguna credencial, nunca. Ni para probar, ni "solo una vez", ni aunque aparezca en algún repo.
- Donde el código necesite una credencial, clave, URL privada o secreto, se deja el lugar VACÍO: variable de entorno sin valor en `.env.template`, o campo en blanco con un comentario que diga qué va ahí.
- Si algo parece requerir una prueba o una credencial para avanzar, se frena y se avisa. No se improvisa.

---

## Lo que NO se debe hacer

1. No ejecutar ni probar nada (ver regla fundamental).
2. No usar ni escribir credenciales, claves, tokens, URLs privadas ni secretos, en ningún archivo.
3. No modificar nunca los 3 repos de solo lectura: ni commits, ni ramas, ni PRs, ni issues, ni comentarios, ni forks, ni archivos.
4. No clonar ni descargar los repos de referencia. No agregarlos a la sesión con `add_repo`. No usar `git` sobre ellos. Se leen solo por el conector MCP de GitHub, con herramientas de lectura.
5. No escribir en ningún repo que no sea `DanielQuirozHW/App.Mobile.Austral`. Antes de cada escritura se verifica owner/repo. Ante la duda, no se escribe y se pregunta.
6. No modificar la API ni proponer modificarla. Si algo parece requerir un cambio en la API, se avisa y se busca cómo resolverlo del lado de la app.
7. No elegir por criterio propio "la API v1" o "la legacy". Se hace lo que hace el portal.
8. No tomar como fuente la documentación de los otros repos (README, ARCHITECTURE, CLAUDE.md, etc.): puede estar desactualizada o mal. Vale el código. Si no coinciden, se avisa la discrepancia.
9. No clonar, hacer fork ni copiar contenido o historial del prototipo. Del prototipo se toma estructura y estilo, no contenido ni lógica.
10. No arrastrar errores heredados del prototipo (por ejemplo el typo "Protoype" o su README genérico de React Native).
11. No construir módulos que no estén confirmados, ni agregar funcionalidades extra.
12. No inventar endpoints, payloads ni reglas de negocio: si no están en el código, se pregunta.
13. No presentar como verificado algo que se supuso.

---

## Repositorios y permisos

| Repo | Rol | Permiso |
|---|---|---|
| HW-Austral/Portal-Austral-Dev | Fuente de verdad de la lógica (Next.js) | SOLO LECTURA |
| HW-Austral/API.Web.Austral | API que se consume (.NET) | SOLO LECTURA |
| gmhwapp/Protoype-RN | Referencia de estructura y forma de programar RN | SOLO LECTURA |
| DanielQuirozHW/App.Mobile.Austral | Este repo | LECTURA Y ESCRITURA |

Todo se accede por el conector MCP de GitHub. La escritura va solo en este repo.

## Jerarquía de fuentes de verdad

1. Código del portal: manda en lógica, flujos, autenticación, multi-tenant, endpoints, payloads, validaciones y reglas de negocio.
2. Código de la API: confirma contratos (rutas, parámetros, respuestas) cuando el portal no alcanza.
3. Código del prototipo: solo para estructura de carpetas, convenciones, navegación, tema y forma de programar una app RN.
4. README, ARCHITECTURE, CLAUDE.md y demás documentación de los repos: pistas, nunca fuente.

## Cómo se construye

- Todo desde cero, archivo por archivo.
- Credenciales y secretos: nunca se commitean. Se usa `.env.template` con nombres de variables sin valores, y `.env` queda en `.gitignore`. No hay valores reales en ningún archivo.
- Los README, este archivo y las skills se escriben con lo verificado en el código.

## Orden de trabajo

1. Entender: leer el código de los 3 repos.
2. Base de proyecto: este archivo, skills y documentos de contexto (hecho en la primera tanda, se sigue completando).
3. Plan: estructura de la app y orden de construcción, para aprobación antes de escribir código.
4. Construcción por etapas: infraestructura (login, token, tenant, capa de llamadas a la API) y luego módulos, uno por vez. Sin probar nada.
5. Verificación: cada etapa se contrasta contra el código del portal, leyéndolo. No se verifica ejecutando.

Antes de escribir código de una etapa se resume en pocas líneas qué se va a hacer y se espera conformidad si hay una decisión de diseño abierta.

## Alcance

- Autenticación: se migra TODO lo que hace el portal (email/password con Firebase, SAML, registro, recuperación de contraseña, validación del empleado contra la API, selección de puesto, renovación del token, cierre de sesión). Sin probar y con credenciales vacías.
- Primer módulo: Datos personales, migrado completo (Identidad, Contacto, Domicilio real, Familia con cónyuge, hijos/as y su documentación, y Contacto de emergencia).
- Los demás módulos del MVP están por definir. No se asume ni se construye ninguno hasta que se confirme.

## Cómo comunicar

- Español rioplatense, directo y breve.
- Todo lo que se entrega se entrega COMPLETO, nunca fragmentos.
- Separar siempre lo verificado en el código de lo supuesto o inferido.
- Citar el archivo del repo de donde sale cada dato importante (repo + ruta).
- Si algo no se puede resolver con el código (por ejemplo, configuración externa como registrar las apps iOS/Android en Firebase), decirlo explícitamente en vez de improvisar.
- Ante ambigüedad real, preguntar. Ante algo de bajo riesgo, decidir y avisar.

## Mapa de este repo

| Ruta | Qué hay |
|---|---|
| `docs/contexto/portal-auth-y-tenant.md` | Cómo autentica el portal y cómo se resuelve el tenant (verificado) |
| `docs/contexto/cliente-http-y-endpoints.md` | Cliente HTTP con reintentos y endpoints que usa el portal (verificado) |
| `docs/contexto/datos-personales.md` | Contrato y reglas del módulo Datos personales (verificado, con lo que falta leer) |
| `docs/contexto/prototipo-estructura.md` | Estructura y convenciones del prototipo RN (verificado) |
| `docs/DECISIONES.md` | Decisiones tomadas |
| `docs/PENDIENTES.md` | Pendientes, tareas externas y lo que falta leer |
| `.claude/skills/` | Skills de trabajo para este repo |
| `.env.template` | Nombres de variables de entorno, sin valores |

## Estado actual

Base del proyecto creada. Todavía no hay código de la app. El plan de construcción está pendiente de aprobación.
