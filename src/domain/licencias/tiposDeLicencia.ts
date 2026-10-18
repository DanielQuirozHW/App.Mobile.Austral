// Qué tipos de licencia puede pedir el empleado. Port de Portal-Austral-Dev -> src/hooks/useGetTipoLicencias.ts
// (filtros) y de las reglas de ModalSolicitud (rango de meses y límites de días).
import { differenceInMonths } from 'date-fns';
import { parsearFecha } from '../legajo/fechas';
import { SEGMENTO_VACACIONES } from './estados';
import { mapearTipoDeLicencia } from './mapeo';
import type { Fila, TipoDeLicencia } from './tipos';

/** Datos del legajo que usa el filtro (useMiLegajo: generoSegunDni, unidadOrganizativa, etc.). */
export interface PerfilParaLicencias {
  sexo: string;
  unidad: string;
  area: string;
  contratacion: string;
  /** new_fechadeantigedadreconocida */
  antiguedadFecha: string | null;
}

const limpio = (valor: unknown): string => (valor ? String(valor).trim() : '');

/** Perfil a partir de la fila cruda de new_empleado (mismos campos que useMiLegajo). */
export const perfilDesdeFila = (fila: Fila | null | undefined): PerfilParaLicencias => ({
  sexo: limpio(fila?.new_generosegundni),
  unidad: limpio(fila?._new_unidadorganizativa_value),
  area: limpio(fila?.new_denominacionareadepersonal),
  contratacion: limpio(fila?.new_tipodecontratacion),
  antiguedadFecha: fila?.new_fechadeantigedadreconocida ?? null,
});

const incluye = (lista: unknown, valor: string): boolean =>
  Boolean(lista) &&
  String(lista)
    .split(',')
    .map((s) => s.trim())
    .includes(valor);

export interface ResultadoFiltroTipos {
  /** Tipos que pasan todos los filtros y no son vacaciones, listos para el select. */
  disponibles: TipoDeLicencia[];
  /** Filas crudas que pasaron los filtros (antes de sacar vacaciones). Es lo que el portal manda al log. */
  filtradas: Fila[];
}

/**
 * Filtros del portal: sexo, unidad organizativa, área del personal, antigüedad mínima y tipo de contratación.
 * Si falta cualquiera de los datos del perfil la lista queda vacía (igual que en el portal).
 */
export const filtrarTiposDeLicencia = (
  filas: Fila[],
  perfil: PerfilParaLicencias,
  ahora: Date = new Date(),
): ResultadoFiltroTipos => {
  if (!Array.isArray(filas) || filas.length === 0) return { disponibles: [], filtradas: [] };
  if (!perfil.unidad || !perfil.sexo || !perfil.area || !perfil.contratacion || !perfil.antiguedadFecha) {
    return { disponibles: [], filtradas: [] };
  }

  const fechaAntiguedad = parsearFecha(perfil.antiguedadFecha);
  const mesesAntiguedad = fechaAntiguedad ? differenceInMonths(ahora, fechaAntiguedad) : Number.NaN;

  const filtradas = filas.filter((licencia) => {
    const cumpleGenero = incluye(licencia?.new_sexo, perfil.sexo);

    const idUnidadLicencia = limpio(licencia?._new_unidadacademica_value);
    const cumpleUnidad = idUnidadLicencia ? idUnidadLicencia === perfil.unidad : true;

    const cumpleArea = incluye(licencia?.new_areadelpersonal, perfil.area);

    const minima = licencia?.new_antiguedadminima;
    const cumpleAntiguedad = minima !== undefined && minima !== null ? mesesAntiguedad >= Number(minima) : true;

    const cumpleContratacion = incluye(licencia?.new_tiposdecontratacion, perfil.contratacion);

    return cumpleGenero && cumpleUnidad && cumpleArea && cumpleAntiguedad && cumpleContratacion;
  });

  const disponibles = filtradas.filter((f) => f?.new_segmento !== SEGMENTO_VACACIONES).map(mapearTipoDeLicencia);
  return { disponibles, filtradas };
};

// ---------------------------------------------------------------------------
// Rango de meses en que se puede tomar un tipo
// ---------------------------------------------------------------------------

const MESES: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

export const numeroDeMes = (nombre: string | null | undefined): number | null =>
  nombre ? (MESES[nombre.toLowerCase()] ?? null) : null;

/** true si `mes` está dentro de [desde..hasta], con cruce de año (ej. julio..marzo). */
export const mesPermitido = (mes: number, desde: number, hasta: number): boolean =>
  desde <= hasta ? mes >= desde && mes <= hasta : mes >= desde || mes <= hasta;

export interface RangoDeMeses {
  desde: number;
  hasta: number;
  mensaje: string;
}

/** Rango configurado en el tipo, o null si falta (en ese caso no se bloquea nada). */
export const rangoDeMeses = (tipo: TipoDeLicencia | null | undefined): RangoDeMeses | null => {
  if (!tipo) return null;
  const desde = numeroDeMes(tipo.mesDesdeTexto);
  const hasta = numeroDeMes(tipo.mesHastaTexto);
  if (!desde || !hasta) return null;
  return {
    desde,
    hasta,
    mensaje: `La licencia seleccionada solo se puede tomar desde ${tipo.mesDesdeTexto} hasta ${tipo.mesHastaTexto}.`,
  };
};

// ---------------------------------------------------------------------------
// Límites de días
// ---------------------------------------------------------------------------

export interface LimitesDeTipo {
  tieneLimiteAnual: boolean | null;
  /** Sin saldo calculado por el backend, el portal usa los días anuales de ley (diasDisponiblesUI). */
  diasDisponibles: number;
  maxCorridos: number;
}

export const limitesDeTipo = (tipo: TipoDeLicencia | null | undefined): LimitesDeTipo => ({
  tieneLimiteAnual: tipo?.tieneLimiteAnual ?? null,
  diasDisponibles: tipo?.diasAnuales ?? 0,
  maxCorridos: tipo?.maxDiasCorridos ?? 0,
});

/** Texto de ayuda del campo "Días Solicitados" (helperDiasSolicitados del portal, sin el caso de error). */
export const ayudaDiasSolicitados = (tipo: TipoDeLicencia | null | undefined): string => {
  if (!tipo) return 'Elegí un tipo de licencia para ver el máximo permitido';
  const limites = limitesDeTipo(tipo);
  const partes: string[] = [];
  if (limites.tieneLimiteAnual && limites.diasDisponibles > 0) partes.push(`Disponibles: ${limites.diasDisponibles}`);
  if (limites.maxCorridos > 0) partes.push(`Máx. corridos: ${limites.maxCorridos}`);
  return partes.length > 0 ? partes.join(' • ') : 'No hay un máximo configurado para este tipo de licencia';
};
