// Consultas al BO (CRM) para validar al empleado. Port de Portal-Austral-Dev -> src/context/AuthContext.tsx
// Todas van por api/consultafetchs (o api/consultafetch en el registro) con el token del usuario de servicio.
import { apiPost } from '../../config/api/apiClient';
import { env } from '../../config/env';
import { MSG_ERROR_TRANSITORIO } from '../../domain/auth/authError';
import {
  resolverFuncionNombramientos,
  resolverFuncionPromocion,
} from '../../domain/roles/funciones';
import type { RolNombramientos, RolPromocion } from '../../domain/roles/enums';

/** Fila de new_empleado tal como la devuelve el BO (solo los campos que usa el login). */
export interface EmpleadoBO {
  new_name?: string;
  new_empleadoid?: string;
  new_correoelectronicoportal?: string;
  new_tieneusuarioportaldocente?: boolean;
  new_tieneusuarioportalcodocente?: boolean;
  new_roldocente?: unknown;
  [campo: string]: unknown;
}

// Atributo de la posición "principal" (lookup). Se mantiene igual que el portal.
const ATRIBUTOS_POSICION = '<attribute name="new_posicin" />';

// El correo va dentro de XML: se escapa para que no pueda romper la consulta.
const escaparXml = (valor: string): string =>
  valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const consultar = (ruta: 'consultafetchs' | 'consultafetch', entidad: string, fetch: string, token: string) =>
  apiPost<unknown>(
    `${env.apiUrl}api/${ruta}`,
    { entidad, fetch },
    { headers: { Authorization: `Bearer ${token}` }, reintentarVacio: true, reintentos: 3 },
  );

/** Login con el usuario de servicio (mismo POST que tokenStore, sin pasar por el store, como el portal). */
export const obtenerTokenDeServicio = async (): Promise<string> => {
  const resp = await apiPost<{ token?: string }>(
    `${env.apiUrl}api/Usuarios/login`,
    { email: env.apiServiceEmail, password: env.apiServicePassword },
    { reintentarVacio: true, reintentos: 3 },
  );
  // 200 con cuerpo vacío aun tras reintentar: fallo transitorio, NO credenciales inválidas.
  if (!resp.data?.token) throw new Error(MSG_ERROR_TRANSITORIO);
  return resp.data.token;
};

export type VarianteConsulta = 'email' | 'microsoft';

export type ResultadoConsultaEmpleado =
  | { tipo: 'ok'; empleado: EmpleadoBO }
  | { tipo: 'inexistente' } // array válido y vacío: la cuenta no existe o no está habilitada
  | { tipo: 'transitorio' }; // cuerpo no-array tras reintentar: bache del backend, NO desloguear

const clasificar = (data: unknown): ResultadoConsultaEmpleado => {
  if (!Array.isArray(data)) return { tipo: 'transitorio' };
  if (data.length === 0) return { tipo: 'inexistente' };
  return { tipo: 'ok', empleado: data[0] as EmpleadoBO };
};

/** Empleado habilitado (docente o codocente) por correo del portal. Dos variantes de atributos, como el portal. */
export const buscarEmpleadoHabilitado = async (
  email: string,
  token: string,
  variante: VarianteConsulta,
): Promise<ResultadoConsultaEmpleado> => {
  const correo = escaparXml(email);
  const atributosExtra =
    variante === 'microsoft'
      ? `<attribute name="new_cuitcuil" />
         <attribute name="new_correoelectronico" />
         <attribute name="new_numerolegajo" />`
      : '';
  const fetch = `<entity name="new_empleado">
    <attribute name="new_name" />
    ${atributosExtra}
    <attribute name="new_empleadoid" />
    <attribute name="new_correoelectronicoportal" />
    <attribute name="new_tieneusuarioportaldocente" />
    <attribute name="new_tieneusuarioportalcodocente" />
    <attribute name="new_roldocente" />
    ${ATRIBUTOS_POSICION}
    <order attribute="new_numerolegajo" descending="false" />
    <filter type="and">
      <filter type="or">
        <filter type="and">
          <condition attribute="new_tieneusuarioportaldocente" operator="eq" value="1" />
        </filter>
        <condition attribute="new_tieneusuarioportalcodocente" operator="eq" value="1" />
      </filter>
      <condition attribute="new_correoelectronicoportal" operator="eq" value="${correo}" />
    </filter>
  </entity>`;
  const resp = await consultar('consultafetchs', 'new_empleados', fetch, token);
  return clasificar(resp.data);
};

