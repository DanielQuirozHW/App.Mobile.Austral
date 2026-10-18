// Flujos de Perfil > Investigación > Actividad I+D (financiamientos y formación de RRHH).
// Los toasts los muestran los modales y la pantalla.
import type { Fila } from '../../domain/perfil/comun';
import {
  armarPayloadExterno,
  armarPayloadPropio,
  mapearFinanciamientosExternos,
  mapearFinanciamientosPropios,
  type FormularioFinanciamientoExterno,
  type FormularioFinanciamientoPropio,
} from '../../domain/perfil/financiamientos';
import {
  armarPayloadDireccion,
  armarPayloadTesista,
  mapearDirecciones,
  mapearTesistas,
  type FormularioDireccion,
  type FormularioTesista,
} from '../../domain/perfil/formacionRrhh';
import {
  escribirDireccion,
  escribirFinanciamientoExterno,
  escribirFinanciamientoPropio,
  escribirTesista,
  leerColaboradoresActivos,
  leerDirecciones,
  leerFinanciamientosExternos,
  leerFinanciamientosPropios,
  leerTesistas,
} from '../../infrastructure/perfil/actividadApi';
import { useActividadStore } from '../../presentation/stores/actividadStore';
import { useAuthStore } from '../../presentation/stores/authStore';

export const MSG_ERROR_CARGA_ACTIVIDAD =
  'No pudimos cargar tu actividad de investigación. Por favor, volvé a intentar.';

const empleadoIdActual = (): string => {
  const id = useAuthStore.getState().user?.empleadoid;
  if (!id) throw new Error('No hay un empleado en sesión.');
  return id;
};

/** Un 200 vacío tras los reintentos NO es "sin datos": se trata como fallo y se conserva lo que ya había. */
const filasOFallar = (filas: unknown): Fila[] => {
  if (!Array.isArray(filas)) throw new Error(MSG_ERROR_CARGA_ACTIVIDAD);
  return filas as Fila[];
};

const store = () => useActividadStore.getState();

// --- Lecturas ---

const cargarPropios = async (): Promise<void> => {
  const filas = filasOFallar(await leerFinanciamientosPropios(empleadoIdActual()));
  store().fijar({ propios: mapearFinanciamientosPropios(filas) });
};

const cargarExternos = async (): Promise<void> => {
  const filas = filasOFallar(await leerFinanciamientosExternos(empleadoIdActual()));
  store().fijar({ externos: mapearFinanciamientosExternos(filas) });
};

const cargarTesistas = async (): Promise<void> => {
  const filas = filasOFallar(await leerTesistas(empleadoIdActual()));
  store().fijar({ tesistas: mapearTesistas(filas) });
};

const cargarDirecciones = async (): Promise<void> => {
  const filas = filasOFallar(await leerDirecciones(empleadoIdActual()));
  store().fijar({ direcciones: mapearDirecciones(filas) });
};

const cargarColaboradores = async (): Promise<void> => {
  if (store().colaboradores.length > 0) return;
  const filas = filasOFallar(await leerColaboradoresActivos());
  store().fijar({
    colaboradores: filas.map((f) => ({ value: String(f?.new_empleadoid ?? ''), label: String(f?.new_name ?? '') })),
  });
};

/** Lo que lee la pantalla al abrirse: todas las listas y el catálogo de colaboradores. */
export const cargarActividad = async (): Promise<void> => {
  store().fijarEstado({ cargando: true, error: false });
  const resultados = await Promise.allSettled([
    cargarPropios(),
    cargarExternos(),
    cargarTesistas(),
    cargarDirecciones(),
    cargarColaboradores(),
  ]);
  store().fijarEstado({
    cargando: false,
    cargado: true,
    error: resultados.some((r) => r.status === 'rejected'),
  });
};

// --- Financiamiento propio de la UA ---

export const guardarFinanciamientoPropio = async (datos: FormularioFinanciamientoPropio, id?: string): Promise<void> => {
  await escribirFinanciamientoPropio(id ? 'put' : 'post', armarPayloadPropio(empleadoIdActual(), datos, id));
  await cargarPropios();
};

export const eliminarFinanciamientoPropio = async (id: string): Promise<void> => {
  await escribirFinanciamientoPropio('delete', { new_financiamientopropiodelauaid: id });
  await cargarPropios();
};

// --- Financiamiento externo a la UA ---

export const guardarFinanciamientoExterno = async (
  datos: FormularioFinanciamientoExterno,
  id?: string,
): Promise<void> => {
  await escribirFinanciamientoExterno(id ? 'put' : 'post', armarPayloadExterno(empleadoIdActual(), datos, id));
  await cargarExternos();
};

export const eliminarFinanciamientoExterno = async (id: string): Promise<void> => {
  await escribirFinanciamientoExterno('delete', { new_financiamientoexternoalauaid: id });
  await cargarExternos();
};

// --- Formación de tesistas ---

export const guardarTesista = async (datos: FormularioTesista, id?: string): Promise<void> => {
  await escribirTesista(id ? 'put' : 'post', armarPayloadTesista(empleadoIdActual(), datos, id));
  await cargarTesistas();
};

export const eliminarTesista = async (id: string): Promise<void> => {
  await escribirTesista('delete', { new_formaciontesistasid: id });
  await cargarTesistas();
};

// --- Dirección de investigadores y/o becarios ---

export const guardarDireccion = async (datos: FormularioDireccion, id?: string): Promise<void> => {
  await escribirDireccion(id ? 'put' : 'post', armarPayloadDireccion(empleadoIdActual(), datos, id));
  await cargarDirecciones();
};

export const eliminarDireccion = async (id: string): Promise<void> => {
  await escribirDireccion('delete', { new_direcciondeinvestigadoresbecariosid: id });
  await cargarDirecciones();
};
