# ALCANCE — esto es un MVP de DEMOSTRACIÓN, NO una migración de todo el portal

**Leer antes que cualquier otra cosa. Aclarado por Daniel el 2026-10-26.**

## La idea

Presentar a Austral una app **chica y prolija** para que decidan si les gusta y si quieren seguir. Por eso:

- **Lo que tiene que estar muy bien: lo general.** Estructura del proyecto, configuración, navegación y menús, modo de color (claro / oscuro), notificaciones, aspecto igual al del portal, login, cabecera, avisos y manejo de errores.
- **De módulos: solo 1 o 2 de prueba**, bien hechos. No se migran todos.
- **NO es la idea migrar todos los módulos del portal.** Si Austral decide seguir, ahí se migra el resto.
- Los módulos que no son de la demo **figuran en el menú pero abren una pantalla vacía** (decisión 92, pedido de Daniel del 2026-10-26).

## Reglas para cualquier sesión nueva

1. **No construir módulos nuevos ni mejoras de módulos ya hechos** salvo que Daniel lo pida de forma expresa en esa conversación.
2. Si Daniel pregunta "con qué seguimos" o pide un listado: **dar el listado con una recomendación y esperar su respuesta. No programar.**
3. El trabajo que sí vale: terminar y pulir lo **general** (ver la sección de abajo) y los 1 o 2 módulos de la demo.
4. Todo lo que ya está escrito de módulos queda como está. No se borra, pero no se amplía.

Error registrado: el 2026-10-26 Daniel pidió un listado para elegir con qué seguir y se construyó Documentación sin que la eligiera. No repetir.

## Cómo se decide qué módulos se ven en la demo

Un solo archivo: `src/presentation/navigation/modulosMenu.ts`. Cada módulo tiene `enDemo`:

- `true`: abre su pantalla real (y aparece como acceso en Inicio, salvo Inicio, Notificaciones y Ajustes).
- `false`: sigue en el menú, pero abre `ModuloVacioScreen` ("Este módulo todavía no está disponible en la versión de demostración.").

Para cambiar los módulos de la demo alcanza con cambiar ese valor. El código de los módulos vacíos no se borró.

## Reporte: qué está terminado (todo escrito, nada probado)

### Módulos y pantallas

| Qué | Estado | En la demo |
|---|---|---|
| Login (Microsoft y email) y selección de puesto | Escrito | Sí, es base |
| Inicio (barra con campana y menú, bienvenida, mensaje del mes, cumpleaños, feriados, accesos) | Escrito; faltan los 18 textos del mensaje del mes (los pega Daniel) | Sí, es base |
| Menú lateral | Escrito | Sí, es base |
| Ajustes (modo de color, cuenta, cerrar sesión) | Escrito | Sí, es base |
| Notificaciones | Escrito (sin tiempo real: recarga cada 5 minutos) | Sí, es base |
| Datos personales (Identidad, Contacto, Domicilio, Familia, Emergencia) | Escrito completo | **Sí (módulo 1)** |
| Licencias y vacaciones (licencias, vacaciones, calendario, equipo) | Escrito completo | **Sí (módulo 2)** |
| Documentación del legajo | Escrito | En el menú, pantalla vacía |
| Perfil (Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación) | Escrito, 6 pantallas | En el menú, pantallas vacías |
| Plan de Trabajo (solo docente) | Escrito | En el menú, pantalla vacía |
| Mejoras de Plan de Trabajo, Licencias y Vacaciones | **No se hacen** | No |
| Nombramientos y Promoción (etapa 7), GDD, Indicadores, Funciones SA / VRAA, Referente MATHU, Promoción > Postulación | **No se hacen** | No figuran |

### Lo general (lo que realmente importa)

| Qué | Estado |
|---|---|
| Estructura por capas, configuración y entorno sin valores | Hecho y revisado (`VERIFICACIONES.md`) |
| Tema con colores, tipografía y radios del portal | Hecho; los overrides del tema del portal (`src/@core/theme/overrides`) no se leyeron, el aspecto de varios componentes es aproximación |
| **Menú lateral** con todos los módulos agrupados, foto y nombre arriba, cerrar sesión abajo | **Hecho** (decisión 92) |
| **Modo de color** Sistema / Claro / Oscuro, guardado en el celular | **Hecho** (decisión 92); el login sigue en claro como el portal |
| **Pantalla de Ajustes** | **Hecho** (decisión 92) |
| Notificaciones | Hecho |
| Cabecera con foto de perfil y portada | Hecho; borde del avatar ajustado a 3 px azulLight como el portal |
| Encabezado de las pantallas: botón de menú y sin hueco de más arriba | Hecho (decisión 92) |
| Avisos (toasts), confirmación al salir con cambios sin guardar, manejo de errores | Hecho |
| Logos y fuentes Montserrat | Los carga Daniel (`SETUP-NATIVO.md`) |
| Proyecto nativo (`android/`, `ios/`), Firebase, `.env`, pruebas | Los hace Daniel (`SETUP-NATIVO.md`) |

## Lo general que todavía se puede pulir (a elección de Daniel; no se hace nada hasta que lo pida)

1. Contrastar el aspecto con los overrides del tema del portal (`src/@core/theme/overrides`): campos, diálogos, chips.
2. Revisión estática de todo `src/` (imports, exports, tipos). Hasta ahora solo se revisaron la configuración, el Plan de Trabajo y lo escrito el 2026-10-26 para el menú y Ajustes.
3. Mostrar la cantidad de notificaciones pendientes en la campana de Inicio (la versión anterior la mostraba en un botón).
4. Tiempo real de las notificaciones (SignalR): requiere una dependencia nueva, lo decide Daniel con el equipo.
