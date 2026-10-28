// Cliente HTTP central. Port de HW-Austral/Portal-Austral-Dev -> src/configs/apiClient.ts
//
// Motivo (según el portal): el backend devuelve de forma intermitente 200 con cuerpo vacío.
// Axios no lanza error ante un 200, así que este wrapper reintenta esos baches de forma transparente.
// `[]` y `{}` son respuestas VÁLIDAS y no se reintentan; solo "" / null / undefined.
// Las mutaciones (PUT/POST/DELETE que escriben) NO se reintentan: se usa `reintentos: 0`.
//
// Diagnóstico (solo en desarrollo, `__DEV__`): cada llamada que falla deja una línea que empieza con "[API]" en el
// log de la app (Logcat, filtro `tag:ReactNativeJS`). Muestra método, ruta SIN el servidor, estado HTTP o código de
// red y el mensaje. No se registra el cuerpo enviado (puede traer credenciales) ni los encabezados.
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

const TIMEOUT_MS = 30000;
const REINTENTOS_DEFAULT = 2; // hasta 3 intentos en total
const BACKOFF_BASE_MS = 300;

// El primer reintento de un 200-vacío sale inmediato; desde el segundo hay backoff.
const esperaReintentoVacio = (intento: number): number =>
  intento === 0 ? 0 : BACKOFF_BASE_MS * 2 ** (intento - 1);

const apiClient = axios.create({ timeout: TIMEOUT_MS });

// Proveedor del token del usuario de servicio. Lo registra tokenStore (evita import circular).
let proveedorDeToken: (() => string) | null = null;
export const registrarProveedorDeToken = (fn: () => string): void => {
  proveedorDeToken = fn;
};

// Agrega Bearer salvo que la request ya traiga su propio Authorization.
// A VERIFICAR contra el portal: dónde exactamente agrega el header en cada llamada (ver PENDIENTES).
apiClient.interceptors.request.use((config) => {
  const token = proveedorDeToken?.() ?? '';
  if (token && !config.headers?.Authorization) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

/** La ruta sin el servidor: "https://servidor/api/x" -> "/api/x". Así el log se puede compartir sin mostrar la URL. */
const rutaDe = (url?: string): string => (url ?? '').replace(/^https?:\/\/[^/]+/, '') || '(sin url)';

if (__DEV__) {
  apiClient.interceptors.response.use(
    (resp) => resp,
    (error: any) => {
      const metodo = String(error?.config?.method ?? '').toUpperCase();
      const resultado = error?.response?.status ?? error?.code ?? 'sin respuesta';
      const cuerpo = error?.response?.data;
      const texto = typeof cuerpo === 'string' ? cuerpo : cuerpo ? JSON.stringify(cuerpo) : '';
      console.log(
        `[API] ${metodo} ${rutaDe(error?.config?.url)} -> ${resultado} | ${error?.message ?? ''}${
          texto ? ` | ${texto.slice(0, 200)}` : ''
        }`,
      );
      return Promise.reject(error);
    },
  );
}

const esCuerpoVacioTransitorio = (data: unknown): boolean =>
  data === '' || data === null || data === undefined;

// Red caída/timeout (sin respuesta), 5xx, 429 y 408 son reintentables.
const esErrorReintentable = (error: any): boolean => {
  if (axios.isCancel?.(error)) return false;
  if (!error?.response) return true;
  const status = error.response.status;
  return status >= 500 || status === 429 || status === 408;
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface RetryConfig extends AxiosRequestConfig {
  /** Reintentos adicionales (por defecto 2 => 3 intentos). */
  reintentos?: number;
  /** Reintentar también cuando un 200 trae cuerpo vacío. Solo en lecturas/login. */
  reintentarVacio?: boolean;
}

export async function requestConReintento<T = any>(config: RetryConfig): Promise<AxiosResponse<T>> {
  const maxReintentos = config.reintentos ?? REINTENTOS_DEFAULT;
  const reintentarVacio = config.reintentarVacio ?? false;
  let ultimoError: unknown;

  for (let intento = 0; intento <= maxReintentos; intento++) {
    try {
      const resp = await apiClient.request<T>(config);

      // 204 es válido en la API v1: no se reintenta.
      if (
        reintentarVacio &&
        resp.status !== 204 &&
        esCuerpoVacioTransitorio(resp.data) &&
        intento < maxReintentos
      ) {
        const espera = esperaReintentoVacio(intento);
        if (espera > 0) await sleep(espera);
        continue;
      }

      if (__DEV__ && reintentarVacio && resp.status !== 204 && esCuerpoVacioTransitorio(resp.data)) {
        console.log(
          `[API] ${String(config.method ?? '').toUpperCase()} ${rutaDe(config.url)} -> ${resp.status} con cuerpo vacío tras ${
            maxReintentos + 1
          } intentos`,
        );
      }
      return resp;
    } catch (error) {
      ultimoError = error;
      if (esErrorReintentable(error) && intento < maxReintentos) {
        await sleep(BACKOFF_BASE_MS * 2 ** intento);
        continue;
      }
      throw error;
    }
  }

  throw ultimoError;
}

export const apiPost = <T = any>(url: string, data?: any, config?: RetryConfig) =>
  requestConReintento<T>({ ...config, method: 'post', url, data });

export const apiGet = <T = any>(url: string, config?: RetryConfig) =>
  requestConReintento<T>({ ...config, method: 'get', url });

export default apiClient;
