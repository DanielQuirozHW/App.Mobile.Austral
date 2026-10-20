// Flujos de Perfil > Investigación > Resultados / Impacto I+D (producción científica, jornadas y estancias).
// Los toasts los muestran los modales y la pantalla.
import type { Fila } from '../../domain/perfil/comun';
import {
  armarPayloadAutorEditado,
  armarPayloadAutorNuevo,
  armarPayloadProduccion,
  armarPayloadRespuestaDeAutor,
  combinarProducciones,
  mapearAutores,
  type Autor,
  type FormularioAutor,
  type FormularioProduccion,
  type ParticipacionPropia,
} from '../../domain/perfil/produccionCientifica';
import {
  armarPayloadEstancia,
  armarPayloadJornada,
  mapearEstancias,
  mapearJornadas,
  type FormularioEstancia,
  type FormularioJornada,
} from '../../domain/perfil/resultados';
import { obtenerPaises } from '../../infrastructure/legajo/catalogosApi';
import { leerColaboradoresActivos } from '../../infrastructure/perfil/actividadApi';
import {
  escribirAutor,
  escribirEstancia,
  escribirJornada,
  escribirProduccion,
  leerAutoresDeProduccion,
  leerEstancias,
  leerJornadas,
  leerProduccionesComoAutor,
  leerProduccionesPropias,
} from '../../infrastructure/perfil/resultadosApi';
import { useAuthStore } from '../../presentation/stores/authStore';
import { useResultadosStore } from '../../presentation/stores/resultadosStore';

export const MSG_ERROR_CARGA_RESULTADOS =
  'No pudimos cargar tus resultados de investigación. Por favor, volvé a intentar.';

export const MSG_ERROR_CARGA_AUTORES = 'No pudimos cargar los autores. Por favor, volvé a intentar.';

export const empleadoIdActual = (): string => {
  const id = useAuthStore.getState().user?.empleadoid;
  if (!id) throw new Error('No hay un empleado en sesión.');
  return id;
};

/** Un 200 vacío tras los reintentos NO es "sin datos": se trata como fallo y se conserva lo que ya había. */
const filasOFallar = (filas: unknown, mensaje = MSG_ERROR_CARGA_RESULTADOS): Fila[] => {
  if (!Array.isArray(filas)) throw new Error(mensaje);
  return filas as Fila[];
};

const store = () => useResultadosStore.getState();

// --- Lecturas ---

const cargarEstancias = async (): Promise<void> => {
  const filas = filasOFallar(await leerEstancias(empleadoIdActual()));
  store().fijar({ estancias: mapearEstancias(filas) });
};

const cargarJornadas = async (): Promise<void> => {
  const filas = filasOFallar(await leerJornadas(empleadoIdActual()));
  store().fijar({ jornadas: mapearJornadas(filas) });
};

/** Las dos lecturas (propias y como autor) tienen que andar: si falla una no se pisa la lista. */
const cargarProducciones = async (): Promise<void> => {
  const id = empleadoIdActual();
  const [propias, comoAutor] = await Promise.all([leerProduccionesPropias(id), leerProduccionesComoAutor(id)]);
  store().fijar({ producciones: combinarProducciones(filasOFallar(propias), filasOFallar(comoAutor)) });
};

const cargarColaboradores = async (): Promise<void> => {
  if (store().colaboradores.length > 0) return;
  const filas = filasOFallar(await leerColaboradoresActivos());
  store().fijar({
    colaboradores: filas.map((f) => ({ value: String(f?.new_empleadoid ?? ''), label: String(f?.new_name ?? '') })),
  });
};

const cargarPaises = async (): Promise<void> => {
  if (store().paises.length > 0) return;
  const paises = await obtenerPaises();
  if (!Array.isArray(paises) || paises.length === 0) throw new Error(MSG_ERROR_CARGA_RESULTADOS);
  store().fijar({ paises });
};

/** Lo que lee la pantalla al abrirse: las tres listas y los catálogos de los modales. */
export const cargarResultados = async (): Promise<void> => {
  store().fijarEstado({ cargando: true, error: false });
  const resultados = await Promise.allSettled([
    cargarProducciones(),
    cargarJornadas(),
    cargarEstancias(),
    cargarColaboradores(),
    cargarPaises(),
  ]);
  store().fijarEstado({
    cargando: false,
    cargado: true,
    error: resultados.some((r) => r.status === 'rejected'),
  });
};

// --- Estancias ---

export const guardarEstancia = async (datos: FormularioEstancia, id?: string): Promise<void> => {
  await escribirEstancia(id ? 'put' : 'post', armarPayloadEstancia(empleadoIdActual(), datos, id));
  await cargarEstancias();
};

export const eliminarEstancia = async (id: string): Promise<void> => {
  await escribirEstancia('delete', { new_estanciasid: id });
  await cargarEstancias();
};

// --- Participación en jornadas, congresos y eventos ---

export const guardarJornada = async (datos: FormularioJornada, id?: string): Promise<void> => {
  await escribirJornada(id ? 'put' : 'post', armarPayloadJornada(empleadoIdActual(), datos, id));
  await cargarJornadas();
};

export const eliminarJornada = async (id: string): Promise<void> => {
  await escribirJornada('delete', { new_participacioneneventosycongresosid: id });
  await cargarJornadas();
};

// --- Producción científica ---

export const guardarProduccion = async (datos: FormularioProduccion, id?: string): Promise<void> => {
  await escribirProduccion(id ? 'put' : 'post', armarPayloadProduccion(empleadoIdActual(), datos, id));
  await cargarProducciones();
};

export const eliminarProduccion = async (id: string): Promise<void> => {
  await escribirProduccion('delete', { new_produccioncientificaid: id });
  await cargarProducciones();
};

/** El autor aprueba o rechaza su participación en la producción de otra persona. */
export const responderComoAutor = async (participacion: ParticipacionPropia, aprobar: boolean): Promise<void> => {
  await escribirAutor('put', armarPayloadRespuestaDeAutor(participacion, aprobar));
  await cargarProducciones();
};

// --- Autores ---

export const cargarAutores = async (produccionId: string): Promise<Autor[]> => {
  const filas = filasOFallar(await leerAutoresDeProduccion(produccionId), MSG_ERROR_CARGA_AUTORES);
  return mapearAutores(filas);
};

export const guardarAutor = async (produccionId: string, datos: FormularioAutor, autorId?: string): Promise<void> => {
  const empleadoId = empleadoIdActual();
  if (autorId) await escribirAutor('put', armarPayloadAutorEditado(empleadoId, autorId, datos));
  else await escribirAutor('post', armarPayloadAutorNuevo(empleadoId, produccionId, datos));
};

export const eliminarAutor = async (autorId: string): Promise<void> => {
  await escribirAutor('delete', { new_participantesdeproduccioncientificaid: autorId });
};
