# ESTADO — dónde estamos y qué hacer al retomar

Este archivo es el punto de entrada para una sesión nueva. Se actualiza al final de cada etapa. Última actualización: 2026-10-26 (revisión de configuración y verificación de librerías).

## 1. Qué hacer apenas se abre una sesión nueva

1. Leer `CLAUDE.md` (reglas y mapa del repo) y este archivo. Después `docs/DECISIONES.md`, `docs/PENDIENTES.md` y, según el módulo que se toque, el archivo de `docs/contexto/`.
2. Los repos se leen y escriben **solo por el conector MCP de GitHub** (herramientas `get_file_contents` y `push_files`; si aparecen diferidas, cargarlas con ToolSearch). No se clona nada, no se usa `git`, no se usa `add_repo`.
3. **Escritura solo en `DanielQuirozHW/App.Mobile.Austral`, rama `main`.** Verificar owner/repo en cada `push_files`. Los otros tres repos son solo lectura.
4. **Se sigue el orden de la sección 4**, que fijó Daniel el 2026-10-26. No se construyen módulos fuera de esa lista.
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

**Módulos del portal sin construir:**

- Tablero de Inicio real (hoy `Inicio` es provisorio) — pedido por Daniel
- Documentación — pedido por Daniel
- Notificaciones — pedido por Daniel
- Funciones de Nombramientos y Promoción en navegación y guardas (etapa 7) — pedido por Daniel, **al final**
- Foto de portada — pedida por Daniel; falta ubicar en el portal qué pantalla la usa
- GDD, Indicadores, Funciones SA / VRAA, Referente MATHU, Promoción > Postulación — sin pedido; no se construyen

**Otros pendientes:**

- Lectura de `UnidadDeNegocio` (`NEXT_PUBLIC_UNIDAD_NEGOCIO`) del portal, por si hace falta otra variable de entorno.
- Lo que figura como inferido o sin verificar está en `docs/PENDIENTES.md` (tabla "Falta verificar"). Cada punto dice en qué archivo del código está.
- Revisión estática archivo por archivo del resto de `src/` (solo se revisaron la configuración y el Plan de Trabajo; ver `docs/VERIFICACIONES.md`).

## 4. Orden de trabajo acordado con Daniel (2026-10-26)

Daniel no tiene la PC, así que se avanza solo con lo que se puede hacer leyendo y escribiendo, sin credenciales. Orden:

1. **Configuración y estructura** — hecho el 2026-10-26: archivos de configuración revisados, librerías contrastadas con documentación oficial (`docs/VERIFICACIONES.md`), README actualizado. Queda la revisión estática del resto de `src/`.
2. **Cerrar los puntos inferidos leyendo el portal**: primero los hooks del Plan de Trabajo que no se leyeron (áreas, proyectos, publicaciones, congresos, divulgaciones, dirección de tesis, jurado) y los de Resultados / Impacto I+D (decisiones 72 y 73). Corregir el código y sacar cada punto de `PENDIENTES.md`.
3. **UI**: ajustar el aspecto contra el tema del portal (`src/@core/theme/overrides`), iniciales del avatar (`getInitials`) y cabecera (`PlanTrabajoPageHeader`), y la foto de portada (`PerfilHeader.tsx`).
4. **Módulos nuevos**, de a uno, leyendo primero el portal: Tablero de Inicio real, Documentación, notificaciones. Después, mejoras de Plan de Trabajo, Licencias y Vacaciones.
5. **Al final**: funciones de Nombramientos y Promoción en navegación y guardas.

Si Daniel tiene la PC: pasa primero el checklist de `docs/SETUP-NATIVO.md`, sección 6, y las correcciones que salgan de las pruebas van antes que lo anterior.

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
- Avanzar sin pedir aprobación por etapa dentro de lo que pide; frenar solo ante una decisión irreversible o una duda real.
- No copiar datos de personas ni de ejemplo del código del portal (decisión 67).

## 7. Trampas conocidas del conector (aprendidas)

- `search_code` del conector no es confiable: navegar con `get_file_contents` sobre directorios y archivos.
- No usar `download_url` con token ni ninguna descarga por otra vía.
- En `push_files`, pasar `owner`, `repo`, `branch`, `message` y `files` como parámetros separados; el contenido va inline.
- Los mensajes de commit no llevan secuencias literales como `\uXXXX`, y terminan con las dos líneas de atribución que indique la sesión (`Co-Authored-By` y `Claude-Session`).
- Los archivos pueden estar en subcarpetas inesperadas (por ejemplo `components/licencias/Pestanias.tsx`): listar el directorio antes de asumir la ruta.
- Los binarios (logos, fuentes) no se pueden subir por el conector: los copia Daniel.
- `WebFetch` solo abre URLs que ya salieron en una búsqueda o que dio Daniel: para leer documentación hay que buscar primero y abrir el resultado.

## 8. Mapa de documentos

| Archivo | Para qué |
|---|---|
| `CLAUDE.md` | Reglas, jerarquía de fuentes, alcance y mapa del código |
| `docs/ESTADO.md` | Este archivo: estado y qué hacer al retomar |
| `docs/DECISIONES.md` | Decisiones numeradas (1 a 86) |
| `docs/PENDIENTES.md` | Decisiones abiertas, tareas externas y puntos por verificar |
| `docs/VERIFICACIONES.md` | Lo contrastado con documentación oficial, con su fuente |
| `docs/SETUP-NATIVO.md` | Checklist de lo que hace Daniel con la PC |
| `docs/STACK.md` | Librerías y versiones aprobadas |
| `docs/ERRORES.md` | Errores cometidos y reglas para no repetirlos |
| `docs/contexto/*.md` | Contrato verificado del portal por módulo |
| `.claude/skills/` | Skills de trabajo del repo |
