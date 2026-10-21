# ESTADO — dónde estamos y qué hacer al retomar

Este archivo es el punto de entrada para una sesión nueva. Se actualiza al final de cada etapa. Última actualización: 2026-10-20 (Plan de Trabajo terminado).

## 1. Qué hacer apenas se abre una sesión nueva

1. Leer `CLAUDE.md` (reglas y mapa del repo) y este archivo. Después `docs/DECISIONES.md`, `docs/PENDIENTES.md` y, según el módulo que se toque, el archivo de `docs/contexto/`.
2. Los repos se leen y escriben **solo por el conector MCP de GitHub** (herramientas `get_file_contents` y `push_files`; si aparecen diferidas, cargarlas con ToolSearch). No se clona nada, no se usa `git`, no se usa `add_repo`.
3. **Escritura solo en `DanielQuirozHW/App.Mobile.Austral`, rama `main`.** Verificar owner/repo en cada `push_files`. Los otros tres repos son solo lectura.
4. **No se construye nada nuevo hasta que Daniel lo pida.** El estado actual es: todo lo pedido está construido. Lo que sigue lo decide Daniel (sección 4).
5. Si Daniel pide un módulo nuevo: leer primero el código del portal de ese módulo, escribir sus notas en `docs/contexto/<modulo>.md`, construir por capas (`domain` → `infrastructure` → `application` → `presentation`), documentar decisiones numeradas a continuación de la 86 y actualizar este archivo, `PENDIENTES.md` y el mapa de `CLAUDE.md`.

## 2. Qué está hecho (todo escrito, nada probado)

| Etapa | Qué | Decisiones | Contrato verificado |
|---|---|---|---|
| 1 | Base del proyecto: configuración, entorno, tema del portal, responsive, componentes base, providers | 16 a 27 | `docs/STACK.md` |
| 2 | Cliente HTTP con reintentos, token de servicio, endpoints (falta leer el uso de `UnidadDeNegocio`) | 28, 29 | `contexto/cliente-http-y-endpoints.md` |
| 3 | Autenticación: login Microsoft (proveedor de Firebase) y email, validación del empleado, `usuarios` en Firestore, cierre de sesión. Sin registro ni recuperar contraseña | 8, 18, 30 a 36 | `contexto/portal-auth-y-tenant.md` |
| 4 | Navegación por estado, selección de puesto, overlay de cierre de sesión, `Inicio` provisorio | 35, 41 | `contexto/roles-puesto-y-fotos.md` |
| 5 | Foto de perfil y cabecera del legajo (sin portada) | 45 a 47 | `contexto/roles-puesto-y-fotos.md` |
| 6 | Datos personales completo (Identidad, Contacto, Domicilio real, Familia con documentación, Contacto de emergencia) con aviso de cambios sin guardar | 37 a 44 | `contexto/datos-personales.md` |
| 8 | Licencias y vacaciones (licencias, vacaciones, calendario, equipo) | 48 a 56 | `contexto/licencias-y-vacaciones.md` |
| 9 a 12 | Perfil completo: Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación (Afiliaciones, Actividad I+D, Resultados / Impacto I+D). Sin Promoción > Postulación | 57 a 74 | `contexto/perfil.md` |
| 13 | Plan de Trabajo (solo docente): lista, detalle, 18 secciones de registros, resumen con adjuntos y envío | 75 a 86 | `contexto/plan-de-trabajo.md` |

Acceso desde `Inicio`: Datos personales (docente / codocente), Licencias y vacaciones, Perfil (todos los roles) y Plan de trabajo (solo docente).

## 3. Qué NO está hecho

**Módulos del portal que quedan pendientes (Daniel confirmó que quedan así; no se construyen sin pedido):**

- Documentación
- GDD
- Indicadores
- Funciones SA / VRAA
- Referente MATHU
- Notificaciones
- Promoción > Postulación (dentro de Perfil; no se migra)

**Otros pendientes de código (sin confirmar con Daniel):**

- Etapa 7: usar las funciones de Nombramientos y Promoción en la navegación y las guardas. La resolución de funciones ya está en `src/domain/roles/`.
- Tablero de inicio del portal (`/`): no se leyó; `Inicio` es provisorio.
- Foto de portada: no se construye (decisión 46).
- Lectura de `UnidadDeNegocio` (`NEXT_PUBLIC_UNIDAD_NEGOCIO`) del portal, por si hace falta otra variable de entorno.
- Lo que figura como inferido o sin verificar está en `docs/PENDIENTES.md` (tablas "Falta verificar"). Cada punto dice en qué archivo del código está.

