// Datos propios del módulo Licencias y vacaciones. Port de Portal-Austral-Dev ->
// src/stores/useLicenciasStore.ts (tipoDeLicencias, ingresadas), src/stores/useVacacionesStore.ts (VacacionesFetch,
// fetchVacacionesGestion, fetchLicenciasEquipoCalendario), src/hooks/useGetTipoLicencias.ts y useGetFeriados.
//
// Cada bloque tiene la forma { datos, cargando, cargado, error }. Un error NO pisa los datos que ya se tenían.
// Una respuesta que llega después de reiniciar (cierre de sesión) se descarta: ver `generacion`.
import { create } from 'zustand';
import { SEGMENTO_VACACIONES } from '../../domain/licencias/estados';
import { hoyCrm } from '../../domain/licencias/fechasCrm';
import {
  ALIAS_TIPO_PROPIAS,
  mapearFeriado,
  mapearLicencia,
  mapearPeriodo,
  mapearSolicitudDeEquipo,
  mapearVacacionPropia,
} from '../../domain/licencias/mapeo';
import type {
  Feriado,
  Licencia,
  PeriodoVacaciones,
  SolicitudDeEquipo,
  TipoDeLicencia,
  VacacionPropia,
} from '../../domain/licencias/tipos';
import { filtrarTiposDeLicencia, perfilDesdeFila } from '../../domain/licencias/tiposDeLicencia';
import { leerCalendario, leerFeriados } from '../../infrastructure/licencias/equipoApi';
import {
  leerFilaDeLegajo,
  leerLicenciasPropias,
  leerTiposDeLicencia,
  registrarConsultaDeTipos,
} from '../../infrastructure/licencias/licenciasApi';
import { leerPeriodosDeVacaciones, leerSolicitudesDeVacaciones } from '../../infrastructure/licencias/vacacionesApi';

export interface Bloque<T> {
  datos: T;
  /** true mientras corre una lectura. */
  cargando: boolean;
  /** true cuando terminó al menos una lectura (con o sin error). */
  cargado: boolean;
  /** true si la última lectura falló. */
  error: boolean;
}

export const bloqueVacio = <T,>(datos: T): Bloque<T> => ({ datos, cargando: false, cargado: false, error: false });

export interface TiposCargados {
  /** Tipos que el empleado puede pedir (filtrados por su perfil y sin vacaciones). */
  disponibles: TipoDeLicencia[];
  /** Id del tipo de licencia de segmento Vacaciones, sacado de la lista SIN filtrar (como ModalSolicitarVacaciones). */
  tipoVacacionesId: string | null;
}

interface BloquesState {
  tipos: Bloque<TiposCargados>;
  licencias: Bloque<Licencia[]>;
  periodos: Bloque<PeriodoVacaciones[]>;
  vacaciones: Bloque<VacacionPropia[]>;
  calendario: Bloque<SolicitudDeEquipo[]>;
  feriados: Bloque<Feriado[]>;
}

type Clave = keyof BloquesState;

interface LicenciasState extends BloquesState {
  cargarTipos: (empleadoId: string) => Promise<void>;
  cargarLicencias: (empleadoId: string) => Promise<void>;
  cargarPeriodos: (empleadoId: string) => Promise<void>;
  cargarVacaciones: (empleadoId: string) => Promise<void>;
  cargarCalendario: (empleadoId: string) => Promise<void>;
  /** Los feriados no dependen del empleado: se leen una sola vez, salvo que se fuerce. */
  cargarFeriados: (forzar?: boolean) => Promise<void>;
  reiniciar: () => void;
}

const estadoInicial = (): BloquesState => ({
  tipos: bloqueVacio<TiposCargados>({ disponibles: [], tipoVacacionesId: null }),
  licencias: bloqueVacio<Licencia[]>([]),
  periodos: bloqueVacio<PeriodoVacaciones[]>([]),
  vacaciones: bloqueVacio<VacacionPropia[]>([]),
  calendario: bloqueVacio<SolicitudDeEquipo[]>([]),
  feriados: bloqueVacio<Feriado[]>([]),
});

// Se incrementa al reiniciar: una lectura que arrancó antes y termina después no escribe datos de otra sesión.
let generacion = 0;
// El portal manda el log de la consulta de tipos una vez por carga de la pantalla.
let logDeTiposEnviado = false;

export const useLicenciasStore = create<LicenciasState>()((set, get) => {
  const correr = async <K extends Clave>(
    clave: K,
    leer: () => Promise<BloquesState[K]['datos']>,
  ): Promise<void> => {
    const mia = generacion;
    set((s) => ({ [clave]: { ...s[clave], cargando: true } }) as unknown as Partial<LicenciasState>);
    try {
      const datos = await leer();
      if (mia !== generacion) return;
      set({ [clave]: { datos, cargando: false, cargado: true, error: false } } as unknown as Partial<LicenciasState>);
    } catch {
      if (mia !== generacion) return;
      set(
        (s) =>
          ({ [clave]: { ...s[clave], cargando: false, cargado: true, error: true } }) as unknown as Partial<LicenciasState>,
      );
    }
  };

  return {
    ...estadoInicial(),

    cargarTipos: (empleadoId) =>
      correr('tipos', async () => {
        const [todos, filaLegajo] = await Promise.all([leerTiposDeLicencia(), leerFilaDeLegajo(empleadoId)]);
        const perfil = perfilDesdeFila(filaLegajo);
        const { disponibles, filtradas } = filtrarTiposDeLicencia(todos, perfil);
        if (!logDeTiposEnviado) {
          logDeTiposEnviado = true;
          registrarConsultaDeTipos(empleadoId, filaLegajo, perfil, todos, filtradas);
        }
        const tipoVacaciones = todos.find((t) => t?.new_segmento === SEGMENTO_VACACIONES);
        return { disponibles, tipoVacacionesId: tipoVacaciones?.new_tipodelicenciaid ?? null };
      }),

    cargarLicencias: (empleadoId) =>
      correr('licencias', async () => {
        const filas = await leerLicenciasPropias(empleadoId);
        return filas.map((f) => mapearLicencia(f, ALIAS_TIPO_PROPIAS));
      }),

    cargarPeriodos: (empleadoId) =>
      correr('periodos', async () => {
        const filas = await leerPeriodosDeVacaciones(empleadoId, hoyCrm());
        return filas.map(mapearPeriodo);
      }),

    cargarVacaciones: (empleadoId) =>
      correr('vacaciones', async () => {
        const filas = await leerSolicitudesDeVacaciones(empleadoId);
        return filas.map(mapearVacacionPropia);
      }),

    cargarCalendario: (empleadoId) =>
      correr('calendario', async () => {
        const filas = await leerCalendario(empleadoId);
        return filas.map((f) => mapearSolicitudDeEquipo(f, 'calendario'));
      }),

    cargarFeriados: async (forzar = false) => {
      const actual = get().feriados;
      if (!forzar && (actual.cargado && !actual.error)) return;
      await correr('feriados', async () => {
        const filas = await leerFeriados();
        return filas.map(mapearFeriado);
      });
    },

    reiniciar: () => {
      generacion += 1;
      logDeTiposEnviado = false;
      set(estadoInicial());
    },
  };
});
