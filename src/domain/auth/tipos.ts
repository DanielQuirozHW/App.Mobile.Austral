// Tipos de la sesión. Fuente: Portal-Austral-Dev -> src/context/AuthContext.tsx (UserData)
import type { RolNombramientos, RolPromocion } from '../roles/enums';

export interface UserData {
  nombre?: string;
  empleadoid: string;
  usuarioPortalRh: string;
  photoURL: string;
  photoPORTADA: string;
  /** String ('docente' | 'codocente' | ''), o array cuando tiene los dos puestos. */
  puesto: string | string[];
  /** Funciones de Nombramientos (array; vacío o null si no cumple ninguna). */
  funcionNombramientos?: RolNombramientos[] | null;
  /** Funciones de Promoción (array; vacío o null si no cumple ninguna). */
  funcionPromocion?: RolPromocion[] | null;
  uid: string;
  email: string;
  fullname: string;
  [campo: string]: unknown;
}

export interface LoginParams {
  email: string;
  password: string;
  recordar?: boolean;
}

export interface RegisterParams {
  email: string;
  password: string;
}

/** Resultado de un login: si hay dos puestos, la navegación manda a seleccionar puesto. */
export interface ResultadoLogin {
  requiereSeleccionDePuesto: boolean;
}
