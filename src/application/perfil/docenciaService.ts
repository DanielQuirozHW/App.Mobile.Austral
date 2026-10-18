// Flujos de Perfil > Docencia. Los toasts los muestran los modales y la pantalla.
import type { Fila } from '../../domain/perfil/comun';
import { mapearUnidadAcademica } from '../../domain/perfil/extension';
import {
  armarPayloadAsesoramiento,
  armarPayloadDocenciaExterna,
  armarPayloadDocenciaUA,
  mapearAsesoramientos,
  mapearCatalogoPorNombre,
  mapearCategorizacionesHistoricas,
  mapearCategorizacionVigente,
  mapearDocenciasExternas,
  mapearDocenciasUA,
  mapearNombramientos,
  mapearPromociones,
  type FormularioAsesoramiento,
  type FormularioDocenciaExterna,
  type FormularioDocenciaUA,
} from '../../domain/perfil/docencia';
import { leerInstitucionesOtorgantes } from '../../infrastructure/perfil/formacionApi';
import {
  escribirAsesoramiento,
  escribirDocenciaExterna,
  escribirDocenciaUA,
  leerAsesoramientos,
  leerCategorizacionHistorica,
  leerCategorizacionVigente,
  leerDocenciasExternas,
  leerDocenciasUA,
  leerGradosAcademicos,
  leerModalidadesDeDictado,
  leerNombramientosHistoricos,
  leerNombramientosVigentes,
  leerPromociones,
} from '../../infrastructure/perfil/docenciaApi';
import { leerUnidadesDeEncargos } from '../../infrastructure/perfil/gestionAcademicaApi';
import { useAuthStore } from '../../presentation/stores/authStore';
import { useDocenciaStore } from '../../presentation/stores/docenciaStore';

export const MSG_ERROR_CARGA_DOCENCIA = 'No pudimos cargar tu información de docencia. Por favor, volvé a intentar.';

const empleadoIdActual = (): string => {
  const id = useAuthStore.getState().user?.empleadoid;
  if (!id) throw new Error('No hay un empleado en sesión.');
  return id;
};

/** Un 200 vacío tras los reintentos NO es "sin datos": se trata como fallo y se conserva lo que ya había. */
const filasOFallar = (filas: unknown): Fila[] => {
  if (!Array.isArray(filas)) throw new Error(MSG_ERROR_CARGA_DOCENCIA);
  return filas as Fila[];
};

const store = () => useDocenciaStore.getState();

// --- Lecturas de las listas ---

const cargarCategorizacionVigente = async (): Promise<void> => {
  const filas = filasOFallar(await leerCategorizacionVigente(empleadoIdActual()));
  store().fijar({ categorizacionVigente: filas.map(mapearCategorizacionVigente) });
};

const cargarCategorizacionHistorica = async (): Promise<void> => {
  const filas = filasOFallar(await leerCategorizacionHistorica(empleadoIdActual()));
  store().fijar({ categorizacionHistorica: mapearCategorizacionesHistoricas(filas) });
};

const cargarNombramientosVigentes = async (): Promise<void> => {
  const filas = filasOFallar(await leerNombramientosVigentes(empleadoIdActual()));
  store().fijar({ nombramientosVigentes: mapearNombramientos(filas) });
};

const cargarNombramientosHistoricos = async (): Promise<void> => {
  const filas = filasOFallar(await leerNombramientosHistoricos(empleadoIdActual()));
  store().fijar({ nombramientosHistoricos: mapearNombramientos(filas) });
};

const cargarPromociones = async (): Promise<void> => {
  const filas = filasOFallar(await leerPromociones(empleadoIdActual()));
  store().fijar({ promociones: mapearPromociones(filas) });
};

export const cargarDocenciasUA = async (): Promise<void> => {
  const filas = filasOFallar(await leerDocenciasUA(empleadoIdActual()));
  store().fijar({ docenciasUA: mapearDocenciasUA(filas) });
};

