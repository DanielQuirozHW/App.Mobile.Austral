# Perfil

Contrato y reglas de las páginas de Perfil, leídas en `HW-Austral/Portal-Austral-Dev`. Lo verificado está separado de lo inferido. Formación y Trayectoria están detalladas abajo; Extensión, Gestión académica, Docencia, Afiliaciones y Actividad I+D tienen su resumen y la lista de lo que falta documentar con más detalle (ver `PENDIENTES.md`).

## Acceso

- El menú Perfil está en `menuBase` y lo ven todos los roles (`src/navigation/vertical/index.tsx`). En la app: las pantallas de Perfil se registran para cualquier persona con sesión.

## Formación (`src/app/(dashboard)/perfil/formacion/page.tsx` y `perfil/_components/formacion/*`)

- Tarjeta superior: "Máximo Nivel de Formación" (calculado) y "Título de Educación Básica". Guardar: `PUT api/hrfactors/empleado` con `{ new_tituloseducacionbasica, new_empleadoid }` y relectura.
- Máximo nivel: el más alto entre títulos de pregrado/grado y posgrado con estado Finalizado (Doctorado > Maestría > Especialización > Grado > Pregrado); sin títulos, "Secundario" si la educación básica es secundario completo y "N/A" en otro caso. La formación posdoctoral no cuenta. Implementado en `domain/perfil/formacion.ts` (`calcularNivelMaximo`).
- Siete secciones, en este orden: título de pregrado/grado; título de posgrado; especialidad certificada por organismo/s de salud; certificaciones / capacitaciones; idioma; formación posdoctoral; áreas de expertise (hasta 4).
- Lecturas: FetchXML por empleado (`statecode = 0`). Títulos: entidad `new_universidadporcontacto` filtrada por `new_tipodecarrera` (pregrado `in 100000001, 100000006`; posgrado `in 100000002, 100000004, 100000003`; posdoctoral `eq 100000000`), orden `createdon desc`. Constancias: entidad `annotation` con `link-entity` a `new_universidadporcontacto` (alias `aj`).
- Escrituras (`POST / PUT / DELETE`): `hrfactors/titulosgradoposgrado`, `hrfactors/especialidadcertificadosalud`, `hrfactors/certificacion`, `hrfactors/idioma`, `hrfactors/areasdeexpertise`. Constancias: `POST hrfactors/adjuntosolicitud?educacionFormal_id={id}` (multipart).
- Los años de título se envían como el portal: `dayjs(new Date(año, 0, 2)).utcOffset(180).format("YYYY-MM-DDTHH:mm:ssZ")` (`anioAFechaApi`).
- Reglas de validación y mensajes: en `domain/perfil/formacionValidacion.ts`, copiados de los modales del portal.

## Trayectoria profesional (`perfil/trayectoria/page.tsx` y `perfil/_components/trayectoria/*`)

- Tarjeta superior: "Link LinkedIn". Guardar: `PUT api/hrfactors/empleado` con `{ new_linklinkedin, new_linkresearchgate (valor cargado), new_empleadoid }`.
- Cinco secciones: experiencia laboral fuera del ámbito académico (`hrfactors/experienciafuera`); consultorías externas (`hrfactors/consultoriaexterna`); comités profesionales o técnicos (`hrfactors/comiteprofesional`); licencia profesional / membresías / asociaciones (`hrfactors/licprofmembresia`); reconocimientos profesionales (`hrfactors/reconocimientos-profesionales`, única ruta con payload en camelCase).

## Extensión y Gestión académica

Construidas (decisión 64). Código: `domain/perfil/{extension,gestionAcademica}.ts`, `infrastructure/perfil/{extensionApi,gestionAcademicaApi}.ts`, `application/perfil/{extensionService,gestionAcademicaService}.ts`, stores `extensionStore` y `gestionAcademicaStore`, pantallas `ExtensionScreen` y `GestionAcademicaScreen`, y los modales `ModalExtension`, `ModalCargoGestion`, `ModalEncargoGestion` y `ModalCargoEncargoExterno`. El contrato detallado (rutas, payloads y reglas) queda por documentar acá: hoy se lee en ese código, que cita los archivos del portal de donde sale.

