// Flujos de Perfil > Gestión académica. Los toasts los muestran los modales y la pantalla.
import type { Fila } from '../../domain/perfil/comun';
import {
  armarPayloadEncargo,
  armarPayloadExterno,
  mapearCargoEncargoExterno,
  mapearCargos,
  mapearEncargo,
  type FormularioCargoEncargoExterno,
  type FormularioEncargo,
} from '../../domain/perfil/gestionAcademica';
import { mapearUnidadAcademica } from '../../domain/perfil/extension';
import { obtenerPaises } from '../../infrastructure/legajo/catalogosApi';
import {
  escribirCargoEncargoExterno,
  escribirEncargo,
  leerCargosEncargosExternos,
  leerCargosGestion,
  leerEncargosGestion,
  leerUnidadesDeEncargos,
} from '../../infrastructure/perfil/gestionAcademicaApi';
import { useAuthStore } from '../../presentation/stores/authStore';
import { useGestionAcademicaStore } from '../../presentation/stores/gestionAcademicaStore';

export const MSG_ERROR_CARGA_GESTION =
  'No pudimos cargar tu gestión académica. Por favor, volvé a intentar.';

const empleadoIdActual = (): string => {
  const id = useAuthStore.getState().user?.empleadoid;
  if (!id) throw new Error('No hay un empleado en sesión.');
  return id;
};

/** Un 200 vacío tras los reintentos NO es "sin datos": se trata como fallo y se conserva lo que ya había. */
const filasOFallar = (filas: unknown): Fila[] => {
  if (!Array.isArray(filas)) throw new Error(MSG_ERROR_CARGA_GESTION);
  return filas as Fila[];
};

const store = () => useGestionAcademicaStore.getState();

export const cargarCargos = async (): Promise<void> => {
  const filas = filasOFallar(await leerCargosGestion(empleadoIdActual()));
  store().fijar({ cargos: mapearCargos(filas) });
};

export const cargarEncargos = async (): Promise<void> => {
  const filas = filasOFallar(await leerEncargosGestion(empleadoIdActual()));
  store().fijar({ encargos: filas.map(mapearEncargo) });
};

export const cargarExternos = async (): Promise<void> => {
  const filas = filasOFallar(await leerCargosEncargosExternos(empleadoIdActual()));
  store().fijar({ externos: filas.map(mapearCargoEncargoExterno) });
};

const cargarUnidades = async (): Promise<void> => {
  if (store().unidades.length > 0) return;
  const filas = filasOFallar(await leerUnidadesDeEncargos());
  store().fijar({ unidades: filas.map(mapearUnidadAcademica) });
};

const cargarPaises = async (): Promise<void> => {
  if (store().paises.length > 0) return;
  store().fijar({ paises: await obtenerPaises() });
};

/** Lo que lee la pantalla al abrirse: las tres listas y los catálogos de los modales. */
export const cargarGestionAcademica = async (): Promise<void> => {
  store().fijarEstado({ cargando: true, error: false });
  const resultados = await Promise.allSettled([
    cargarCargos(),
    cargarEncargos(),
    cargarExternos(),
    cargarUnidades(),
    cargarPaises(),
  ]);
  store().fijarEstado({
    cargando: false,
    cargado: true,
    error: resultados.some((r) => r.status === 'rejected'),
  });
};

// --- Encargos ---

export const guardarEncargo = async (datos: FormularioEncargo, id?: string): Promise<void> => {
  await escribirEncargo(id ? 'put' : 'post', armarPayloadEncargo(empleadoIdActual(), datos, id));
  await cargarEncargos();
};

export const eliminarEncargo = async (id: string): Promise<void> => {
  await escribirEncargo('delete', { new_encargosid: id });
  await cargarEncargos();
};

// --- Cargos / encargos externos ---

export const guardarExterno = async (datos: FormularioCargoEncargoExterno, id?: string): Promise<void> => {
  await escribirCargoEncargoExterno(id ? 'put' : 'post', armarPayloadExterno(empleadoIdActual(), datos, id));
  await cargarExternos();
};

export const eliminarExterno = async (id: string): Promise<void> => {
  await escribirCargoEncargoExterno('delete', { new_cargosencargosexternosid: id });
  await cargarExternos();
};
