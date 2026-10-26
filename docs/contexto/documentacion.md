# Documentación del legajo (Legajo > Documentación)

Contrato leído en `HW-Austral/Portal-Austral-Dev` (solo lectura). Separado en **verificado**, **diferencias conscientes** e **inferido**. Decisión 91 en `docs/DECISIONES_89_en_adelante.md`.

## Verificado en el código del portal

Fuentes: `src/app/(dashboard)/legajo/documentacion/page.tsx`, `src/hooks/useGetDocumentosEmpleado.ts`, `src/hooks/useGetaAdjuntosXEmpleado.ts`, `src/columns/columnsDocumentosLegajo.tsx`, `src/app/(dashboard)/legajo/_components/component/ModalVerDocumentos.tsx`, `ModalCargarDocumentos.tsx` y `useEnviarArchivos.ts`, `src/app/(dashboard)/legajo/_components/UserProfileBanner.tsx` y `src/stores/useLegajoStore.ts` (`getDocumentosEmpleado`, `getAdjuntosXEmpleado`, `cargarAdjuntoLegajoEmpleado`). Menú: `src/navigation/vertical/index.tsx` (Legajo > Documentación, para todos los roles).

### Página

- Encabezado `LegajoPageHeader` con "Documentación", cabecera `UserProfileBanner compact` (avatar de 56 en vez de 72, relleno 16 en vez de 24, nombre en `subtitle1`), aviso informativo **"Aquí deberás cargar los documentos asociados a tu legajo."** y la tabla `COLUMNS_DOCS_LEGAJO`.
- Columnas: **Acciones** ("Ver Adjuntos" con ojo y "Cargar Archivo" con nube), **Título** (`descripcion`), **Documento importado** (check verde o nube tachada) y **Fecha de última carga realizada**.

### Lista (`getDocumentosEmpleado`)

- `POST api/consultafetchs` con `reintentarVacio: true, reintentos: 3`, entidad `new_documentacionporempleados`.
- Entidad `new_documentacionporempleado`, atributos: `new_name`, `createdon`, `new_tipodeempleado`, `new_requerido`, `new_ingresante`, `new_empleado`, `new_documento`, `new_descripcion`, `new_documentacionporempleadoid`, `new_adjunto`, `new_fechadecarga`. Orden por `new_name`.
- Filtro: `statecode = 0` y `new_empleado = empleadoId`. `link-entity` interno a `new_documentacion` (alias `ba`, `modifiedon` y `createdon`) y a `new_empleado` (alias `al`, `new_tipodecontratacion`).

### Mapeo y filtros (`useGetDocumentosEmpleado`)

- `id` = `new_documentacionporempleadoid`; `nombre` = `new_name`; **`descripcion` = texto del lookup `_new_documento_value`** (es el "Título" que se ve); `documentoId` = `_new_documento_value`; `cargoDoc` = "SÍ" si `new_adjunto === true`, si no "NO".
- Fecha de carga: si hay `new_fechadecarga` ISO se muestra `DD/MM/YYYY`; si no, el texto formateado sin la hora (se prueban `D/M/YY`, `D/M/YYYY`, `DD/MM/YY`, `DD/MM/YYYY`) y, si no se puede leer, la parte de fecha tal cual.
- Se **omiten** los documentos cuyo nombre o título (en minúsculas) contengan "psicotécnico" o "exámen preocupacional".
- Se **omite el CUD** (título con "certificado único de discapacidad" o "cud") si el empleado **no** es relación de dependencia (`esRelacionDependencia` sobre `al.new_tipodecontratacion`).

### Documento importado

- Verde (`#4caf50`, "Documento importado") si `cargoDoc` es "SÍ" **o** hay un check temporal de ese documento; si no, nube tachada gris ("Sin documento").
- Punto naranja (8 px, opacidad 0,8) en la esquina si hay check o fecha temporal pero el CRM todavía no marcó `new_adjunto`.
- El check y la fecha temporales se guardan al subir (store y `sessionStorage`); la fecha temporal es `toLocaleDateString('es-ES', 2-digit)`.