## Docencia

Construida (decisiones 64 y 66). Código: `domain/perfil/docencia.ts`, `infrastructure/perfil/docenciaApi.ts`, `application/perfil/docenciaService.ts`, `docenciaStore`, `DocenciaScreen` y modales de docencia en la UA, docencia externa, asesoramiento y jurado.

Verificado: Categorización, Nombramientos y Promoción son de solo lectura; el PUT de docencia manda también `new_otronivel`; los campos "Otro" solo se envían si la opción elegida es esa; fechas `YYYY-MM-DDTHH:mm:ss+03:00` con la hora fija 06:00 (`diaADocenciaApi`); Postulación no se migra.

## Investigación

Una sola pantalla, `InvestigacionScreen`, con tres secciones (decisión 65).

### Afiliaciones

Construida. Código: `domain/perfil/afiliaciones.ts`, `afiliacionesApi`, `afiliacionesService`, `afiliacionesStore`, `InvestigacionAfiliaciones`, `FormInvPerfil`, `FormInvCategoriaExterna`, `FormInvCategoriaPrinuar`, `ModalPertenencia`. Verificado: el certificador de unidad se valida pero no se envía; los históricos son de solo lectura.

### Actividad I+D

Construida. Código: `domain/perfil/{proyectos,resultadosProyecto,financiamientos,formacionRrhh}.ts`, `infrastructure/perfil/{proyectosApi,actividadApi}.ts`, `application/perfil/{proyectosService,actividadService}.ts`, `proyectosStore`, `actividadStore`, `InvestigacionActividad` y los modales `ModalProyecto`, `ModalParticipante`, `ModalFinanciamientoPropio`, `ModalFinanciamientoExterno`, `ModalTesista`, `ModalDireccion`, `ModalVincularResultado`, `ModalMasInfoResultado`.

- Proyecto de investigación: lecturas con el endpoint singular de consultas; propios (con la participación del usuario en el alias `ac`) y como participante (join interno, alias `af`). Participantes con respuesta (aceptar o rechazar la invitación).
- Resultados vinculados a un proyecto, siete tipos (`CONFIG_RESULTADOS` en `domain/perfil/resultadosProyecto.ts`): producción científica, financiamiento propio de la UA, financiamiento externo a la UA, tesistas, dirección de investigadores y/o becarios, jornadas / congresos y estancias. Cada vinculación guarda quién la hizo ("Apellidos, Nombre") y solo esa persona puede editarla o eliminarla. Los sufijos de endpoint de financiamientos llevan el typo del backend ("Financiaminet"), que se mantiene.
- "Más info" (decisión 74): abre el modal de solo lectura del registro vinculado, leído por id.

### Resultados / Impacto I+D

Construida (decisiones 70 a 73). Portal: `src/app/(dashboard)/perfil/investigacion/resultados-impacto-i+d/{produccion-cientifica,participacion-jornadas,estancias}/page.tsx`; modales en `perfil/_components/investigacion/resultados-impacto-i+d/*`; hooks `hooks/investigacion-perfil/{useCargarEditarFormacionEstancias,useCargarEditarParticipacionJornadas,useCargaEditarProduccionCientifica,useGetEstancias,useGetParticipaciones}`; store `store/useInvestigacionDocenciaStore.ts`.

En la app: `domain/perfil/{resultados,produccionCientifica}.ts`, `infrastructure/perfil/resultadosApi.ts`, `application/perfil/resultadosService.ts`, `resultadosStore`, `InvestigacionResultados`, `SeccionProducciones`, `ModalProduccion`, `AutoresDeProduccion`, `ModalAutor`, `ModalJornada` y `ModalEstancia`. Las rutas de escritura están en `config/api/endpoints.ts` (`estancias`, `participacionJornadas`, `produccionCientifica`, `produccionCientificaEliminar`, `autoresProduccion`, `autoresProduccionEliminar`); la baja va a los endpoints `/eliminar`.

Verificado en el portal:

