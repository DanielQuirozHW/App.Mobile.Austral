# Módulo Datos personales

Sale del código del portal. `P` = HW-Austral/Portal-Austral-Dev. Alcance: **todo el módulo**, migrado completo.

Fuentes principales: `P:src/app/(dashboard)/legajo/datos-personales/page.tsx`, `P:src/stores/useLegajoStore.ts`, `P:src/hooks/useMiLegajo.ts`, `P:src/hooks/useActualizarLegajo.ts`, `P:src/hooks/useGetFamiliarXEmpleado.ts`.

## Acceso (verificado)

- La pantalla se protege con `ProtectedRoute allowedRoles={["docente", "codocente"]}`.
- Necesita `token` (API) y `user.empleadoid` (de la sesión). Mientras no estén listos el legajo y los datos iniciales, muestra un estado de carga.

## Secciones de la pantalla (verificado)

1. **Identidad**: Apellido(s), Nombre(s), Sexo, Tipo de documento, Nro. documento, CUIT/CUIL, Estado civil, País de nacimiento, Fecha de nacimiento, Segunda nacionalidad.
2. **Contacto**: Celular personal (país, código de área, número) y Email personal.
3. **Domicilio real**: Calle, Nro., Piso, Depto/lote, Código postal, País, Provincia, Localidad.
4. **Familia** (solo si el tipo de contratación es relación de dependencia): Cónyuge, Hijos/as y su documentación.
5. **Contacto de emergencia**: Nombre, Celular, Email, Vínculo. Es la sección 4 si no hay Familia y la 5 si hay.

## Lectura (verificado, `useLegajoStore.miLegajo`)

- `POST api/consultafetchs` con `{ entidad: "new_empleados", fetch }` y FetchXML sobre `new_empleado`, filtrado por `statecode = 0` y `new_empleadoid = <empleadoid>`. Con `reintentarVacio: true, reintentos: 3`.
- Un cuerpo no-array es fallo transitorio: se marca error y se avisa "No pudimos cargar tus datos"; **no** se pisa el legajo previo.
- El FetchXML pide una lista larga de atributos `new_*`. La lista completa está en `P:src/stores/useLegajoStore.ts` (`miLegajo`); copiarla de ahí al construir, no de esta nota.
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
| `new_fechanacimiento` | `fechaNacimiento` | `YYYY-MM-DD` (dayjs), `""` si falta |
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

## Valores de listas (verificado, `page.tsx`)

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
- Las localidades se filtran en el cliente por provincia (`loc.provincia === provincia.value`). Al **cambiar** la provincia se limpia la localidad.

## Familia (parcialmente verificado)

Solo se muestra si el tipo de contratación es relación de dependencia (`esRelacionDependencia`, ver "No leído"). Si el estado civil pide cónyuge y la contratación no habilita Familia, se muestra un aviso explicativo y se puede guardar igual el cambio de estado civil.

Lectura (`getFamiliarXEmpleado`): `POST api/consultafetchs`, entidad `new_familiardeempleados`, `statecode = 0` y `new_empleado = <empleadoid>`. Atributos: `new_name`, `new_tipodocumento`, `new_nrodocumento`, `new_fechanacimiento`, `new_parentesco`, `new_empleado`, `new_familiardeempleadoid`, `new_tipodeparentesco`, `new_nombredepila`, `new_sexo`, `new_cargadefamilia`, `new_apellidos`, `new_adjunto`.

Clasificación (`useGetFamiliarXEmpleado`): `new_tipodeparentesco = 100000000` → cónyuge; `= 100000001` → hijo/a. `new_cargadefamilia = 100000000` significa "a cargo" (sí): el documento es obligatorio; si no, sugerido.

Escritura: `POST`, `PUT` y `DELETE api/hrfactors/familiarEmpleado` con Bearer. Payload de alta y edición: `new_empleado`, `new_nombredepila`, `new_apellidos`, `new_tipodocumento`, `new_nrodocumento`, `new_tipodeparentesco`, `new_sexo`, `new_cargadefamilia`, `new_fechanacimiento` (`YYYY-MM-DD`); la edición suma `new_familiardeempleadoid`. La baja manda `{ new_familiardeempleadoid }` en el body.

Reglas de negocio (comentarios y lógica de `page.tsx`):

- Con relación de dependencia y estado civil Casado/a o Conviviente, **no se puede guardar sin cargar el cónyuge** ("Debe cargar los datos del cónyuge antes de actualizar.").
- Si el estado civil **deja de** requerir cónyuge y existe uno cargado, se pide confirmación antes de eliminarlo (se borra con su documentación; la acción no se puede deshacer). La baja la dispara **únicamente** el cambio de estado civil, nunca el tipo de contratación (comentario del código: antes lo hacía y borraba datos sin avisar).
- La pantalla avisa por `beforeunload` si se sale con cambios sin guardar (en mobile corresponde a una confirmación al salir; decisión de diseño).

Documentación de familiares:

- Lectura por familiar: entidad `new_documentacionporfamiliardeempleados`, y los archivos como `annotations` (`filename`, `mimetype`, `documentbody`, `createdon`) enlazadas a `new_familiardeempleado` o `new_documentacionporfamiliardeempleado`.
- Carga: `POST api/hrfactors/adjuntosolicitud?familiardeempleado_id=<id>` o `...?documentacionporfamiliardeempleado=<id>`, multipart/form-data, con Bearer.

## Otras funciones del store de legajo (fuera de esta pantalla, verificado que existen)

`documentosEmpleado`, `cargarAdjuntoLegajoEmpleado`, `cargarAdjuntosTitulos`, `getAdjuntosXEmpleado`, `getNotificacionesEmpleado`, `getActividadesDeExtension`. Pertenecen a Documentación del legajo, Notificaciones y Extensión: **no entran en Datos personales** salvo que se confirme.

## No leído todavía (pendiente de leer antes de construir)

- `P:src/configs/tipoContratacion.ts` (`esRelacionDependencia`, `contratacionIndeterminada`): define cuándo se habilita Familia.
- Modales: `ModalConyuge`, `ModalHijos`, `ModalCargarDocumentos`, `ModalVerDocumentosFamiliar` (campos, validaciones y flujos reales).
- `RowOptionsHijos` y las columnas (`columnsConyuge`, `columnsHijos`, `columnsDocumentosLegajo`).
- Hooks `useGetDocumentosPorFamiliar`, `useGetProvincias`, `useGetLocalidades`, `useGetPaises` (detalle) y `useAdjuntosHandler`.
- `LegajoPageHeader` y `UserProfileBanner` (encabezado y banner del legajo).
- Qué tipos de archivo y tamaños aceptan los adjuntos.
