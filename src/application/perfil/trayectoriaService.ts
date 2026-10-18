// Flujos de Perfil > Trayectoria profesional. Port de Portal-Austral-Dev -> hooks/trayectoria/* y
// perfil/trayectoria/page.tsx. Los toasts los muestran los modales y la pantalla.
import type { Fila } from '../../domain/perfil/comun';
import { mapearEmpleadoFormacion } from '../../domain/perfil/formacion';
import {
  armarPayloadComite,
  armarPayloadConsultoria,
  armarPayloadExperiencia,
  armarPayloadLicenciaProfesional,
  armarPayloadReconocimiento,
  mapearComite,
  mapearConsultoria,
  mapearExperiencia,
  mapearLicenciaProfesional,
  mapearReconocimiento,
  type FormularioComite,
  type FormularioConsultoria,
  type FormularioExperiencia,
  type FormularioLicenciaProfesional,
  type FormularioReconocimiento,
} from '../../domain/perfil/trayectoria';
import {
  escribirComite,
  escribirConsultoria,
  escribirExperienciaFuera,
  escribirLicenciaProfesional,
  escribirReconocimiento,
  leerComites,
  leerConsultorias,
  leerEmpleadoTrayectoria,
  leerExperienciasFuera,
  leerLicenciasProfesionales,
  leerReconocimientos,
} from '../../infrastructure/perfil/trayectoriaApi';
import { actualizarEmpleado } from '../../infrastructure/perfil/perfilApi';
import { useAuthStore } from '../../presentation/stores/authStore';
import { useTrayectoriaStore } from '../../presentation/stores/trayectoriaStore';

export const MSG_ERROR_CARGA_TRAYECTORIA = 'No pudimos cargar tu trayectoria profesional. Por favor, volvé a intentar.';

const empleadoIdActual = (): string => {
  const id = useAuthStore.getState().user?.empleadoid;
  if (!id) throw new Error('No hay un empleado en sesión.');
  return id;
};

/** Un 200 vacío tras los reintentos NO es "sin datos": se trata como fallo y se conserva lo que ya había. */
const filasOFallar = (filas: unknown): Fila[] => {
  if (!Array.isArray(filas)) throw new Error(MSG_ERROR_CARGA_TRAYECTORIA);
  return filas as Fila[];
};

const store = () => useTrayectoriaStore.getState();

export const cargarEmpleadoTrayectoria = async (): Promise<void> => {
  const filas = filasOFallar(await leerEmpleadoTrayectoria(empleadoIdActual()));
  store().fijar({ empleado: filas.length > 0 ? mapearEmpleadoFormacion(filas[0]) : null });
};

export const cargarExperiencias = async (): Promise<void> => {
  const filas = filasOFallar(await leerExperienciasFuera(empleadoIdActual()));
  store().fijar({ experiencias: filas.map(mapearExperiencia) });
};

export const cargarConsultorias = async (): Promise<void> => {
  const filas = filasOFallar(await leerConsultorias(empleadoIdActual()));
  store().fijar({ consultorias: filas.map(mapearConsultoria) });
};

export const cargarComites = async (): Promise<void> => {
  const filas = filasOFallar(await leerComites(empleadoIdActual()));
  store().fijar({ comites: filas.map(mapearComite) });
};

export const cargarLicenciasProfesionales = async (): Promise<void> => {
  const filas = filasOFallar(await leerLicenciasProfesionales(empleadoIdActual()));
  store().fijar({ licencias: filas.map(mapearLicenciaProfesional) });
};

export const cargarReconocimientos = async (): Promise<void> => {
  const filas = filasOFallar(await leerReconocimientos(empleadoIdActual()));
  store().fijar({ reconocimientos: filas.map(mapearReconocimiento) });
};

/** Lo que lee la pantalla al abrirse: el empleado y las cinco listas. */
export const cargarTrayectoria = async (): Promise<void> => {
  store().fijarEstado({ cargando: true, error: false });
  const resultados = await Promise.allSettled([
    cargarEmpleadoTrayectoria(),
    cargarExperiencias(),
    cargarConsultorias(),
    cargarComites(),
    cargarLicenciasProfesionales(),
    cargarReconocimientos(),
  ]);
  store().fijarEstado({
    cargando: false,
    cargado: true,
    error: resultados.some((r) => r.status === 'rejected'),
  });
};

/**
 * Guarda el link de LinkedIn (PUT api/hrfactors/empleado con { new_linklinkedin, new_linkresearchgate, new_empleadoid }).
 * El link de ResearchGate se reenvía con el valor cargado. Devuelve false si la respuesta vino vacía.
 */
export const guardarLinkLinkedin = async (linkLinkedin: string): Promise<boolean> => {
  const id = empleadoIdActual();
  const actual = store().empleado;
  const resultado = await actualizarEmpleado({
    new_linklinkedin: linkLinkedin,
    new_linkresearchgate: actual?.linkResearch ?? '',
    new_empleadoid: id,
  });
  if (!resultado) return false;
  await cargarEmpleadoTrayectoria();
  return true;
};

// --- Experiencia laboral fuera del ámbito académico ---

export const guardarExperiencia = async (datos: FormularioExperiencia, id?: string): Promise<void> => {
  await escribirExperienciaFuera(id ? 'put' : 'post', armarPayloadExperiencia(empleadoIdActual(), datos, id));
  await cargarExperiencias();
};

export const eliminarExperiencia = async (id: string): Promise<void> => {
  await escribirExperienciaFuera('delete', { new_experienciafueraambitoacademicoid: id });
  await cargarExperiencias();
};

// --- Consultorías externas ---

export const guardarConsultoria = async (datos: FormularioConsultoria, id?: string): Promise<void> => {
  await escribirConsultoria(id ? 'put' : 'post', armarPayloadConsultoria(empleadoIdActual(), datos, id));
  await cargarConsultorias();
};

export const eliminarConsultoria = async (id: string): Promise<void> => {
  await escribirConsultoria('delete', { new_consultorasexternasid: id });
  await cargarConsultorias();
};

// --- Comités profesionales o técnicos ---

export const guardarComite = async (datos: FormularioComite, id?: string): Promise<void> => {
  await escribirComite(id ? 'put' : 'post', armarPayloadComite(empleadoIdActual(), datos, id));
  await cargarComites();
};

export const eliminarComite = async (id: string): Promise<void> => {
  await escribirComite('delete', { new_comiteprofesionalotecnicoid: id });
  await cargarComites();
};

// --- Licencias profesionales, membresías y asociaciones ---

export const guardarLicenciaProfesional = async (datos: FormularioLicenciaProfesional, id?: string): Promise<void> => {
  await escribirLicenciaProfesional(
    id ? 'put' : 'post',
    armarPayloadLicenciaProfesional(empleadoIdActual(), datos, id),
  );
  await cargarLicenciasProfesionales();
};

export const eliminarLicenciaProfesional = async (id: string): Promise<void> => {
  await escribirLicenciaProfesional('delete', { new_licprof_membresiaencolegio_asocprofid: id });
  await cargarLicenciasProfesionales();
};

// --- Reconocimientos profesionales ---

export const guardarReconocimiento = async (datos: FormularioReconocimiento, id?: string): Promise<void> => {
  await escribirReconocimiento(id ? 'put' : 'post', armarPayloadReconocimiento(empleadoIdActual(), datos, id));
  await cargarReconocimientos();
};

export const eliminarReconocimiento = async (id: string): Promise<void> => {
  await escribirReconocimiento('delete', { new_reconocimientoprofesionalid: id });
  await cargarReconocimientos();
};
