# Decisiones 89 en adelante

Continuación de [`DECISIONES.md`](DECISIONES.md) (decisiones 1 a 88). Se separó porque el archivo original ya es muy largo y cada cambio obliga a reenviarlo entero. La numeración sigue corrida: la próxima es la **92**.

## 2026-10-26 (Tablero de Inicio y Notificaciones)

89. **Tablero de Inicio real** (reemplaza el `Inicio` provisorio). Fuente: `Portal-Austral-Dev` -> `src/app/(dashboard)/page.tsx` y `src/@core/components/austral/*` (`WelcomeBlock`, `FraseDelMes`, `CumpleaniosCard`, `ProximosFeriadosCard`), más `src/hooks/useGetFeriados.ts` y `useGetCumpleanios.ts`. Contrato en `docs/contexto/inicio.md`.
    - Se construyen las cuatro tarjetas del portal: bienvenida ("Bienvenido, {nombre}", subtítulo "Portal SIP – Universidad Austral"), mensaje del mes, cumpleaños del día y próximos tres feriados. Debajo van los accesos a los módulos de la app (en el portal están en el menú lateral) y "Cerrar sesión".
    - **Mensaje del mes: los 18 textos quedan vacíos** en `domain/inicio/frasesMensuales.ts` (número, libro y autor sí están). Son pasajes de libros publicados y no se reproducen: Daniel los pega desde `src/@core/data/frases-mensuales.ts` del portal, en el mismo orden. Mientras estén vacíos la tarjeta no se dibuja.
    - La fecha de hoy se calcula con el desplazamiento fijo UTC-3 de Argentina (sin horario de verano desde 2009), no con `Intl`, para no depender del motor del celular. El portal usa `Intl` con `America/Argentina/Buenos_Aires`; el resultado es el mismo.
    - El spinner de feriados del portal nunca se llegaba a mostrar (un bug); la app lo muestra mientras carga.
    - "Aniversarios del mes" no se dibuja: el portal siempre le pasa una lista vacía.
    - Sin verificar: los íconos `gift-outline` y `sparkles-outline` (ver `PENDIENTES.md`).

90. **Notificaciones** (`NotificacionesScreen`, ruta `Notificaciones`). Fuente: `Portal-Austral-Dev` -> `src/app/(dashboard)/notificaciones/page.tsx`, `src/hooks/useGetNotificaciones.ts`, `src/columns/columnsNotificaciones.tsx`, `src/@core/utils/rutaNotificacion.ts`, `src/stores/useLegajoStore.ts` (`getNotificacionesEmpleado`) y `src/keys.ts`. Contrato en `docs/contexto/notificaciones.md`.
    - **Lectura, pendientes / leídas, reescritura de descripciones, "Marcar como leída", "Marcar todas como leídas" (tandas de 5), ruteo por módulo, filtros y textos**: los del portal.
    - **Sin tiempo real por SignalR.** El portal abre una conexión a `hubs/notifications` con `@microsoft/signalr`; la app no agrega esa dependencia. En su lugar la lista se vuelve a pedir cada 5 minutos (el intervalo que el portal dejó comentado como "polling fallback"), al abrir la pantalla y con el botón "Actualizar". Si el equipo quiere tiempo real, se agrega `@microsoft/signalr` y se escucha `NuevaNotificacion`: es una decisión de Daniel (dependencia nueva).
    - **Aviso de error al marcar como leída.** El portal solo escribe en la consola; la app muestra "No se pudo marcar la notificación como leída". Diferencia consciente.
    - **"Ir"** traduce la ruta del portal a una pantalla de la app (`resolverDestino`). Gestión del desempeño, Funciones SA / VRAA y Referente MATHU no existen en la app: el aviso se muestra y "Ir" informa "Esta sección todavía no está disponible en la app.". `seccion=gestion` de Licencias va a la sección `equipo` (inferido).
    - **Portal CAE**: se agrega la variable opcional `PORTAL_CAE_URL` (sin valor en `.env.template`, `config/env.ts` -> `env.portalCaeUrl`). Vacía, la notificación "para revisión" lleva a Docencia, igual que el portal con `NEXT_PUBLIC_PORTAL_CAE_URL` vacía.
    - **Endpoint** `api/hrfactors/inactivartarea` en `config/api/endpointsNotificaciones.ts` (archivo aparte para no reenviar `endpoints.ts` entero; se puede unificar cuando haya otro cambio en ese archivo).
    - `htmlAtexto` usa expresiones regulares (el portal usa `DOMParser`, que no existe en React Native). Decodifica las entidades nombradas básicas y las numéricas.
    - **Acceso desde Inicio**: botón "Notificaciones (N)" con la cantidad de pendientes (en el portal es la campana del encabezado). La ruta está disponible para todos los roles (inferido).
    - Nada probado ni llamado a la API.

## 2026-10-26 (Documentación del legajo)

91. **Documentación** (`DocumentacionScreen`, ruta `Documentacion`). Fuente: `Portal-Austral-Dev` -> `src/app/(dashboard)/legajo/documentacion/page.tsx`, `src/hooks/useGetDocumentosEmpleado.ts`, `src/hooks/useGetaAdjuntosXEmpleado.ts`, `src/columns/columnsDocumentosLegajo.tsx`, `legajo/_components/component/ModalVerDocumentos.tsx`, `ModalCargarDocumentos.tsx` y `useEnviarArchivos.ts`, `legajo/_components/UserProfileBanner.tsx` y `src/stores/useLegajoStore.ts`. Contrato en `docs/contexto/documentacion.md`.
    - **Lista, filtros, "Documento importado", fecha de última carga, "Ver adjuntos" y "Cargar archivo": los del portal.** Se omiten psicotécnico / examen preocupacional y el CUD para quien no es relación de dependencia; el título es el texto del lookup `new_documento`; la carga va a `api/hrfactors/adjuntosDocumentacion?doc_empleado_id=`.
    - **Reutilización.** El portal usa el mismo modal de carga y casi el mismo de adjuntos para familiares y para Documentación; la app también: `ModalCargarDocumento` recibe `subir` y `ModalVerAdjuntos` recibe `obtener` (por defecto siguen subiendo y leyendo los de familiares). `PerfilLegajoBanner` suma la variante `compacto` (la `compact` del portal: sin portada, avatar de 56).
    - **Sin `uiname` fijo.** La consulta de adjuntos del portal trae el nombre de una persona escrito a mano; no se copia (decisión 67).
    - **El check y la fecha temporales se marcan solo si la subida salió bien.** El portal los marca antes y los deja aunque falle. Viven en memoria (el portal usa `sessionStorage`).
    - **Tarjetas en lugar de tabla** y "Sin registros" en la lista vacía (texto propio). El archivo se abre con el visor del sistema.
    - **Endpoint** `adjuntoDocumentacionEmpleado` en `config/api/endpointsDocumentacion.ts` (archivo aparte para no reenviar `endpoints.ts` entero; se puede unificar cuando haya otro cambio en ese archivo).
    - **Acceso desde Inicio**: botón "Documentación". Ruta para todos los roles: el menú del portal la muestra a todos; no se leyó el guard del layout del dashboard (inferido).
    - Sin verificar: el ícono `checkmark-circle` (ver `PENDIENTES.md`).
    - Nada probado ni llamado a la API.