export const cargarDocenciasExternas = async (): Promise<void> => {
  const filas = filasOFallar(await leerDocenciasExternas(empleadoIdActual()));
  store().fijar({ docenciasExternas: mapearDocenciasExternas(filas) });
};

export const cargarAsesoramientos = async (): Promise<void> => {
  const filas = filasOFallar(await leerAsesoramientos(empleadoIdActual()));
  store().fijar({ asesoramientos: mapearAsesoramientos(filas) });
};

// --- Catálogos de los modales ---

const cargarUnidades = async (): Promise<void> => {
  if (store().unidades.length > 0) return;
  const filas = filasOFallar(await leerUnidadesDeEncargos());
  store().fijar({ unidades: filas.map(mapearUnidadAcademica) });
};

const cargarGrados = async (): Promise<void> => {
  if (store().gradosAcademicos.length > 0) return;
  const filas = filasOFallar(await leerGradosAcademicos());
  store().fijar({ gradosAcademicos: filas.map(mapearCatalogoPorNombre('new_gradoacadmicoid')) });
};

const cargarModalidades = async (): Promise<void> => {
  if (store().modalidades.length > 0) return;
  const filas = filasOFallar(await leerModalidadesDeDictado());
  store().fijar({ modalidades: filas.map(mapearCatalogoPorNombre('new_modalidaddedictadoid')) });
};

const cargarInstituciones = async (): Promise<void> => {
  if (store().instituciones.length > 0) return;
  const filas = filasOFallar(await leerInstitucionesOtorgantes());
  store().fijar({ instituciones: filas.map(mapearCatalogoPorNombre('new_institucionotorganteid')) });
};

/** Lo que lee la pantalla al abrirse: todas las listas y los catálogos de los modales. */
export const cargarDocencia = async (): Promise<void> => {
  store().fijarEstado({ cargando: true, error: false });
  const resultados = await Promise.allSettled([
    cargarCategorizacionVigente(),
    cargarCategorizacionHistorica(),
    cargarNombramientosVigentes(),
    cargarNombramientosHistoricos(),
    cargarPromociones(),
    cargarDocenciasUA(),
    cargarDocenciasExternas(),
    cargarAsesoramientos(),
    cargarUnidades(),
    cargarGrados(),
    cargarModalidades(),
    cargarInstituciones(),
  ]);
  store().fijarEstado({
    cargando: false,
    cargado: true,
    error: resultados.some((r) => r.status === 'rejected'),
  });
};

// --- Docencia U. Austral ---

export const guardarDocenciaUA = async (datos: FormularioDocenciaUA, id?: string): Promise<void> => {
  await escribirDocenciaUA(id ? 'put' : 'post', armarPayloadDocenciaUA(empleadoIdActual(), datos, id));
  await cargarDocenciasUA();
};

export const eliminarDocenciaUA = async (id: string): Promise<void> => {
  await escribirDocenciaUA('delete', { new_docenciaid: id });
  await cargarDocenciasUA();
};

// --- Docencia externa ---

export const guardarDocenciaExterna = async (datos: FormularioDocenciaExterna, id?: string): Promise<void> => {
  await escribirDocenciaExterna(id ? 'put' : 'post', armarPayloadDocenciaExterna(empleadoIdActual(), datos, id));
  await cargarDocenciasExternas();
};

export const eliminarDocenciaExterna = async (id: string): Promise<void> => {
  await escribirDocenciaExterna('delete', { new_docenciaexternaid: id });
  await cargarDocenciasExternas();
};

// --- Asesoramiento académico ---

export const guardarAsesoramiento = async (datos: FormularioAsesoramiento, id?: string): Promise<void> => {
  await escribirAsesoramiento(id ? 'put' : 'post', armarPayloadAsesoramiento(empleadoIdActual(), datos, id));
  await cargarAsesoramientos();
};

export const eliminarAsesoramiento = async (id: string): Promise<void> => {
  await escribirAsesoramiento('delete', { new_asesoramientoacademicoid: id });
  await cargarAsesoramientos();
};
