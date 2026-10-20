// Flujos de Perfil > Investigación > Actividad I+D > Proyectos de investigación (proyecto, participantes y resultados
// vinculados). Los toasts los muestran los modales y la pantalla.
import type { Fila } from '../../domain/perfil/comun';
import {
  mapearFinanciamientosExternos,
  mapearFinanciamientosPropios,
  type FinanciamientoExterno,
  type FinanciamientoPropio,
} from '../../domain/perfil/financiamientos';
import {
  mapearDirecciones,
  mapearTesistas,
  type DireccionBecario,
  type Tesista,
} from '../../domain/perfil/formacionRrhh';
import {
  armarPayloadParticipante,
  armarPayloadProyecto,
  armarPayloadRespuesta,
  combinarProyectos,
  mapearActuaciones,
  mapearAgrupadores,
  mapearAreas,
  mapearColaboradores,
  mapearParticipantes,
  mapearProyectos,
  mapearUnidades,
  type FormularioParticipante,
  type FormularioProyecto,
  type Participante,
  type Proyecto,
} from '../../domain/perfil/proyectos';
import {
  armarPayloadResultado,
  configDeResultado,
  mapearOpcionesDeResultado,
  mapearResultadosVinculados,
  nombreDelVinculador,
  type OpcionDeResultado,
  type ResultadoVinculado,
  type TipoResultado,
} from '../../domain/perfil/resultadosProyecto';
import {
  ATRIBUTOS_DIRECCION,
  ATRIBUTOS_EXTERNO,
  ATRIBUTOS_PROPIO,
  ATRIBUTOS_TESISTA,
  leerColaboradoresActivos,
} from '../../infrastructure/perfil/actividadApi';
import {
  escribirParticipante,
  escribirProyecto,
  escribirResultado,
  leerActuaciones,
  leerAgrupadores,
  leerAreasDeInteres,
  leerOpcionesDeResultado,
  leerParticipantesDeProyecto,
  leerProyectosComoParticipante,
  leerProyectosPropios,
  leerRegistroPorId,
  leerResultadosVinculados,
  leerUnidadesOrganizativas,
} from '../../infrastructure/perfil/proyectosApi';
import { useAuthStore } from '../../presentation/stores/authStore';
import { useLegajoStore } from '../../presentation/stores/legajoStore';
import { useProyectosStore } from '../../presentation/stores/proyectosStore';

export const MSG_ERROR_CARGA_PROYECTOS = 'No pudimos cargar tus proyectos de investigación. Por favor, volvé a intentar.';

const empleadoIdActual = (): string => {
  const id = useAuthStore.getState().user?.empleadoid;
  if (!id) throw new Error('No hay un empleado en sesión.');
  return id;
};

/** Un 200 vacío tras los reintentos NO es "sin datos": se trata como fallo y se conserva lo que ya había. */
const filasOFallar = (filas: unknown): Fila[] => {
  if (!Array.isArray(filas)) throw new Error(MSG_ERROR_CARGA_PROYECTOS);
  return filas as Fila[];
};

const store = () => useProyectosStore.getState();

// --- Lecturas ---

const cargarListaDeProyectos = async (): Promise<void> => {
  const empleadoId = empleadoIdActual();
  const [propias, comoParticipante] = await Promise.all([
    leerProyectosPropios(empleadoId),
    leerProyectosComoParticipante(empleadoId),
  ]);
  const propios = mapearProyectos(filasOFallar(propias), 'ac', empleadoId);
  const participando = mapearProyectos(filasOFallar(comoParticipante), 'af', empleadoId);
  store().fijar({ proyectos: combinarProyectos(propios, participando) });
};

/** Los catálogos se leen una sola vez por sesión de la pantalla. */
const cargarCatalogos = async (): Promise<void> => {
  const tareas: Promise<void>[] = [];
  if (store().colaboradores.length === 0) {
    tareas.push(
      leerColaboradoresActivos().then((r) => store().fijar({ colaboradores: mapearColaboradores(filasOFallar(r)) })),
    );
  }
  if (store().unidades.length === 0) {
    tareas.push(
      leerUnidadesOrganizativas().then((r) => store().fijar({ unidades: mapearUnidades(filasOFallar(r)) })),
    );
  }
  if (store().agrupadores.length === 0) {
    tareas.push(leerAgrupadores().then((r) => store().fijar({ agrupadores: mapearAgrupadores(filasOFallar(r)) })));
  }
  if (store().areas.length === 0) {
    tareas.push(leerAreasDeInteres().then((r) => store().fijar({ areas: mapearAreas(filasOFallar(r)) })));
  }
  if (store().actuaciones.length === 0) {
    tareas.push(leerActuaciones().then((r) => store().fijar({ actuaciones: mapearActuaciones(filasOFallar(r)) })));
  }
  await Promise.all(tareas);
};

/** Lo que lee la pestaña al abrirse: la lista de proyectos y los catálogos de los formularios. */
export const cargarProyectos = async (): Promise<void> => {
  store().fijarEstado({ cargando: true, error: false });
  const resultados = await Promise.allSettled([cargarListaDeProyectos(), cargarCatalogos()]);
  store().fijarEstado({
    cargando: false,
    cargado: true,
    error: resultados.some((r) => r.status === 'rejected'),
  });
};

// --- Proyecto ---

export const guardarProyecto = async (datos: FormularioProyecto, existente?: Proyecto): Promise<void> => {
  const cuerpo = armarPayloadProyecto(datos, existente);
  await escribirProyecto(existente ? 'put' : 'post', empleadoIdActual(), existente?.id, cuerpo);
  await cargarListaDeProyectos();
};

export const eliminarProyecto = async (id: string): Promise<void> => {
  await escribirProyecto('delete', empleadoIdActual(), id);
  await cargarListaDeProyectos();
};

