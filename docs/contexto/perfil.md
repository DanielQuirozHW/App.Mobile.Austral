# Perfil (Formación y Trayectoria profesional)

Contrato y reglas de las dos páginas de Perfil, leídas en `HW-Austral/Portal-Austral-Dev`. Lo verificado está separado de lo inferido al final.

## Acceso

- El menú Perfil está en `menuBase` y lo ven todos los roles (`src/navigation/vertical/index.tsx`). En la app: `Formacion` y `Trayectoria` se registran para cualquier persona con sesión.

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

## Estructura en la app

`domain/perfil/{comun,formacionOpciones,formacion,formacionValidacion,trayectoriaOpciones,trayectoria,trayectoriaValidacion}.ts`; `infrastructure/perfil/{perfilApi,formacionApi,trayectoriaApi}.ts`; `application/perfil/{formacionService,trayectoriaService}.ts`; stores `formacionStore` y `trayectoriaStore`; componentes en `presentation/components/perfil/` (`SeccionRegistros` genérico, `ModalPerfil` con confirmación al cerrar con cambios, un modal por sección); pantallas `screens/perfil/FormacionScreen.tsx` y `TrayectoriaScreen.tsx`.

## Diferencias conscientes con el portal

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

## Inferido o sin confirmar (revisar)

- Mensajes de validación de la formación posdoctoral (el portal no los tiene verificados): se tomaron los de posgrado adaptados.
- Dos especialidades (códigos 100000019 y 100000020) se llaman "Elemento" en el portal; se conservan así porque no se conocen los nombres reales.
- `new_validado` se lee en pregrado pero no se muestra.
- Consultorías: si no se elige Sí / No, se envía `true` (comportamiento del portal).
- Orden de las listas que el portal no especifica: `createdon` ascendente.
- Rótulos de las tarjetas de lista (el portal usa grillas): adaptación propia.
- Texto exacto del diálogo de cierre con cambios sin guardar: propio.
- Campo de empleado en las consultas de Trayectoria (`new_empleadoid`) tomado de las lecturas del portal.

## Falta (Perfil completo del portal)

Extensión, Gestión académica, Docencia (categorización, nombramientos, promoción, docencia, asesoramiento) e Investigación (perfil / afiliaciones, actividad I+D, resultados e impacto). No se construyen hasta que Daniel lo confirme.
