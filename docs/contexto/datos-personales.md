# Módulo Datos personales

Sale del código del portal. `P` = HW-Austral/Portal-Austral-Dev. Alcance: **todo el módulo**, migrado completo.

Fuentes principales: `P:src/app/(dashboard)/legajo/datos-personales/page.tsx`, `P:src/stores/useLegajoStore.ts`, `P:src/hooks/useMiLegajo.ts`, `P:src/hooks/useActualizarLegajo.ts`, `P:src/hooks/useGetFamiliarXEmpleado.ts`, `P:src/app/(dashboard)/legajo/_components/component/*`, `P:src/columns/columnsDocumentosLegajo.tsx`, `P:src/configs/tipoContratacion.ts`.

## Acceso (verificado)

- La pantalla se protege con `ProtectedRoute allowedRoles={["docente", "codocente"]}`.
- Necesita `token` (API) y `user.empleadoid` (de la sesión). Mientras no estén listos el legajo y los datos iniciales, muestra un estado de carga.
- Encabezado: `LegajoPageHeader` con migas "Legajo / <página>" y el banner de usuario con foto (ver `roles-puesto-y-fotos.md`).

## Secciones de la pantalla (verificado)

1. **Identidad**: Apellido(s), Nombre(s), Sexo, Tipo de documento, Nro. documento, CUIT/CUIL, Estado civil, País de nacimiento, Fecha de nacimiento, Segunda nacionalidad.
2. **Contacto**: Celular personal (país, código de área, número) y Email personal.
3. **Domicilio real**: Calle, Nro., Piso, Depto/lote, Código postal, País, Provincia, Localidad.
4. **Familia** (solo si el tipo de contratación es relación de dependencia): Cónyuge, Hijos/as y su documentación.
5. **Contacto de emergencia**: Nombre, Celular, Email, Vínculo. Es la sección 4 si no hay Familia y la 5 si hay.

## Tipo de contratación y Familia (verificado, `P:src/configs/tipoContratacion.ts`)

- `COD_RELACION_DEPENDENCIA = 100000000`.
- `normalizar`: minúsculas, sin diacríticos, trim.
- `codigo(tipo)`: `Number(tipo.value)` si es finito y mayor que 0; si no, `null`.
- `contratacionIndeterminada`: no hay código y la etiqueta está vacía.
- `esRelacionDependencia`: si hay código, es `código === 100000000`; si no, la etiqueta normalizada es `"relacion de dependencia"`. Tolera valor string o number y etiqueta con o sin tilde.

## Lectura (verificado, `useLegajoStore.miLegajo`)

- `POST api/consultafetchs` con `{ entidad: "new_empleados", fetch }` y FetchXML sobre `new_empleado`, filtrado por `statecode = 0` y `new_empleadoid = <empleadoid>`. Con `reintentarVacio: true, reintentos: 3`.
- Un cuerpo no-array es fallo transitorio: se marca error y se avisa "No pudimos cargar tus datos"; **no** se pisa el legajo previo.
- La lista completa de atributos `new_*` está en `P:src/stores/useLegajoStore.ts` (`miLegajo`); se copia de ahí al construir, no de esta nota.
- Mapeo a la forma de la pantalla (`useMiLegajo`): campos de lista como `{ label, value }`, donde `label` sale de la anotación `@OData.Community.Display.V1.FormattedValue` y `value` del código. Ejemplos: `new_tipodocumento`, `estadoCivil`, `paisNacimiento`, `localidad`, `provincia`, `pais`, `segundaNacionalidad`, `generoSegunDni`, `vinculoEmergencia`, `tipoContratacion`, `unidadOrganizativa`, `new_nivel`.

## Escritura (verificado, `useLegajoStore.actualizacionLegajo`)

`PUT api/hrfactors/empleado` con Bearer, **sin reintentos**. Si no hay token o los datos están vacíos, no se envía. Payload:

