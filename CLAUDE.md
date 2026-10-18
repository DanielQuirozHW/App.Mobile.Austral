# CLAUDE.md — App Mobile Austral

App mobile (React Native) para el cliente Austral. Es la versión mobile del Portal Austral (Portal Universidad Austral): hace lo mismo, se ve como el portal y consume exactamente la misma API. Es un proyecto de prueba/test.

Este archivo se escribe con lo verificado en el código de los repos de referencia, no copiado de sus README ni de sus documentos. El detalle verificado está en `docs/contexto/`.

## Cómo retomar el trabajo (leer en este orden)

1. Este archivo.
2. `docs/DECISIONES.md` — todo lo que decidió Daniel.
3. `docs/STACK.md` — librerías y versiones aprobadas.
4. `docs/ERRORES.md` — errores ya cometidos y las reglas que salen de ellos.
5. `docs/PENDIENTES.md` — lo que falta, lo que hace Daniel y lo que hay que verificar.
6. `docs/contexto/` — lo entendido del código del portal, la API y el prototipo.

Todo lo decidido vive en el repo, no en ningún chat.

---

## REGLA FUNDAMENTAL: construir sin probar y sin credenciales

Esta regla está por encima de cualquier otra y no tiene excepciones.

- Este proyecto es SOLO construcción. No se prueba absolutamente nada: no se ejecuta la app, no se llama a la API, no se hace login, no se instalan dependencias, no se corren build, lint ni tests. Las pruebas las hace Daniel, cuando el proyecto esté avanzado.
- No se usa ninguna credencial, nunca. Ni para probar, ni "solo una vez", ni aunque aparezca en algún repo.
- Donde el código necesite una credencial, clave, URL privada o secreto, se deja el lugar VACÍO: variable de entorno sin valor en `.env.template`, o campo en blanco con un comentario que diga qué va ahí.
- Si algo parece requerir una prueba o una credencial para avanzar, se frena y se avisa. No se improvisa.
- "No se puede probar" nunca es la razón principal de una recomendación técnica. Las pruebas las hace Daniel.

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
9. No clonar, hacer fork ni copiar contenido o historial del prototipo. Del prototipo se toma estructura y forma de programar, no contenido, lógica ni aspecto.
10. No arrastrar errores heredados del prototipo (por ejemplo el typo "Protoype" o su README genérico de React Native).
11. No construir módulos que no estén confirmados, ni agregar funcionalidades extra.
12. No inventar endpoints, payloads ni reglas de negocio: si no están en el código, se pregunta.
13. No presentar como verificado algo que se supuso.
14. No preguntar por la publicación de las apps ni por el registro en Firebase: se deja todo preparado y Daniel lo hace cuando decida.
15. No plantear el tema de seguridad de las credenciales del usuario de servicio: es del portal.
16. No agregar ni cambiar una dependencia sin verificar su versión en la web (registro de npm o sitio oficial) y registrarla en `docs/STACK.md`. Las versiones no se miran en los repos de referencia.
17. No usar Expo, UI Kitten, React Native Paper, moment, dayjs ni el SDK web de Firebase (ver `docs/STACK.md`).
18. No elegir una librería "porque la usa el portal" o "porque la usa el prototipo". Se elige por mérito técnico, con fuente.
19. No dejar de implementar la confirmación al salir con cambios sin guardar en los formularios (el portal la tiene).
20. Responder solo lo que Daniel preguntó, sin repetir tablas ni recapitular. Ver `docs/ERRORES.md`.
21. **La app es del portal de Austral, no de Humanware.** Colores, tipografía (Montserrat), radios, botones, campos, textos y logos salen del portal (`src/@core/theme`, páginas de `src/app`), nunca del prototipo. Ver decisión 26 y `docs/ERRORES.md` #11.

---

## Repositorios y permisos

| Repo | Rol | Permiso |
|---|---|---|
| HW-Austral/Portal-Austral-Dev | Fuente de verdad de la lógica y del aspecto (Next.js) | SOLO LECTURA |
| HW-Austral/API.Web.Austral | API que se consume (.NET) | SOLO LECTURA |
| gmhwapp/Protoype-RN | Referencia de estructura y forma de programar | SOLO LECTURA |
| DanielQuirozHW/App.Mobile.Austral | Este repo | LECTURA Y ESCRITURA |

Todo se accede por el conector MCP de GitHub. La escritura va solo en este repo.

## Jerarquía de fuentes de verdad

1. Código del portal: manda en lógica, flujos, autenticación, multi-tenant, endpoints, payloads, validaciones, reglas de negocio y aspecto visual.
2. Código de la API: confirma contratos (rutas, parámetros, respuestas) cuando el portal no alcanza.
3. Código del prototipo: solo para estructura de carpetas, convenciones, navegación y forma de programar una app RN. Donde el prototipo no tiene patrón, se usa uno propio y se documenta.
4. README, ARCHITECTURE, CLAUDE.md y demás documentación de los repos: pistas, nunca fuente.

## Stack (resumen; el detalle y las versiones están en `docs/STACK.md`)

