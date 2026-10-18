// Flujos de Perfil > Investigación > Afiliaciones. Los toasts los muestran los formularios, los modales y la pantalla.
import { obtenerPaises } from '../../infrastructure/legajo/catalogosApi';
import type { Fila } from '../../domain/perfil/comun';
import {
  armarPayloadExterna,
  armarPayloadJurado,
  armarPayloadPerfil,
  armarPayloadPertenencia,
  armarPayloadPrinuar,
  mapearExternaVigente,
  mapearExternasHistoricas,
  mapearJurados,
  mapearPerfil,
  mapearPertenencias,
  mapearPrinuarHistoricas,
  mapearPrinuarVigente,
  tieneValor,
  type FormularioExterna,
  type FormularioJurado,
  type FormularioPerfil,
  type FormularioPertenencia,
  type FormularioPrinuar,
} from '../../domain/perfil/afiliaciones';
import { mapearCatalogoPorNombre } from '../../domain/perfil/docencia';
import { mapearUnidadAcademica } from '../../domain/perfil/extension';
import {
  escribirCategorizacionExterna,
  escribirCategorizacionPrinuar,
  escribirJuradoTribunal,
  escribirPerfilInvestigacion,
  escribirPertenencia,
  leerCatalogoPertenencias,
  leerCategorizacionesVigentes,
  leerExternasHistoricas,
  leerJuradosTribunal,
  leerPerfilInvestigacion,
  leerPertenencias,
  leerPrinuarHistoricas,
} from '../../infrastructure/perfil/afiliacionesApi';
import { leerInstitucionesOtorgantes } from '../../infrastructure/perfil/formacionApi';
import { leerUnidadesDeEncargos } from '../../infrastructure/perfil/gestionAcademicaApi';
import { useAuthStore } from '../../presentation/stores/authStore';
import { useAfiliacionesStore } from '../../presentation/stores/afiliacionesStore';

export const MSG_ERROR_CARGA_AFILIACIONES =
  'No pudimos cargar tu información de investigación. Por favor, volvé a intentar.';

const empleadoIdActual = (): string => {
  const id = useAuthStore.getState().user?.empleadoid;
  if (!id) throw new Error('No hay un empleado en sesión.');
  return id;
};

/** Un 200 vacío tras los reintentos NO es "sin datos": se trata como fallo y se conserva lo que ya había. */
const filasOFallar = (filas: unknown): Fila[] => {
  if (!Array.isArray(filas)) throw new Error(MSG_ERROR_CARGA_AFILIACIONES);
  return filas as Fila[];
};

const store = () => useAfiliacionesStore.getState();

// --- Lecturas ---

const cargarPerfil = async (): Promise<void> => {
  const filas = filasOFallar(await leerPerfilInvestigacion(empleadoIdActual()));
  store().fijar({ perfil: mapearPerfil(filas[0] ?? {}) });
};

const cargarVigentes = async (): Promise<void> => {
  const filas = filasOFallar(await leerCategorizacionesVigentes(empleadoIdActual()));
  store().fijar({ externa: mapearExternaVigente(filas[0]), prinuar: mapearPrinuarVigente(filas[0]) });
};

const cargarExternasHistoricas = async (): Promise<void> => {
  const filas = filasOFallar(await leerExternasHistoricas(empleadoIdActual()));
  store().fijar({ externasHistoricas: mapearExternasHistoricas(filas) });
};

const cargarPrinuarHistoricas = async (): Promise<void> => {
  const filas = filasOFallar(await leerPrinuarHistoricas(empleadoIdActual()));
  store().fijar({ prinuarHistoricas: mapearPrinuarHistoricas(filas) });
};

const cargarPertenencias = async (): Promise<void> => {
  const filas = filasOFallar(await leerPertenencias(empleadoIdActual()));
  store().fijar({ pertenencias: mapearPertenencias(filas) });
};

const cargarJurados = async (): Promise<void> => {
  const filas = filasOFallar(await leerJuradosTribunal(empleadoIdActual()));
  store().fijar({ jurados: mapearJurados(filas) });
};