| Campo del payload | Origen en el formulario | Regla |
|---|---|---|
| `new_empleadoid` | `user.empleadoid` | |
| `new_apellidos` | `new_apellidos` | `""` si falta |
| `new_nombredepila` | `new_nombredepila` | `""` si falta |
| `new_estadocivil` | `estadoCivil.value` | `Number(...)`, `0` si falta |
| `new_telefonomovil` | `telefonoMovil` | ver "Teléfono" |
| `new_paisnacimiento` | `paisNacimiento.value` | `""` si falta |
| `new_calle` | `calle` | |
| `new_nro` | `nroCalle` | `.toString()` |
| `new_piso` | `piso` | `.toString()` |
| `new_depto` | `depto` | `.toString()` |
| `new_localidad` | `localidad.value` | `""` si falta |
| `new_codigopostal` | `codigoPostal` | `.toString()` |
| `new_provincia` | `provincia.value` | |
| `new_segundanacionalidad` | `segundaNacionalidad.value` | |
| `new_pais` | `pais.value` | |
| `new_fechanacimiento` | `fechaNacimiento` | `YYYY-MM-DD`, `""` si falta |
| `new_emaildeemergencia` | `emailEmergencia` | |
| `new_nombredecontactodeemergencia` | `nombreEmergencia` | |
| `new_celulardeemergencia` | `celularEmergencia` | `.toString()` |
| `new_correoelectronicopersonal` | `email` | |
| `new_generosegundni` | `generoSegunDni.value` | `0` si falta |
| `new_tipodocumento` | `new_tipodocumento.value` | `0` si falta |
| `new_nrodocumento` | `numeroDocumento` | `.toString()` |
| `new_cuitcuil` | `new_cuitcuil` | `.toString()` |
| `new_vinculodecontacto` | `vinculoEmergencia.value` | `0` si falta |

Tras un guardado exitoso el portal **vuelve a leer** el legajo y los familiares.

## Teléfono (verificado)

- Se edita en tres campos: `telefonoMovilPais`, `telefonoMovilDdn` (código de área), `telefonoMovilNumero`. Solo dígitos.
- Al guardar se une como `` `+${pais} ${ddn} ${numero}` `` y se manda en `telefonoMovil`. Los tres campos auxiliares se eliminan del payload.
- Al leer, si el valor guardado empieza con `+` y tiene espacios, se parte por espacios. Si no, se formatea con `formatTelefono` (está en `page.tsx`) usando una lista de códigos de país de dos dígitos; el resto se trata como de tres.

## Valores de listas (verificado)

Tipo de documento: `100000000` D.N.I. Argentino, `100000003` D.E., `100000004` Pasaporte.

Estado civil: `100000001` Soltero/a, `100000000` Casado/a, `100000003` Viudo/a, `100000005` Separado/a de hecho, `100000002` Divorciado/a, `100000007` Conviviente.

Sexo según DNI: `100000000` Masculino, `100000001` Femenino, `100000002` X.

Vínculo de contacto de emergencia: `100000005` Madre, `100000000` Padre, `100000001` Hijo/a, `100000002` Hermano/a, `100000003` Cónyuge, `100000004` Otro.

Estados civiles que implican cónyuge: Casado/a (`100000000`) y Conviviente (`100000007`).

## Validaciones (verificado, esquema yup en `page.tsx`)

- Nombre y apellido: obligatorios, con `trim`.
- Tipo de documento: obligatorio.
- Nro. documento: si el tipo es D.E., Pasaporte o "Documento Extranjero" → solo letras y números, máximo 20; en otro caso → exactamente 8 dígitos. Al cambiar el tipo de documento se limpia el número.
- CUIT/CUIL: obligatorio, 11 dígitos sin guiones.
- Calle y número de calle: obligatorios (el número debe ser numérico).
- Código postal: obligatorio, letras y números, máximo 10, se muestra en mayúsculas.
- País y Provincia: obligatorios. Localidad: opcional pero admite `null`.
- Celular: país 2 a 3 dígitos, área 2 a 4, número 6 a 8; los tres obligatorios.
- Celular de emergencia: obligatorio, máximo 100 caracteres. Nombre de contacto: máximo 100 (con contador de caracteres).
- Email personal y email de emergencia: obligatorios, formato válido.
- Vínculo de emergencia y Sexo según DNI: obligatorios (admiten `null` para que el aviso salga en español).
- Fecha de nacimiento y estado civil: obligatorios.
- Mensaje al fallar: "Faltan completar campos obligatorios." y foco en el primer campo con error.

## Domicilio en cascada (verificado)

- País, provincias y localidades se cargan de catálogos (ver `cliente-http-y-endpoints.md`).
- Hooks: `useGetProvincias` mapea a `{ value: new_provinciaid, label: new_name }`; `useGetLocalidades` a `{ value: new_localidadid, label: new_name, provincia: _new_provincia_value }`.
- Las localidades se filtran en el cliente por provincia (`loc.provincia === provincia.value`). Al **cambiar** la provincia se limpia la localidad.