React Native 0.88 (última estable), proyecto nativo sin Expo, TypeScript. react-navigation (native-stack), zustand, TanStack Query, react-hook-form + yup, axios, date-fns, StyleSheet con componentes propios y el aspecto del portal, Reanimated, React Native Firebase (login con Microsoft), Keychain, AsyncStorage, image-picker, documents picker/viewer, blob-util, react-native-dotenv.

## Cómo se construye

- Todo desde cero, archivo por archivo, por el conector MCP.
- Credenciales y secretos: nunca se commitean. Se usa `.env.template` con nombres de variables sin valores, y `.env` queda en `.gitignore`. No hay valores reales en ningún archivo.
- Los README, este archivo y las skills se escriben con lo verificado en el código.
- Las carpetas `android/` e `ios/` no existen en este repo: las genera Daniel con el comando oficial cuando tenga la PC (ver `docs/SETUP-NATIVO.md`).
- `push_files` reemplaza el archivo completo: para cambiar un archivo se reenvía entero.
- Cada commit termina con las líneas de atribución que indique la sesión.

## Orden de trabajo

1. Base del proyecto (hecha): configuración, entorno, tema del portal, responsive, componentes base, providers.
2. Cliente HTTP, token y endpoints; adaptadores de almacenamiento.
3. Autenticación (Microsoft, email/contraseña, registro, recuperación, validación del empleado, `usuarios` en Firestore, cierre de sesión).
4. Navegación, selección de puesto y guardas por rol.
5. Foto de perfil y de portada.
6. Datos personales completo, con confirmación al salir con cambios sin guardar.
7. Funciones de Nombramientos y Promoción.

Daniel autorizó avanzar sin pedir aprobación por etapa. Se frena solo ante una decisión que no se pueda deshacer o una duda real. Cada etapa se contrasta contra el código del portal, leyéndolo; no se verifica ejecutando.

## Alcance

- Autenticación: se migra TODO lo que hace el portal. El login principal es con cuenta Microsoft @austral, por el proveedor Microsoft de Firebase (decisión 18); email y contraseña quedan para algunos usuarios. Sin probar y con credenciales vacías.
- Foto de perfil y de portada: se migran en la medida en que el portal las tiene.
- Funciones de Nombramientos y Promoción: se migra su resolución en la sesión, igual que el portal. Es de lo último que se construye.
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
| `docs/DECISIONES.md` | Decisiones tomadas |
| `docs/STACK.md` | Stack definitivo con versiones verificadas |
| `docs/ERRORES.md` | Errores cometidos y reglas para no repetirlos |
| `docs/PENDIENTES.md` | Pendientes, tareas externas y lo que falta verificar |
| `docs/SETUP-NATIVO.md` | Lo que hace Daniel con la PC: proyecto nativo y configuración |
| `docs/contexto/portal-auth-y-tenant.md` | Cómo autentica el portal y cómo se resuelve el tenant (verificado) |
| `docs/contexto/roles-puesto-y-fotos.md` | Puesto, selección de rol, funciones de Nombramientos/Promoción y fotos (verificado) |
| `docs/contexto/cliente-http-y-endpoints.md` | Cliente HTTP con reintentos y endpoints que usa el portal (verificado) |
| `docs/contexto/datos-personales.md` | Contrato y reglas del módulo Datos personales, incluida Familia (verificado) |
| `docs/contexto/prototipo-estructura.md` | Estructura y convenciones del prototipo RN (verificado; el aspecto NO se toma de ahí) |
| `.claude/skills/` | Skills de trabajo para este repo |
| `src/config/env.ts` | Variables de entorno (sin valores) |
| `src/config/api/` | `apiClient.ts` (axios con reintentos, port del portal), `tokenStore.ts` (token del usuario de servicio), `queryClient.ts` |
| `src/domain/roles/` | Roles y funciones de Nombramientos/Promoción (port de las reglas del portal) |
| `src/domain/auth/` | Tipos de sesión y textos de error (`authError.ts`) |
| `src/infrastructure/auth/` | Consultas de empleado al BO (`empleadoApi.ts`) y colección `usuarios` de Firestore |
| `src/infrastructure/storage/almacenamiento.ts` | AsyncStorage (rol elegido) |
| `src/application/auth/authService.ts` | Login Microsoft y email, registro, recuperación, logout, escucha de sesión y revalidación |
| `src/presentation/stores/authStore.ts` | Estado de la sesión (user, loading, cerrandoSesion) |
| `src/presentation/theme` | Colores, tipografía y proveedor de tema (valores del portal) |
| `src/presentation/utils/responsive.ts` | Escala, espacios, radios, tamaños de fuente |
| `src/presentation/components` | Componentes base: `AppText`, `AppButton`, `AppTextField`, `AppIcon`, `Screen`, `LoadingScreen` |
| `src/presentation/providers/AppProviders.tsx` | Providers de la app |
| `.env.template` | Nombres de variables de entorno, sin valores |

## Estado actual

Etapa 1 (base) escrita. Etapa 2 parcial: cliente HTTP y token escritos; faltan el módulo de endpoints y los adaptadores restantes. Etapa 3 parte 1 escrita (servicio de autenticación, roles, errores, store de sesión); faltan las pantallas de ingreso, registro y recuperación y conectar `escucharSesion()` en `AppProviders`. Todo sin probar. No hay carpetas nativas todavía.
