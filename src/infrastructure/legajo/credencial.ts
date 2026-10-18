// Token del usuario de servicio para las llamadas de legajo.
// El portal le pasa `token` (el del store) a cada función; acá se resuelve en un solo lugar.
// Si todavía no hay token se intenta el login una vez (el store ya hace single-flight).
import { useTokenStore } from '../../config/api/tokenStore';
import { MSG_ERROR_TRANSITORIO } from '../../domain/auth/authError';

export const tokenDeServicio = async (): Promise<string> => {
  let token = useTokenStore.getState().token?.token;
  if (!token) {
    await useTokenStore.getState().loginToken();
    token = useTokenStore.getState().token?.token;
  }
  if (!token) throw new Error(MSG_ERROR_TRANSITORIO);
  return token;
};

export const cabeceraConToken = (token: string) => ({ Authorization: `Bearer ${token}` });