// --- Participantes ---

export const cargarParticipantes = async (proyectoId: string): Promise<Participante[]> =>
  mapearParticipantes(filasOFallar(await leerParticipantesDeProyecto(proyectoId)));

export const guardarParticipante = async (
  datos: FormularioParticipante,
  proyectoId: string,
  id?: string,
): Promise<void> => {
  await escribirParticipante(id ? 'put' : 'post', armarPayloadParticipante(datos, proyectoId, empleadoIdActual(), id));
};

export const eliminarParticipante = async (id: string): Promise<void> => {
  await escribirParticipante('delete', { new_participantesproyectoid: id });
};

/**
 * El usuario acepta o rechaza su invitación a un proyecto. El portal manda el participante completo con el estado
 * elegido; si no se puede leer, manda solo el id y el estado.
 */
export const responderParticipacion = async (proyecto: Proyecto, statuscode: number): Promise<void> => {
  let cuerpo: Record<string, unknown> = { new_participantesproyectoid: proyecto.participanteId, statuscode };
  try {
    const participantes = await cargarParticipantes(proyecto.id);
    const propio = participantes.find((p) => p.id === proyecto.participanteId);
    if (propio) cuerpo = armarPayloadRespuesta(propio, statuscode);
  } catch {
    // Queda el cuerpo mínimo.
  }
  await escribirParticipante('put', cuerpo);
  await cargarListaDeProyectos();
};

// --- Resultados vinculados ---

export const cargarResultados = async (tipo: TipoResultado, proyectoId: string): Promise<ResultadoVinculado[]> => {
  const config = configDeResultado(tipo);
  return mapearResultadosVinculados(config, filasOFallar(await leerResultadosVinculados(config, proyectoId)));
};

/** Opciones para vincular: los registros del usuario y los de todos los participantes del proyecto. */
export const cargarOpcionesDeResultado = async (
  tipo: TipoResultado,
  participantes: Participante[],
): Promise<OpcionDeResultado[]> => {
  const config = configDeResultado(tipo);
  const ids = [
    empleadoIdActual(),
    ...participantes.map((p) => (p.participante.value ? String(p.participante.value) : '')),
  ];
  return mapearOpcionesDeResultado(config, filasOFallar(await leerOpcionesDeResultado(config, ids)));
};

/** "Apellidos, Nombre" del usuario (del legajo; si todavía no está cargado, el nombre completo de la sesión). */
const vinculadorActual = (): string => {
  const legajo = useLegajoStore.getState().legajo;
  if (legajo?.new_apellidos || legajo?.new_nombredepila) {
    return nombreDelVinculador(legajo?.new_apellidos, legajo?.new_nombredepila);
  }
  return useAuthStore.getState().user?.fullname ?? '';
};

export const guardarResultado = async (
  tipo: TipoResultado,
  tituloId: string,
  proyectoId: string,
  id?: string,
): Promise<void> => {
  const config = configDeResultado(tipo);
  const cuerpo = armarPayloadResultado(config, tituloId, vinculadorActual(), proyectoId, id);
  await escribirResultado(config, id ? 'put' : 'post', cuerpo);
};

export const eliminarResultado = async (tipo: TipoResultado, id: string): Promise<void> => {
  const config = configDeResultado(tipo);
  await escribirResultado(config, 'delete', { [config.idAttr]: id });
};

// --- Más info de un resultado vinculado ---

export type MasInfoResultado =
  | { visor: 'propio'; item: FinanciamientoPropio }
  | { visor: 'externo'; item: FinanciamientoExterno }
  | { visor: 'tesistas'; item: Tesista }
  | { visor: 'direccion'; item: DireccionBecario };

/**
 * Lee el registro vinculado (por su id) para abrirlo en su modal de solo lectura. Devuelve null si ese tipo todavía no
 * tiene visor en la app o si el registro ya no existe.
 */
export const cargarMasInfo = async (tipo: TipoResultado, guid: string): Promise<MasInfoResultado | null> => {
  const config = configDeResultado(tipo);
  switch (config.visor) {
    case 'propio': {
      const filas = filasOFallar(
        await leerRegistroPorId(
          'new_financiamientopropiodelauas',
          'new_financiamientopropiodelaua',
          'new_financiamientopropiodelauaid',
          ATRIBUTOS_PROPIO,
          guid,
        ),
      );
      const item = mapearFinanciamientosPropios(filas)[0];
      return item ? { visor: 'propio', item } : null;
    }
    case 'externo': {
      const filas = filasOFallar(
        await leerRegistroPorId(
          'new_financiamientoexternoalauas',
          'new_financiamientoexternoalaua',
          'new_financiamientoexternoalauaid',
          ATRIBUTOS_EXTERNO,
          guid,
        ),
      );
      const item = mapearFinanciamientosExternos(filas)[0];
      return item ? { visor: 'externo', item } : null;
    }
    case 'tesistas': {
      const filas = filasOFallar(
        await leerRegistroPorId(
          'new_formaciontesistases',
          'new_formaciontesistas',
          'new_formaciontesistasid',
          ATRIBUTOS_TESISTA,
          guid,
        ),
      );
      const item = mapearTesistas(filas)[0];
      return item ? { visor: 'tesistas', item } : null;
    }
    case 'direccion': {
      const filas = filasOFallar(
        await leerRegistroPorId(
          'new_direcciondeinvestigadoresbecarioses',
          'new_direcciondeinvestigadoresbecarios',
          'new_direcciondeinvestigadoresbecariosid',
          ATRIBUTOS_DIRECCION,
          guid,
        ),
      );
      const item = mapearDirecciones(filas)[0];
      return item ? { visor: 'direccion', item } : null;
    }
    default:
      return null;
  }
};