/** Revalidación en segundo plano: empleado por correo, sin filtrar por docente/codocente. */
export const buscarEmpleadoParaRevalidar = async (email: string, token: string): Promise<EmpleadoBO | null> => {
  const fetch = `<entity name="new_empleado">
    <attribute name="new_name" />
    <attribute name="new_empleadoid" />
    <attribute name="new_correoelectronicoportal" />
    <attribute name="new_tieneusuarioportaldocente" />
    <attribute name="new_tieneusuarioportalcodocente" />
    ${ATRIBUTOS_POSICION}
    <filter type="and">
      <condition attribute="new_correoelectronicoportal" operator="eq" value="${escaparXml(email)}" />
    </filter>
  </entity>`;
  const resp = await consultar('consultafetchs', 'new_empleados', fetch, token);
  return Array.isArray(resp.data) && resp.data.length > 0 ? (resp.data[0] as EmpleadoBO) : null;
};

/** Registro: busca al empleado por correo del portal (api/consultafetch, singular). Datos para el doc de `usuarios`. */
export const buscarEmpleadoParaRegistro = async (email: string, token: string): Promise<Record<string, any> | null> => {
  const fetch = `<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
    <entity name='new_empleado'>
      <attribute name='new_name' />
      <attribute name='new_correoelectronicoportal' />
      <attribute name='new_empleadoid' />
      <attribute name="new_puesto" />
      <attribute name='ownerid' />
      <order attribute='new_numerolegajo' descending='false' />
      <filter type='and'>
        <condition attribute='new_correoelectronicoportal' operator='eq' value='${escaparXml(email)}' />
      </filter>
    </entity>
  </fetch>`;
  try {
    const resp = await consultar('consultafetch', 'new_empleados', fetch, token);
    return Array.isArray(resp.data) && resp.data.length > 0 ? (resp.data[0] as Record<string, any>) : null;
  } catch {
    // El portal ignora el error de esta consulta y cae en "no existe una cuenta".
    return null;
  }
};

export interface FuncionesResueltas {
  nombramientos: RolNombramientos[];
  promocion: RolPromocion[];
}

/**
 * TODAS las posiciones ACTIVAS del empleado (new_posicion por new_empleadoactual) y las funciones que cumple
 * en cada módulo. Si algo falla devuelve vacío (igual que el portal).
 */
export const funcionesDesdeTodasLasPosiciones = async (
  empleadoId: string | undefined,
  token: string,
): Promise<FuncionesResueltas> => {
  const vacio: FuncionesResueltas = { nombramientos: [], promocion: [] };
  if (!empleadoId) return vacio;
  try {
    const fetch = `<entity name="new_posicion">
      <attribute name="new_name" />
      <filter type="and">
        <condition attribute="statecode" operator="eq" value="0" />
        <condition attribute="new_empleadoactual" operator="eq" value="{${escaparXml(empleadoId)}}" />
      </filter>
    </entity>`;
    const resp = await consultar('consultafetchs', 'new_posicions', fetch, token);
    if (!Array.isArray(resp.data)) return vacio;
    const nombres = resp.data.map((fila: any) => fila?.new_name as string | undefined);
    const nombramientos = nombres
      .map((n) => resolverFuncionNombramientos(n))
      .filter((r): r is RolNombramientos => r !== null);
    const promocion = nombres.map((n) => resolverFuncionPromocion(n)).filter((r): r is RolPromocion => r !== null);
    return { nombramientos: [...new Set(nombramientos)], promocion: [...new Set(promocion)] };
  } catch {
    return vacio;
  }
};

/** Puesto según los flags del empleado: ambos -> array, uno -> string, ninguno -> ''. */
export const puestoDesdeEmpleado = (empleado: EmpleadoBO): string | string[] => {
  const esDocente = empleado.new_tieneusuarioportaldocente === true;
  const esCodocente = empleado.new_tieneusuarioportalcodocente === true;
  if (esDocente && esCodocente) return ['docente', 'codocente'];
  if (esDocente) return 'docente';
  if (esCodocente) return 'codocente';
  return '';
};