### Ver adjuntos (`ModalVerDocumentos`, `getAdjuntosXEmpleado`)

- Se abre con la **fila** (`row.documentoId` = id de `new_documentacion`) y el título del diálogo es `row.nombre`.
- `POST api/consultafetchs`, entidad `new_documentacionporempleados`: filtro `new_empleado = empleadoId`; `link-entity` a `new_documentacion` (alias `au`) con `new_documentacionid = documentoId` y `statecode = 0`; `link-entity` a `annotation` (alias `av`, `objectid = new_documentacionporempleadoid`) con `annotationid`, `documentbody`, `filename`, `mimetype`, `createdon`.
- Mapeo: `id` = `av.annotationid`, `filename`, `mimetype`, `createdon` UTC a local `DD/MM/YYYY HH:mm`, `documentbody` (base64).
- Columnas del modal: Previsualizar (ojo + descarga), Título (`filename`) y Fecha de creación.

### Cargar archivo (`ModalCargarDocumentos`, `useEnviarArchivos`)

- Es el mismo modal que usa la documentación de familiares (textos, tipos JPG/JPEG/PNG/PDF/DOC/DOCX y límite de 15 MB ya migrados en Datos personales).
- Destino: la **fila del empleado** (`new_documentacionporempleadoid`). `POST api/hrfactors/adjuntosDocumentacion?doc_empleado_id={id}` (la D es mayúscula), `multipart/form-data`, un campo `file` por archivo, Bearer del usuario de servicio.
- Éxito: aviso "Archivo cargado con éxito", se vuelve a pedir la lista y se cierra el modal. Error: aviso con `response.data` o "Error al cargar archivo".
- El portal no trata una respuesta vacía como error.

## Diferencias conscientes de la app

- **Sin `uiname` fijo.** La consulta de adjuntos del portal lleva el nombre de una persona escrito a mano en la condición de `new_empleado`; no se copia (decisión 67). El filtro real es el valor del id.
- **El check temporal se marca solo si la subida salió bien.** El portal lo marca antes de subir y lo deja aunque falle.
- **Check y fecha temporales solo en memoria** (no hay `sessionStorage`). Se descartan al cambiar de empleado o al cerrar la app; el CRM los trae después.
- **Tarjetas en lugar de tabla**: cada documento es una tarjeta con título, estado, fecha y las dos acciones.
- **El archivo se abre con el visor del sistema** (igual que en familiares); no hay botón de descarga aparte.
- **`new_requerido`, `new_tipodeempleado` e `new_ingresante`** se piden como el portal, pero la app no los muestra ni los mapea: el portal tampoco los dibuja.
- **Cabecera compacta sin portada**: la portada es un agregado de la app (decisión 88) y solo va en la variante completa.
- La lista vacía dice "Sin registros" (texto propio, igual que el modal de adjuntos).

## Inferido (no confirmado en el código)

- La ruta está disponible para todos los roles: el menú la muestra a todos, pero no se leyó el guard del layout del dashboard.
- La fecha de `new_fechadecarga` se interpreta en la hora local del celular (el portal usa `dayjs` en la del navegador).
- El ícono `checkmark-circle` de Ionicons para el check verde (el portal usa `mdi:check-circle`).
- Aspecto de la tarjeta (colores, radios, espacios): adaptación propia con los tokens del portal.

## Dónde está en la app

`config/api/endpointsDocumentacion.ts`, `domain/documentacion/documentos.ts`, `infrastructure/documentacion/documentacionApi.ts`, `application/documentacion/documentacionService.ts`, `presentation/stores/documentacionStore.ts`, `presentation/components/legajo/TarjetaDocumento.tsx` (más `ModalCargarDocumento`, `ModalVerAdjuntos` y `PerfilLegajoBanner` generalizados), `presentation/screens/legajo/DocumentacionScreen.tsx`. Ruta `Documentacion` en `navigation/tipos.ts` y `RootNavigator.tsx`; acceso desde `InicioScreen.tsx`.