## 4. Qué sigue

No hay una tarea abierta de construcción. Opciones que decide Daniel:

1. Probar lo construido (lo hace él, con la PC): ver `docs/SETUP-NATIVO.md`, sección 6.
2. Pedir uno de los módulos pendientes de la sección 3.
3. Pedir correcciones que salgan de las pruebas. Ahí sí se puede tocar código ya escrito; cada corrección se contrasta contra el código del portal, leyendo.

Si la sesión nueva no recibe instrucciones concretas, **resumir en pocas líneas este estado y preguntar con cuál sigue**.

## 5. Lo que hace Daniel (configuración fuera del código)

Lista completa, ordenada y con checklist en [`SETUP-NATIVO.md`](SETUP-NATIVO.md). Lo central:

- Generar `android/` e `ios/` con el comando oficial de React Native (son carpetas que se crean automáticamente) y combinar con este repo.
- Registrar las apps iOS / Android en Firebase y habilitar el proveedor Microsoft (más el registro en Microsoft Entra).
- Crear el `.env` local con los valores reales (nombres en `.env.template`; nunca se commitea).
- Agregar las fuentes Montserrat y copiar los logos del portal a `src/assets/images` (completar `logos.ts`).
- Permisos nativos (cámara, galería), orientación vertical, configuración de los paquetes nativos.
- Todas las pruebas.

No preguntar ni insistir con estos temas: están listados y los hace Daniel cuando decida.

## 6. Cómo trabaja Daniel (preferencias que ya dijo)

- Español rioplatense, directo y breve. Responder solo lo que preguntó.
- Entregar todo **completo**, nunca fragmentos (`push_files` reemplaza el archivo entero: para cambiar un archivo se reenvía completo).
- Separar siempre lo verificado en el código de lo supuesto. Citar repo + ruta.
- La app es la versión mobile del **portal de Austral**: colores, textos y lógica salen del portal, no del prototipo. "Los módulos deben ser totalmente la misma lógica que hacen en el módulo del portal."
- No probar nada y no usar credenciales, nunca.
- No justificar una recomendación técnica con "no se puede probar".
- No volver a plantear la seguridad del usuario de servicio del portal, ni preguntar por la publicación de las apps o el registro en Firebase.
- Avanzar sin pedir aprobación por etapa; frenar solo ante una decisión irreversible o una duda real.
- No copiar datos de personas ni de ejemplo del código del portal (decisión 67).

## 7. Trampas conocidas del conector (aprendidas)

- `search_code` del conector no es confiable: navegar con `get_file_contents` sobre directorios y archivos.
- No usar `download_url` con token ni ninguna descarga por otra vía.
- En `push_files`, pasar `owner`, `repo`, `branch`, `message` y `files` como parámetros separados; el contenido va inline.
- Los mensajes de commit no llevan secuencias literales como `\uXXXX`, y terminan con las dos líneas de atribución que indique la sesión (`Co-Authored-By` y `Claude-Session`).
- Los archivos pueden estar en subcarpetas inesperadas (por ejemplo `components/licencias/Pestanias.tsx`): listar el directorio antes de asumir la ruta.
- Los binarios (logos, fuentes) no se pueden subir por el conector: los copia Daniel.

## 8. Mapa de documentos

| Archivo | Para qué |
|---|---|
| `CLAUDE.md` | Reglas, jerarquía de fuentes, alcance y mapa del código |
| `docs/ESTADO.md` | Este archivo: estado y qué hacer al retomar |
| `docs/DECISIONES.md` | Decisiones numeradas (1 a 86) |
| `docs/PENDIENTES.md` | Decisiones abiertas, tareas externas y puntos por verificar |
| `docs/SETUP-NATIVO.md` | Checklist de lo que hace Daniel con la PC |
| `docs/STACK.md` | Librerías y versiones aprobadas |
| `docs/ERRORES.md` | Errores cometidos y reglas para no repetirlos |
| `docs/contexto/*.md` | Contrato verificado del portal por módulo |
| `.claude/skills/` | Skills de trabajo del repo |
