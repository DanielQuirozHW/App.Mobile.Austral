// Estado de la sesión. Equivale al estado de AuthContext.tsx del portal (user, loading, loggingOut).
import { create } from 'zustand';
import type { UserData } from '../../domain/auth/tipos';

type Actualizador = UserData | null | ((prev: UserData | null) => UserData | null);

interface AuthState {
  user: UserData | null;
  /** true hasta que Firebase resuelve si hay sesión (igual que `loading` del portal). */
  loading: boolean;
  /** Overlay "Cerrando sesión…" del portal. */
  cerrandoSesion: boolean;
  setUser: (valor: Actualizador) => void;
  setLoading: (valor: boolean) => void;
  setCerrandoSesion: (valor: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,
  cerrandoSesion: false,
  setUser: (valor) => set((estado) => ({ user: typeof valor === 'function' ? valor(estado.user) : valor })),
  setLoading: (valor) => set({ loading: valor }),
  setCerrandoSesion: (valor) => set({ cerrandoSesion: valor }),
}));