// --- Catálogos ---

const cargarCatalogoPertenencias = async (): Promise<void> => {
  if (store().catalogoPertenencias.length > 0) return;
  const filas = filasOFallar(await leerCatalogoPertenencias());
  store().fijar({
    catalogoPertenencias: filas.map(mapearCatalogoPorNombre('new_unidadacademicadepertenenciaid')),
  });
};

const cargarUnidades = async (): Promise<void> => {
  if (store().unidades.length > 0) return;
  const filas = filasOFallar(await leerUnidadesDeEncargos());
  store().fijar({ unidades: filas.map(mapearUnidadAcademica) });
};

const cargarInstituciones = async (): Promise<void> => {
  if (store().instituciones.length > 0) return;
  const filas = filasOFallar(await leerInstitucionesOtorgantes());
  store().fijar({ instituciones: filas.map(mapearCatalogoPorNombre('new_institucionotorganteid')) });
};

const cargarPaises = async (): Promise<void> => {
  if (store().paises.length > 0) return;
  const paises = await obtenerPaises();
  if (!Array.isArray(paises) || paises.length === 0) throw new Error(MSG_ERROR_CARGA_AFILIACIONES);
  store().fijar({ paises });
};

/** Lo que lee la pantalla al abrirse: todas las listas y los catálogos de formularios y modales. */
export const cargarAfiliaciones = async (): Promise<void> => {
  store().fijarEstado({ cargando: true, error: false });
  const resultados = await Promise.allSettled([
    cargarPerfil(),
    cargarVigentes(),
    cargarExternasHistoricas(),
    cargarPrinuarHistoricas(),
    cargarPertenencias(),
    cargarJurados(),
    cargarCatalogoPertenencias(),
    cargarUnidades(),
    cargarInstituciones(),
    cargarPaises(),
  ]);
  store().fijarEstado({
    cargando: false,
    cargado: true,
    error: resultados.some((r) => r.status === 'rejected'),
  });
};

// --- Perfiles ---

export const guardarPerfil = async (datos: FormularioPerfil): Promise<void> => {
  await escribirPerfilInvestigacion(armarPayloadPerfil(empleadoIdActual(), datos));
  await cargarPerfil();
};

// --- Categorización externa y PRINUAR ---

export const guardarCategorizacionExterna = async (datos: FormularioExterna): Promise<void> => {
  await escribirCategorizacionExterna(armarPayloadExterna(empleadoIdActual(), datos));
  await Promise.all([cargarVigentes(), cargarExternasHistoricas(), cargarPrinuarHistoricas()]);
};

/** PUT si ya hay una categoría PRINUAR cargada; si no, POST (como el portal). */
export const guardarCategorizacionPrinuar = async (datos: FormularioPrinuar): Promise<void> => {
  const existe = tieneValor(store().prinuar?.categoria);
  await escribirCategorizacionPrinuar(existe ? 'put' : 'post', armarPayloadPrinuar(empleadoIdActual(), datos));
  await Promise.all([cargarVigentes(), cargarExternasHistoricas(), cargarPrinuarHistoricas()]);
};

// --- Pertenencia ---

export const guardarPertenencia = async (datos: FormularioPertenencia, id?: string): Promise<void> => {
  await escribirPertenencia(id ? 'put' : 'post', armarPayloadPertenencia(empleadoIdActual(), datos, id));
  await cargarPertenencias();
};

export const eliminarPertenencia = async (id: string): Promise<void> => {
  await escribirPertenencia('delete', { new_pertenenciaacentrosid: id });
  await cargarPertenencias();
};

// --- Jurados - tribunal ---

export const guardarJurado = async (datos: FormularioJurado, id?: string): Promise<void> => {
  await escribirJuradoTribunal(id ? 'put' : 'post', armarPayloadJurado(empleadoIdActual(), datos, id));
  await cargarJurados();
};

export const eliminarJurado = async (id: string): Promise<void> => {
  await escribirJuradoTribunal('delete', { new_participacionencomitesyjuradosid: id });
  await cargarJurados();
};
