// Rol (puesto) elegido. Port de Portal-Austral-Dev -> src/context/roleContext.tsx
// y de la pantalla src/app/(blank)/seleccionar-puesto/page.tsx.
//
// Reglas verificadas en el portal:
//  - user.puesto puede ser array, string o vacío.
//  - Si el rol guardado (`selectedRole`) está entre los roles del usuario se usa; si no, se usa el primero y se guarda.
//  - Tras un login con dos puestos se muestra la pantalla de selección. Con uno solo se entra directo.
import { create } from 'zustand';
import type { UserData } from '../../domain/auth/tipos';
import { CLAVE_ROL_SELECCIONADO, guardarTexto, leerTexto } from '../../infrastructure/storage/almacenamiento';

interface RolState {
  role: string | null;
  userRoles: string[];
  loading: boolean;
  /** true después de un login con varios puestos, hasta que el usuario elige uno. */
  seleccionPendiente: boolean;
  sincronizarConUsuario: (user: UserData | null) => Promise<void>;
  seleccionar: (rol: string) => Promise<void>;
  marcarSeleccionPendiente: () => void;
  reiniciar: () => void;
}

const ESTADO_INICIAL = { role: null, userRoles: [] as string[], loading: true, seleccionPendiente: false };

export const useRolStore = create<RolState>()((set) => ({
  ...ESTADO_INICIAL,

  sincronizarConUsuario: async (user) => {
    if (!user) return;
    if (user.puesto) {
      const roles = Array.isArray(user.puesto) ? user.puesto : [user.puesto];
      const guardado = await leerTexto(CLAVE_ROL_SELECCIONADO);
      if (guardado && roles.includes(guardado)) {
        set({ userRoles: roles, role: guardado, loading: false });
        return;
      }
      await guardarTexto(CLAVE_ROL_SELECCIONADO, roles[0]);
      set({ userRoles: roles, role: roles[0], loading: false });
      return;
    }
    set({ loading: false });
  },

  seleccionar: async (rol) => {
    set({ role: rol, seleccionPendiente: false });
    await guardarTexto(CLAVE_ROL_SELECCIONADO, rol);
  },

  marcarSeleccionPendiente: () => set({ seleccionPendiente: true }),

  reiniciar: () => set({ ...ESTADO_INICIAL }),
}));

/** Datos de cada tarjeta de la pantalla de selección (ROLE_META del portal). */
export const metaDeRol = (puesto: string): { label: string; descripcion: string } => {
  if (puesto === 'docente') return { label: 'Docente', descripcion: 'Acceso al portal docente y plan de trabajo' };
  if (puesto === 'codocente') {
    return { label: 'Staff', descripcion: 'Acceso al portal de gestión del desempeño' };
  }
  return { label: puesto.charAt(0).toUpperCase() + puesto.slice(1), descripcion: 'Acceso al portal' };
};

/** Datos personales solo está disponible para estos puestos (ProtectedRoute allowedRoles=["docente", "codocente"] del portal). */
export const puedeVerLegajo = (puesto: string | null): boolean => puesto === 'docente' || puesto === 'codocente';
