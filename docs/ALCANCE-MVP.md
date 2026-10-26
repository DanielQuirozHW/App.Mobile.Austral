# ALCANCE — esto es un MVP de DEMOSTRACIÓN, NO una migración de todo el portal

**Leer antes que cualquier otra cosa. Aclarado por Daniel el 2026-10-26.**

## La idea

Presentar a Austral una app **chica y prolija** para que decidan si les gusta y si quieren seguir. Por eso:

- **Lo que tiene que estar muy bien: lo general.** Estructura del proyecto, configuración, navegación y menús, modo de color (claro / oscuro), notificaciones, aspecto igual al del portal, login, cabecera, avisos y manejo de errores.
- **De módulos: solo 1 o 2 de prueba**, bien hechos. No se migran todos.
- **NO es la idea migrar todos los módulos del portal.** Si Austral decide seguir, ahí se migra el resto.

## Reglas para cualquier sesión nueva

1. **No construir módulos nuevos ni mejoras de módulos ya hechos** salvo que Daniel lo pida de forma expresa en esa conversación.
2. Si Daniel pregunta "con qué seguimos" o pide un listado: **dar el listado con una recomendación y esperar su respuesta. No programar.**
3. El trabajo que sí vale: terminar y pulir lo **general** (ver la sección de abajo) y los 1 o 2 módulos de la demo.
4. Todo lo que ya está escrito de módulos queda como está. No se borra, pero no se amplía.

Error registrado: el 2026-10-26 Daniel pidió un listado para elegir con qué seguir y se construyó Documentación sin que la eligiera. No repetir.

## Reporte: qué está terminado (todo escrito, nada probado)

### Módulos y pantallas

| Qué | Estado | Para la demo |
|---|---|---|
| Login (Microsoft y email) y selección de puesto | Escrito | Sí, es base |
| Inicio (bienvenida, mensaje del mes, cumpleaños, feriados, accesos) | Escrito; faltan los 18 textos del mensaje del mes (los pega Daniel) | Sí, es base |
| Notificaciones | Escrito (sin tiempo real: recarga cada 5 minutos) | Sí, es base |
| Datos personales (Identidad, Contacto, Domicilio, Familia, Emergencia) | Escrito completo | **Candidato 1** |
| Licencias y vacaciones (licencias, vacaciones, calendario, equipo) | Escrito completo | **Candidato 2** |
| Documentación del legajo | Escrito | Extra, ya hecho |
| Perfil (Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación) | Escrito, 6 pantallas | Extra, ya hecho (se puede ocultar en la demo) |
| Plan de Trabajo (solo docente) | Escrito | Extra, ya hecho (se puede ocultar en la demo) |
| Mejoras de Plan de Trabajo, Licencias y Vacaciones | **No se hacen** | No |
| Nombramientos y Promoción (etapa 7), GDD, Indicadores, Funciones SA / VRAA, Referente MATHU, Promoción > Postulación | **No se hacen** | No |

Recomendación: mostrar **Datos personales** y **Licencias y vacaciones** (son los más visibles y completos). Si Daniel prefiere otros 2, se cambia qué se ve desde Inicio.

### Lo general (lo que realmente importa)

| Qué | Estado |
|---|---|
| Estructura por capas, configuración y entorno sin valores | Hecho y revisado (`VERIFICACIONES.md`) |
| Tema con colores, tipografía y radios del portal | Hecho; los overrides del tema del portal (`src/@core/theme/overrides`) no se leyeron, el aspecto de varios componentes es aproximación |
| Modo claro / oscuro | La app sigue el sistema (decisión 27). **No hay selector manual**; el portal sí lo tiene |
| Menú / navegación | **Falta.** Hoy se navega con botones desde Inicio; el portal tiene menú lateral. Es lo general más importante que queda |
| Notificaciones | Hecho |
| Cabecera con foto de perfil y portada | Hecho; borde del avatar sin ajustar (portal: 3 px `azulLight`) |
| Avisos (toasts), confirmación al salir con cambios sin guardar, manejo de errores | Hecho |
| Logos y fuentes Montserrat | Los carga Daniel (`SETUP-NATIVO.md`) |
| Proyecto nativo (`android/`, `ios/`), Firebase, `.env`, pruebas | Los hace Daniel (`SETUP-NATIVO.md`) |

## Qué se puede hacer ahora (a elección de Daniel; no se hace nada hasta que elija)

1. **Menú de navegación general** (equivalente al menú lateral del portal, adaptado a celular).
2. **Selector de modo de color** (claro / oscuro / sistema) accesible desde el menú o un perfil.
3. **Pantalla de ajustes / perfil** (modo de color, cerrar sesión, versión).
4. Ajustar el aspecto contra el tema del portal (overrides, borde del avatar).
5. Revisión estática de todo `src/` (imports, exports, tipos) para que Daniel encuentre menos errores al probar.
6. Definir qué módulos se ven desde Inicio en la demo.