## Familia (verificado)

Solo se muestra si `esRelacionDependencia`. Si el estado civil pide cónyuge y la contratación no habilita Familia, se muestra un aviso explicativo y se puede guardar igual el cambio de estado civil.

Lectura (`getFamiliarXEmpleado`): `POST api/consultafetchs`, entidad `new_familiardeempleados`, `statecode = 0` y `new_empleado = <empleadoid>`. Atributos: `new_name`, `new_tipodocumento`, `new_nrodocumento`, `new_fechanacimiento`, `new_parentesco`, `new_empleado`, `new_familiardeempleadoid`, `new_tipodeparentesco`, `new_nombredepila`, `new_sexo`, `new_cargadefamilia`, `new_apellidos`, `new_adjunto`.

Clasificación (`useGetFamiliarXEmpleado`): `new_tipodeparentesco = 100000000` → cónyuge; `= 100000001` → hijo/a. `new_cargadefamilia = 100000000` significa "a cargo" (sí).

Escritura: `POST`, `PUT` y `DELETE api/hrfactors/familiarEmpleado` con Bearer. Payload de alta y edición: `new_empleado`, `new_nombredepila`, `new_apellidos`, `new_tipodocumento`, `new_nrodocumento`, `new_tipodeparentesco`, `new_sexo`, `new_cargadefamilia`, `new_fechanacimiento` (`YYYY-MM-DD`); la edición suma `new_familiardeempleadoid`. La baja manda `{ new_familiardeempleadoid }` en el body.

Reglas de negocio (`page.tsx`):

- Con relación de dependencia y estado civil Casado/a o Conviviente, **no se puede guardar sin cargar el cónyuge** ("Debe cargar los datos del cónyuge antes de actualizar.").
- Si el estado civil **deja de** requerir cónyuge y existe uno cargado, se pide confirmación antes de eliminarlo (se borra con su documentación; no se puede deshacer). La baja la dispara **únicamente** el cambio de estado civil, nunca el tipo de contratación.
- La pantalla avisa por `beforeunload` si se sale con cambios sin guardar (en mobile: confirmación al salir).

### Hijos/as (verificado, `ModalHijos.tsx`)

Modos del modal: `nuevo`, `editar`, `ver` (solo lectura, con botón "Editar datos").

Campos del formulario: `nombreFamiliar`, `apellidoFamiliar`, `tipoDocFamiliar`, `docFamiliar`, `fechaNacimiento`, `generoHijos`, `aCargo`.

Opciones: sexo `100000000` Masculino, `100000001` Femenino, `100000002` X. A cargo: `100000000` "Si" (booleano true), `100000001` "No" (false). Tipo de documento: `100000000` "D.N.I. Argentino", `100000003` "D.E.", `100000004` "Pasaporte". `tipoParentesco` fijo `{ value: 100000001, label: "Hijo/a" }`.

Validaciones: nombre ("El nombre del hijo es obligatorio") y apellido ("El apellido del hijo es obligatorio") con trim; tipo de documento ("El tipo de documento es obligatorio"); número: si el tipo es "D.E.", "Pasaporte" o "Documento Extranjero" → letras y números, máximo 20 ("Solo letras y números", "Máximo 20 caracteres"); en otro caso → solo dígitos y exactamente 8 ("Solo debe contener números", "Debe contener exactamente 8 dígitos"); obligatorio ("El número de documento es obligatorio"); sexo ("El sexo es obligatorio"); a cargo ("Debe indicar si el hijo está a cargo"); fecha de nacimiento obligatoria y anterior a hoy ("La fecha de nacimiento del hijo es obligatoria", "La fecha de nacimiento debe ser anterior a hoy"). El número se muestra en mayúsculas; al cambiar el tipo en modo nuevo se limpia el número.

Fecha: al editar llega como `DD/MM/YYYY` y se convierte a fecha local a las 12:00 (años de 2 dígitos: mayor que 70 → 19xx, si no 20xx).

Flujo de guardado:

