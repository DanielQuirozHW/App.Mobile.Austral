// Lecturas del Tablero de Inicio. Port de Portal-Austral-Dev -> src/hooks/useGetFeriados.ts y src/hooks/useGetCumpleanios.ts.
// Las dos son FetchXML sobre consultafetchs con el token del usuario de servicio.
import { fechaDeHoyEnArgentina } from '../../domain/inicio/tablero';
import { leerCatalogoFetchXml } from '../perfil/perfilApi';

/**
 * Feriados activos. El portal los pide ordenados por fecha descendente; acá se piden ascendente porque el tablero
 * los vuelve a ordenar por fecha (no cambia el resultado).
 */
export const leerFeriados = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_diasferiadoses',
    'new_diasferiados',
    ['new_name', 'new_fecha', 'new_diasferiadosid'],
    'new_fecha',
  );

// Caché del portal (módulo): evita volver a pedir los empleados en cada visita a Inicio. Vence al cambiar el día en Argentina.
let cacheCumpleanios: { dia: string; datos: unknown } | null = null;

/** Empleados activos con su fecha de nacimiento y unidad organizativa (el filtro por día se hace en el cliente, como el portal). */
export const leerEmpleadosParaCumpleanios = async (): Promise<unknown> => {
  const hoy = fechaDeHoyEnArgentina(new Date()).clave;
  if (cacheCumpleanios && cacheCumpleanios.dia === hoy) return cacheCumpleanios.datos;
  const datos = await leerCatalogoFetchXml(
    'new_empleados',
    'new_empleado',
    ['new_name', 'new_fechanacimiento', 'new_unidadorganizativa'],
    'new_fechanacimiento',
  );
  cacheCumpleanios = { dia: hoy, datos };
  return datos;
};
