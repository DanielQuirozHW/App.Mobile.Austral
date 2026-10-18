// Token del usuario de servicio de la API. Port de Portal-Austral-Dev -> src/stores/useTokenStore.ts
// Las credenciales llegan por env (siempre vacías en el repo). El token vive solo en memoria.
import { create } from 'zustand';
import { env } from '../env';
import { apiPost, registrarProveedorDeToken } from './apiClient';

export type EstadoOperacion = '' | 'LOADING' | 'EXITO!' | 'ERROR';

// Respuesta de api/Usuarios/login. Se lee `token`; el resto de los campos no está verificado.
export interface TokenServicio {
  token: string;
  expiracion?: string;
  [campo: string]: unknown;
}

// Single-flight: si ya hay un login en curso se reutiliza la misma promesa.
let loginEnCurso: Promise<void> | null = null;

// Ventana corta tras un login exitoso: tapa solo el arranque; el refresco periódico queda intacto.
let ultimoLoginOk = 0;
const TOKEN_FRESCO_MS = 60000;

// El portal renueva el token cada 30 minutos (el JWT dura 90).
export const RENOVACION_MS = 30 * 60 * 1000;

interface TokenState {
  token: TokenServicio | null;
  resultado: EstadoOperacion;
  loginToken: () => Promise<void>;
  limpiar: () => void;
}

export const useTokenStore = create<TokenState>()((set, get) => ({
  token: null,
  resultado: '',

  loginToken: async () => {
    if (loginEnCurso) return loginEnCurso;
    if (get().token?.token && Date.now() - ultimoLoginOk < TOKEN_FRESCO_MS) return;
    set({ resultado: 'LOADING' });

    loginEnCurso = (async () => {
      try {
        const response = await apiPost<TokenServicio>(
          `${env.apiUrl}api/Usuarios/login`,
          { email: env.apiServiceEmail, password: env.apiServicePassword },
          { reintentarVacio: true, reintentos: 3 },
        );
        // Si tras los reintentos el cuerpo sigue vacío, NO se pisa un token previo válido.
        if (!response.data?.token) {
          set({ resultado: 'ERROR' });
          return;
        }
        ultimoLoginOk = Date.now();
        set({ token: response.data, resultado: 'EXITO!' });
      } catch {
        // Un fallo transitorio de red no borra el token existente.
        set({ resultado: 'ERROR' });
      } finally {
        loginEnCurso = null;
      }
    })();

    return loginEnCurso;
  },

  limpiar: () => {
    ultimoLoginOk = 0;
    set({ token: null, resultado: '' });
  },
}));

registrarProveedorDeToken(() => useTokenStore.getState().token?.token ?? '');

let temporizador: ReturnType<typeof setInterval> | null = null;

/** Renueva el token cada 30 minutos (re-login con el usuario de servicio, como el portal). */
export const iniciarRenovacionPeriodica = (): void => {
  if (temporizador) return;
  temporizador = setInterval(() => {
    ultimoLoginOk = 0;
    void useTokenStore.getState().loginToken();
  }, RENOVACION_MS);
};

export const detenerRenovacionPeriodica = (): void => {
  if (temporizador) clearInterval(temporizador);
  temporizador = null;
};
