// Flujos de Perfil > Extensión. Los toasts los muestran el modal y la pantalla.
import type { Fila } from '../../domain/perfil/comun';
import {
  armarPayloadActividad,
  mapearActividadExtension,
  mapearUnidadAcademica,
  type FormularioActividadExtension,
} from '../../domain/perfil/extension';
import {
  escribirActividadExtension,
  leerActividadesExtension,
  leerOtrasEntidadesAcademicas,
  leerUnidadesAcademicas,
} from '../../infrastructure/perfil/extensionApi';
import { useAuthStore } from '../../presentation/stores/authStore';
import { useExtensionStore } from '../../presentation/stores/extensionStore';

export const MSG_ERROR_CARGA_EXTENSION = 'No pudimos cargar tus actividades de extensión. Por favor, volvé a intentar.';

const empleadoIdActual = (): string => {
  const id = useAuthStore.getState().user?.empleadoid;
  if (!id) throw new Error('No hay un empleado en sesión.');
  return id;
};

/** Un 200 vacío tras los reintentos NO es "sin datos": se trata como fallo y se conserva lo que ya había. */
const filasOFallar = (filas: unknown): Fila[] => {
  if (!Array.isArray(filas)) throw new Error(MSG_ERROR_CARGA_EXTENSION);
  return filas as Fila[];
};

const store = () => useExtensionStore.getState();

export const cargarActividadesExtension = async (): Promise<void> => {
  const filas = filasOFallar(await leerActividadesExtension(empleadoIdActual()));
  store().fijar({ actividades: filas.map(mapearActividadExtension) });
};

const cargarUnidades = async (): Promise<void> => {
  if (store().unidades.length > 0) return;
  const filas = filasOFallar(await leerUnidadesAcademicas());
  store().fijar({ unidades: filas.map(mapearUnidadAcademica) });
};

/**
 * Las opciones de "Otra entidad académica" se piden una vez por sesión y, como en el portal, un fallo se ignora en
 * silencio: no marca la pantalla con error (solo quedaría vacío ese selector).
 */
const cargarOtrasEntidades = async (): Promise<void> => {
  if (store().otrasEntidades.length > 0) return;
  try {
    const filas = await leerOtrasEntidadesAcademicas();
    if (Array.isArray(filas)) store().fijar({ otrasEntidades: (filas as Fila[]).map(mapearUnidadAcademica) });
  } catch {
    // Igual que el portal: sin opciones, no se bloquea el resto.
  }
};

/** Lo que lee la pantalla al abrirse: las actividades y los catálogos de entidades. */
export const cargarExtension = async (): Promise<void> => {
  store().fijarEstado({ cargando: true, error: false });
  const [resultados] = await Promise.all([
    Promise.allSettled([cargarActividadesExtension(), cargarUnidades()]),
    cargarOtrasEntidades(),
  ]);
  store().fijarEstado({
    cargando: false,
    cargado: true,
    error: resultados.some((r) => r.status === 'rejected'),
  });
};

export const guardarActividadExtension = async (datos: FormularioActividadExtension, id?: string): Promise<void> => {
  await escribirActividadExtension(id ? 'put' : 'post', armarPayloadActividad(empleadoIdActual(), datos, id));
  await cargarActividadesExtension();
};

export const eliminarActividadExtension = async (id: string): Promise<void> => {
  await escribirActividadExtension('delete', { new_actividadesdeextensionid: id });
  await cargarActividadesExtension();
};
