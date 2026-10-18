# Cliente HTTP y endpoints del portal

Sale del código. `P` = HW-Austral/Portal-Austral-Dev, `A` = HW-Austral/API.Web.Austral.

## Cliente HTTP con reintentos (verificado, `P:src/configs/apiClient.ts`)

Motivo (comentario del código): el backend, de forma intermitente, devuelve **200 con cuerpo vacío** en `api/Usuarios/login` y `api/consultafetchs`. Axios no lanza error ante un 200, así que ese cuerpo vacío llegaba a la UI. El wrapper reintenta de forma transparente.

Comportamiento:

- Timeout: 30000 ms.
- Reintentos por defecto: 2 (hasta 3 intentos en total). Configurable con `reintentos`.
- `reintentarVacio: true` reintenta un 200 cuyo cuerpo es `""`, `null` o `undefined`. Un `[]` o un `{}` son respuestas **válidas** y no se reintentan. Un **204** tampoco (es válido en la API v1).
- Espera entre reintentos de cuerpo vacío: el primer reintento es inmediato (0 ms), y desde el segundo hay backoff exponencial con base de 300 ms.
- Errores reintentables: sin respuesta (red o timeout), 5xx, 429 y 408. Backoff `300 * 2^intento`.
- Los reintentos son para **lecturas y logins idempotentes**. **No** se usan en mutaciones (PUT/POST/DELETE que escriben), para evitar doble aplicación.
- Helpers: `apiPost(url, data, config)` y `apiGet(url, config)`.

## Dos superficies de la API (verificado)

La API tiene un controller **legacy** (`A:Controllers/HROneClickController.cs`, junto con `ConsultafetchController`) y una superficie **`/api/v1`** (`A:Controllers/V1/*`). Conviven y comparten la capa de servicios. **El portal usa ambas**, según la pantalla. La app hace lo que hace el portal en cada caso; no elige una por criterio propio.

### Legacy que usa el portal (verificado en lo leído)

- `POST api/consultafetch` y `POST api/consultafetchs` con `{ entidad, fetch }`. `fetch` es un FetchXML y `entidad` el nombre del entity set (por ejemplo `new_empleados`). Devuelven un array de registros de Dataverse, con nombres `new_*` y anotaciones `@OData.Community.Display.V1.FormattedValue` para los valores de listas.
- `PUT api/hrfactors/empleado` (actualizar empleado).
- `POST | PUT | DELETE api/hrfactors/familiarEmpleado`.
- `POST api/hrfactors/adjuntosolicitud?documentacionporfamiliardeempleado={id}` (multipart/form-data, un campo `file` por archivo): carga de adjuntos de un documento de familiar. También existe `POST api/hrfactors/adjuntosDocumentacion?doc_empleado_id=...`.

No se verificó en este relevamiento la diferencia entre `consultafetch` y `consultafetchs`: el portal usa ambos. No asumir; copiar el que use cada pantalla.

### v1 que usa el portal (verificado)

- Base: `{API_URL}api/v1`. Rutas centralizadas en `P:src/configs/endpoints.ts`.
- Catálogos: `GET /api/v1/catalogos/{clave}[?parentId=]` devuelve `[{ id, nombre }]`. Claves vistas: `paises`, `provincias`, `localidades`, `bancos`, `universidades`, `parentescos`, `disciplinas`, `subdisciplinas`. (`P:src/configs/catalogos.v1.ts`). El portal mapea `{id, nombre}` a la forma cruda `{new_paisid, new_name}` en `P:src/stores/useAutocompletadosStore.ts`.
- **Localidades siguen por legacy** (`consultafetch`), con una decisión explícita en el código: se cargan todas con su `_new_provincia_value` y se filtran por provincia en el cliente. El endpoint v1 exige `parentId`. (`P:src/stores/useAutocompletadosStore.ts`)

### v1 que existe pero que la pantalla Datos personales no usa (verificado en lo leído)

`P:src/configs/endpoints.ts` declara rutas v1 como `empleados/{id}/perfil-personal` (GET/PUT), `empleados/{id}/familiares` y `empleados/{id}/solicitudes/...`. En lo leído, la pantalla Datos personales (`P:src/app/(dashboard)/legajo/datos-personales/page.tsx`) lee y escribe por el **legacy** (`useLegajoStore`). **Hay que hacer lo que hace la pantalla.** Si cambia, se avisa.

## En la app

Las rutas están centralizadas en `src/config/api/endpoints.ts` (base `${env.apiUrl}api/`); las consultas FetchXML pasan por `src/config/api/fetchXml.ts` (con `reintentos: 3` y `reintentarVacio`); los errores de escritura se traducen con `src/config/api/apiError.ts`.

## Convenciones de uso (verificado)

- Header en todas las llamadas: `Authorization: Bearer <token>`.
- Las lecturas con FetchXML se hacen con `reintentarVacio: true, reintentos: 3`.
- Un cuerpo no-array tras reintentar se trata como fallo transitorio, no como "no hay datos" (por ejemplo, el legajo no se pisa con vacío).

## No leído todavía

- Los controllers de la API (`HROneClickController`, `ConsultafetchController`, `Controllers/V1/*`) en detalle: contratos reales de cada ruta.
- `A:Program.cs` (auth, CORS, versionado, filtros globales).
- `A:Middleware` y `A:Hubs` (SignalR): no se vio si el portal los usa.