- Estancias: lectura de `new_estanciases` por `new_colaborador`, orden `createdon desc`. Tipo de actividad opcional; "Otros" exige especificarlo; institución obligatoria (máximo 100); país obligatorio; fecha de inicio obligatoria y no posterior a la de fin.
- Participación en jornadas: lectura de `new_participacioneneventosycongresoses`. Obligatorios: nombre, tipo de actividad, lugar, tipo de participación y fecha; "Otro" exige especificarlo; máximo 100 caracteres en los textos.
- Producción científica: trece tipos de material (`TIPO_MATERIAL`), campos por tipo (`CAMPOS_POR_TIPO`), estados de participante (pendiente 100000001, aprobado 100000002, rechazado 100000003, baja 100000004, inactivo 2). Lecturas: propias, y como autor (join interno con `new_participantesdeproduccioncientifica` filtrado por el colaborador).
- Autores: alta, edición y baja contra `autoresProduccion`; permisos de las acciones según decisión 71.

Inferido (decisiones 72 y 73): formato de fechas, campos que no se envían, lecturas sin el link-entity externo, limpieza de campos al cambiar de tipo, bloqueo de "Publicar" si los autores no cargaron, y los textos propios.

## Estructura común en la app

`domain/perfil/comun.ts` (fechas del CRM, años, Sí / No, helpers yup); `infrastructure/perfil/perfilApi.ts` (lectura por empleado, escritura, subida); componentes en `presentation/components/perfil/` (`SeccionRegistros` genérico, `ModalPerfil` con confirmación al cerrar con cambios, `CamposComunes`, un modal por sección); pantallas en `presentation/screens/perfil/`.

## Diferencias conscientes con el portal (Formación y Trayectoria)

1. Las constancias de los títulos se listan sin `documentbody`; el contenido se pide al abrirlas (el portal trae todo).
2. Una respuesta que no es un array nunca pisa lo que ya estaba; se muestra "Reintentar".
3. El modal no se cierra tocando el fondo con cambios sin guardar sin pedir confirmación (el portal no cierra con el fondo).
4. Selectores de año con rango 1925 a hoy; selects Sí / No con valores de texto `'true'` / `'false'`.
5. Texto con solo espacios se rechaza en los campos obligatorios.
6. La licencia profesional pide mes y año: en la app se elige una fecha y solo se usa mes y año (se envía el día 2 del mes).
7. La experiencia fuera del ámbito académico lee también `new_sectorindustriaotro` (el portal no lo pide al leer y por eso no lo muestra al editar).
8. El portal rotula "Eje formativo" una columna que imprime el origen; la app muestra Origen y Eje formativo por separado.
9. En reconocimientos, el error de baja dice "reconocimiento" (el portal dice "comité").
10. El idioma "otro" solo se envía si el idioma elegido es Otro.

## Inferido o sin confirmar en Formación y Trayectoria (revisar)

- Mensajes de validación de la formación posdoctoral (el portal no los tiene verificados): se tomaron los de posgrado adaptados.
- Dos especialidades (códigos 100000019 y 100000020) se llaman "Elemento" en el portal; se conservan así porque no se conocen los nombres reales.
- `new_validado` se lee en pregrado pero no se muestra.
- Consultorías: si no se elige Sí / No, se envía `true` (comportamiento del portal).
- Orden de las listas que el portal no especifica: `createdon` ascendente.
- Rótulos de las tarjetas de lista (el portal usa grillas): adaptación propia.
- Texto exacto del diálogo de cierre con cambios sin guardar: propio.
- Campo de empleado en las consultas de Trayectoria (`new_empleadoid`) tomado de las lecturas del portal.

## Falta

- Plan de Trabajo (`/planes-de-trabajo`, solo docente): es la siguiente etapa.
- Documentar acá el contrato detallado de Extensión, Gestión académica, Docencia, Afiliaciones y Actividad I+D (hoy está en el código).
- Otros módulos del portal (Documentación, GDD, Indicadores, funciones SA / VRAA, Referente MATHU, notificaciones, Promoción > Postulación): no se construyen hasta que Daniel lo confirme.
