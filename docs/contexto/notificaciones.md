# Notificaciones — contexto verificado

Fuente: `HW-Austral/Portal-Austral-Dev`. Todo lo de abajo sale de leer el código; lo inferido está aparte.

## Qué es en el portal

Página `src/app/(dashboard)/notificaciones/page.tsx` (más la campana del encabezado, que comparte la regla de ruteo). Los datos son tareas (`task`) del CRM que el BO crea como avisos.

## Verificado en el código

### Lectura (`src/stores/useLegajoStore.ts` → `getNotificacionesEmpleado`)
- `POST api/consultafetchs` con entidad `tasks` y FetchXML sobre `task`, con el token del usuario de servicio (`reintentarVacio: true`, `reintentos: 3`).
- Atributos: `subject, statecode, scheduledend, createdon, activityid, statuscode, new_tipodenotificacion, new_mostrarenportal, description, new_plandetrabajoanual`. Orden: `createdon` descendente.
- Filtro: `new_mostrarenportal = 1` y `new_tipodenotificacion in (100000000, 100000027, 100000028, 100000029, 100000030, 100000031)`.
- `link-entity` interna a `new_empleado` por `regardingobjectid`, con `new_correoelectronicoportal = user.email`.
- No filtra por `statecode`: trae pendientes y leídas.
- App: `src/infrastructure/notificaciones/notificacionesApi.ts`.

### Mapeo y separación (`src/hooks/useGetNotificaciones.ts`)
- Campos: `id = activityid`, `title = subject.trim()`, `description` pasada por `formatearDescripcionPorSubject`, `statuscode` formateado, `statuscodeValue`, `type = new_tipodenotificacion` formateado, `createdAt` (UTC a local, `DD/MM/YYYY HH:mm`), `createdeOn`, `pta = _new_plandetrabajoanual_value` formateado, `statecode`.
- Pendientes: `statecode = 0` y `statuscode = 3`. Leídas: `statecode = 1`. Ambas de la más nueva a la más vieja. Una fila con `statecode = 0` y otro `statuscode` no entra en ninguna lista.
- Descripción: HTML a texto (cierre de `p/div/li/h1-h6` y `<br>` dejan un espacio) y, según el asunto, reescritura fija para los avisos del Plan de Trabajo (apertura de convocatoria, observaciones, aprobado, recordatorio de vencimiento con la fecha extraída de la descripción, numérica o "31 de diciembre de 2025").
- Marcar como leída: `PUT api/hrfactors/inactivartarea` con `{ activityid }`. Éxito: aviso "Notificación marcada como leída" y recarga. Error: solo `console.error`.
- Marcar todas: de a tandas de 5 en paralelo (`Promise.allSettled`), recarga al final; avisos "N notificación(es) no se pudieron marcar como leídas" o "N notificación(es) marcadas como leídas".
- Tiempo real: conexión SignalR a `${UrlApi}hubs/notifications?userEmail=…` (token como `accessToken`), evento `NuevaNotificacion` → recarga. Se abre 3 segundos después de montar. El polling cada 5 minutos está comentado en el portal.

### Pantalla (`notificaciones/page.tsx`, `src/columns/columnsNotificaciones.tsx`)
- Título "Notificaciones", subtítulo "Todos los avisos del portal, con su módulo de origen y su estado.". Botón "Marcar todas como leídas" solo si hay pendientes, con diálogo: "Se van a marcar como leídas las {n} notificaciones pendientes. Se envían de a tandas, así que puede demorar unos segundos." (Marcar todas / Marcando... / Cancelar).
- Pestañas Pendientes / Completadas / Todas, cada una con su cantidad. Filtros: select "Módulo" y rango de fechas "Desde" / "Hasta" sobre la fecha local `YYYY-MM-DD`.
- Columnas: Acciones (Ir, y Marcar como leída solo si está pendiente), Estado ("Pendiente" / "Leída"), Título, Descripción, Módulo (el tooltip muestra la ruta destino), Tipo (CRM), Fecha.

### Ruteo (`src/@core/utils/rutaNotificacion.ts`)
Port completo en `src/domain/notificaciones/notificaciones.ts` (`rutaNotificacion`, `moduloNotificacion`). El orden de las reglas importa: investigación, producción científica, GDD, licencias/vacaciones, promoción, nombramientos, plan de trabajo, y por defecto `/`. Módulos posibles: Promoción docente, Licencias y vacaciones, Gestión del desempeño, Plan de trabajo, Investigación, Nombramientos, Otras. El destino del Portal CAE es `PortalCaeUrl` (`NEXT_PUBLIC_PORTAL_CAE_URL`, `src/keys.ts`); si está vacío cae a `/perfil/docencia/promocion`.

## Cómo quedó en la app

| Portal | App |
|---|---|
| Página `/notificaciones` | `NotificacionesScreen` (ruta `Notificaciones`, todos los roles) |
| Grilla | `TarjetaNotificacion` por fila |
| Tabs con cantidad | `Pestanias` |
| Select "Módulo" | fila de chips con los módulos presentes en la pestaña |
| Rango de fechas | dos `DateField` |
| Campana | botón "Notificaciones (N)" en Inicio |
| SignalR | recarga cada 5 minutos, al tocar "Actualizar" y al abrir la pantalla |
| `PortalCaeUrl` | variable `PORTAL_CAE_URL` (opcional, vacía en `.env.template`) |

Destino de "Ir" (`resolverDestino`): investigación → Investigación; `/perfil/docencia/*` → Docencia; licencias → Licencias con la sección (`seccion=gestion` → sección `equipo`); plan de trabajo → Plan de trabajo (solo rol docente); URL completa → se abre en el navegador; `/` → Inicio. Gestión del desempeño, Funciones SA / VRAA y Referente MATHU no existen en la app: el aviso se muestra y "Ir" informa que la sección todavía no está disponible.

## Diferencias con el portal (deliberadas)
1. Sin SignalR (dependencia nueva): recarga periódica. Decisión 90.
2. Si marcar como leída falla, la app avisa; el portal solo escribe en la consola.
3. `htmlAtexto` usa expresiones regulares y las entidades más comunes (el portal usa `DOMParser`, que no existe en React Native).
4. Si el backend responde 200 vacío, la lista queda vacía (el portal falla al mapear).
5. El filtro `tipo` de la ruta de licencias (`tipo=licencias|vacaciones`) no se usa: la pantalla de Licencias de la app no lo recibe.

## Inferido (sin verificar)
- Que la sección `equipo` de Licencias sea la "Gestión de Solicitudes" a la que apunta `seccion=gestion`.
- Que la grilla del portal liste las fechas de más nueva a más vieja y que el select "Módulo" muestre los valores presentes en las filas (`components/table/Table` no se leyó).
- Que un filtro de fecha excluya las filas sin fecha.
- Que la página no restrinja por rol (no se leyó el menú ni un `allowedRoles`).
- Texto "No hay notificaciones en esta pestaña." y "No se pudieron cargar las notificaciones…": propios de la app.
- Íconos Ionicons `notifications-outline`, `arrow-forward-outline`, `checkmark-outline`, `checkmark-done-outline`, `refresh-outline`: no verificados contra la versión instalada.

## Nada de esto se probó
No se ejecutó la app ni se llamó a la API. Falta que Daniel lo pruebe con el `.env` cargado.