- **Nuevo**: `cargarFamiliarXEmpleado` → si anda, relee familiares, y **5 segundos después** relee los documentos por familiar (el backend genera los registros de documentación con demora); mensajes "Guardando datos del hijo...", "Datos del hijo guardados correctamente.", "Error al guardar los datos del hijo.".
- **Editar**: `actualizarFamiliarEmpleado` con `id` → relee familiares y documentos (sin demora); "Actualizando datos del hijo...", "Datos del hijo actualizados correctamente.", "Error al actualizar los datos del hijo.".
- En ambos casos, al terminar bien se llama `onOperationSuccess` y se cierra.

Textos de la vista: "A cargo" / "No declarado a cargo"; "Se solicitará comprobante" (a cargo) y "No genera carga fiscal de Ganancias" (no a cargo); ayuda del campo: "Marcá esta opción para incluir al hijo/a como carga familiar de Ganancias."; opciones "Sí, a cargo" / "No, sólo informativo".

### Cónyuge

`ModalConyuge.tsx` se leyó; su detalle de campos se vuelve a leer en el portal al construir esa parte (ver PENDIENTES).

### Documentación de familiares (verificado)

- Lectura (`getDocumentosPorFamiliar`): registros de `new_documentacionporfamiliardeempleado` con alias `ad.new_tipodeparentesco`.
- **Hijos**: solo se listan tres documentos, comparando el nombre normalizado (sin tildes, mayúsculas, espacios colapsados), en este orden: `CERTIFICADO UNICO DE DISCAPACIDAD` (1), `DNI DORSO` (2), `DNI FRENTE` (3). Se ordena por nombre del familiar y luego por ese orden.
- **Cónyuge**: sin filtro por tipo de documento; se ordena por nombre del documento.
- Cada fila: `id` (`new_documentacionporfamiliardeempleadoid`), `nombre` (`new_name`), `nombreFamiliar` (formatted value de `_new_familiardeempleado_value`), `familiarId`, `cargoDoc` (`new_adjunto === true` → "SÍ", si no "NO").
- Columnas de documentos: acciones (ver adjuntos, cargar archivo), título, hijo/a (solo hijos), "Documento importado" (check verde si cargó o hay marca temporal; si no, ícono sin documento).
- Carga: se arma `FormData` con los archivos en el campo `file` y se llama `cargarAdjuntosPorFamiliares(token, <id de la fila>, form)` (`POST api/hrfactors/adjuntosolicitud?...`, multipart, Bearer). Si falla, se informa error; si anda, se relee la lista de documentos. Tras cargar, el portal marca el documento como cargado en forma temporal (store y sessionStorage) hasta que el backend lo refleje; en mobile corresponde estado local equivalente.
- Ver adjuntos: `getAdjuntosXFamiliarXEmpleado(token, empleadoid, id)`; cada archivo se mapea a `{ id: annotationid, nombre/filename, notetext, mimetype, documentbody (base64), createdon }`, con `createdon` pasado de UTC a hora local `DD/MM/YYYY HH:mm`.
- Previsualización (`ModalPrevisualizarDoc`, `P:src/@core/utils/archivos.ts`): PDF (visor), imagen (jpg, jpeg, png, gif, webp, bmp) o, para otros formatos, aviso "Los archivos <TIPO> no se pueden previsualizar" con botón de descarga; muestra el tipo (extensión en mayúsculas) y el peso (B, KB, MB, estimado desde el base64 si falta). Mensaje si falla: "No se pudo abrir el documento..." / "No se pudo abrir la imagen..."; si no hay contenido al descargar: "El documento no tiene contenido para descargar."
- Textos del modal de carga: "Documento requerido", "Archivos seleccionados (n)", "Quitar todo", "Cargar archivos" / "Cargando…".

## Otras funciones del store de legajo (fuera de esta pantalla)

`documentosEmpleado`, `cargarAdjuntoLegajoEmpleado`, `cargarAdjuntosTitulos`, `getAdjuntosXEmpleado`, `getNotificacionesEmpleado`, `getActividadesDeExtension`. Pertenecen a Documentación del legajo, Notificaciones y Extensión: **no entran en Datos personales** salvo que se confirme.

## Falta leer

- `ModalConyuge`: campos exactos al construir.
- `FileUploaderMultiple`: tipos de archivo y tamaño máximo.
- `CustomTextField`, `CustomSearchSelect`, `CustomDateField`: comportamiento (la UI se hace con patrones RN).
- `getAdjuntosXFamiliarXEmpleado` y `cargarAdjuntosPorFamiliares` en el store: URL exacta y parámetros (hoy solo se conoce la forma de uso).
