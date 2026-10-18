// Gestión del líder: solicitudes del equipo y días pendientes. Port de Portal-Austral-Dev ->
// src/hooks/useEsLiderEquipo.ts, useGetLicenciasEquipo (equipoIngresadas), useVacacionesStore.vacacionesEquipoFetch
// y VacacionesEquipoPendientes.
//
// Las licencias se piden por new_aprobador1 = el empleado y las vacaciones por reportaA = el empleado: son dos
// fuentes distintas, igual que en el portal (useSolicitudesEquipo las junta después).
import { create } from 'zustand';
import { ALIAS_TIPO_EQUIPO, mapearDiasPendientesEquipo, mapearLicencia, mapearSolicitudDeEquipo } from '../../domain/licencias/mapeo';
import type { DiasPendientesEquipo, Licencia, SolicitudDeEquipo } from '../../domain/licencias/tipos';
import {
  consultarEsLider,
  leerDiasPendientesDeEquipo,
  leerVacacionesDeEquipo,
} from '../../infrastructure/licencias/equipoApi';
import { leerLicenciasDeEquipo } from '../../infrastructure/licencias/licenciasApi';
import { bloqueVacio, type Bloque } from './licenciasStore';

interface BloquesEquipo {
  /** Si es líder: tiene gente a cargo o aprueba solicitudes. Mientras no se sabe, false. */
  esLider: Bloque<boolean>;
  licencias: Bloque<Licencia[]>;
  vacaciones: Bloque<SolicitudDeEquipo[]>;
  pendientes: Bloque<DiasPendientesEquipo[]>;
}

type Clave = keyof BloquesEquipo;

interface EquipoState extends BloquesEquipo {
  cargarEsLider: (empleadoId: string) => Promise<void>;
  cargarLicencias: (empleadoId: string) => Promise<void>;
  cargarVacaciones: (empleadoId: string) => Promise<void>;
  cargarPendientes: (empleadoId: string) => Promise<void>;
  reiniciar: () => void;
}

const estadoInicial = (): BloquesEquipo => ({
  esLider: bloqueVacio<boolean>(false),
  licencias: bloqueVacio<Licencia[]>([]),
  vacaciones: bloqueVacio<SolicitudDeEquipo[]>([]),
  pendientes: bloqueVacio<DiasPendientesEquipo[]>([]),
});

let generacion = 0;

export const useEquipoStore = create<EquipoState>()((set) => {
  const correr = async <K extends Clave>(clave: K, leer: () => Promise<BloquesEquipo[K]['datos']>): Promise<void> => {
    const mia = generacion;
    set((s) => ({ [clave]: { ...s[clave], cargando: true } }) as unknown as Partial<EquipoState>);
    try {
      const datos = await leer();
      if (mia !== generacion) return;
      set({ [clave]: { datos, cargando: false, cargado: true, error: false } } as unknown as Partial<EquipoState>);
    } catch {
      if (mia !== generacion) return;
      set(
        (s) => ({ [clave]: { ...s[clave], cargando: false, cargado: true, error: true } }) as unknown as Partial<EquipoState>,
      );
    }
  };

  return {
    ...estadoInicial(),

    cargarEsLider: (empleadoId) => correr('esLider', () => consultarEsLider(empleadoId)),

    cargarLicencias: (empleadoId) =>
      correr('licencias', async () => {
        const filas = await leerLicenciasDeEquipo(empleadoId);
        return filas.map((f) => mapearLicencia(f, ALIAS_TIPO_EQUIPO));
      }),

    cargarVacaciones: (empleadoId) =>
      correr('vacaciones', async () => {
        const filas = await leerVacacionesDeEquipo(empleadoId);
        return filas.map((f) => mapearSolicitudDeEquipo(f, 'vacaciones'));
      }),

    cargarPendientes: (empleadoId) =>
      correr('pendientes', async () => {
        const filas = await leerDiasPendientesDeEquipo(empleadoId);
        return filas.map(mapearDiasPendientesEquipo);
      }),

    reiniciar: () => {
      generacion += 1;
      set(estadoInicial());
    },
  };
});
