// Reglas de los formularios del módulo. Port de Portal-Austral-Dev:
// ModalSolicitud (licencia), ModalSolicitarVacaciones, ModalLicenciasEquipo y ModalAprobarVacacion.
// Son funciones puras: devuelven un mapa campo -> mensaje (vacío si todo está bien).
import type { Opcion } from '../legajo/tipos';
import { diaDeFecha, diasInclusivos } from './fechasCrm';
import { esLicenciaPorMudanza } from './mudanza';
import { limitesDeTipo, mesPermitido, rangoDeMeses } from './tiposDeLicencia';
import type { PeriodoVacaciones, TipoDeLicencia } from './tipos';

export type Errores = Record<string, string>;

/** El portal rechaza los archivos de 15000000 bytes o más (no 15 MiB). */
export const LIMITE_ARCHIVO_PORTAL_BYTES = 15000000;
export const MSG_ARCHIVO_MUY_PESADO = 'El archivo no puede superar los 15 megas';

export const hayArchivoQueSupera = (archivos: { tamanio?: number }[]): boolean =>
  archivos.some((archivo) => (archivo.tamanio ?? 0) >= LIMITE_ARCHIVO_PORTAL_BYTES);

const hayValor = (opcion: Opcion | null | undefined): boolean =>
  Boolean(opcion) && opcion?.value !== null && opcion?.value !== undefined && opcion?.value !== '';

// ---------------------------------------------------------------------------
// Solicitud de licencia
// ---------------------------------------------------------------------------

export interface ValoresDomicilio {
  calle: string;
  nroCalle: string;
  piso: string;
  depto: string;
  codigoPostal: string;
  pais: Opcion | null;
  provincia: Opcion | null;
  localidad: Opcion | null;
}

export const DOMICILIO_VACIO: ValoresDomicilio = {
  calle: '',
  nroCalle: '',
  piso: '',
  depto: '',
  codigoPostal: '',
  pais: null,
  provincia: null,
  localidad: null,
};

export interface ValoresSolicitudLicencia {
  tipo: Opcion | null;
  desde: Date | null;
  hasta: Date | null;
  domicilio: ValoresDomicilio;
}

export const MSG_DIAS_DISPONIBLES = 'Ha superado la cantidad de días disponibles para esta licencia, por favor, revisar.';
export const MSG_DIAS_CORRIDOS = 'Ha superado la cantidad de días corridos disponibles para esta licencia. Por favor, corregir.';
export const MSG_CERTIFICADO_REQUERIDO = 'Debe adjuntar el certificado para este tipo de licencia.';

/** domicilioSchema de ModalSolicitud (mismas reglas que el domicilio real de Datos personales + tope de 100). */
export const validarDomicilio = (d: ValoresDomicilio): Errores => {
  const e: Errores = {};
  const calle = d.calle.trim();
  if (!calle) e.calle = 'La calle es obligatoria';
  else if (calle.length > 100) e.calle = 'Máximo 100 caracteres';

  const nro = d.nroCalle.trim();
  if (!nro) e.nroCalle = 'El número de calle es obligatorio';
  else if (!Number.isFinite(Number(nro))) e.nroCalle = 'Debe ingresar un número';

  if (d.piso.length > 100) e.piso = 'Máximo 100 caracteres';
  if (d.depto.length > 100) e.depto = 'Máximo 100 caracteres';

  if (!d.codigoPostal) e.codigoPostal = 'El código postal es obligatorio';
  else if (!/^[a-zA-Z0-9]*$/.test(d.codigoPostal)) e.codigoPostal = 'Solo se permiten letras y números';
  else if (d.codigoPostal.length > 10) e.codigoPostal = 'El código postal no puede exceder los 10 caracteres';

  if (!hayValor(d.pais)) e.pais = 'El país es obligatorio';
  if (!hayValor(d.provincia)) e.provincia = 'La provincia es obligatoria';
  return e;
};

/**
 * Validaciones base del esquema yup + las que el portal resuelve con setError según el tipo elegido
 * (rango de meses, días disponibles, máximo de días corridos y certificado obligatorio).
 * Claves: tipo, desde, hasta, dias, certificado y las del domicilio (calle, nroCalle, piso, depto, codigoPostal, pais, provincia).
 */
export const validarSolicitudLicencia = (
  valores: ValoresSolicitudLicencia,
  tipo: TipoDeLicencia | null,
  cantidadArchivos: number,
): Errores => {
  const e: Errores = {};
  const desdeDia = diaDeFecha(valores.desde);
  const hastaDia = diaDeFecha(valores.hasta);

  if (!hayValor(valores.tipo)) e.tipo = 'Por favor indique el tipo de licencia.';
  if (!valores.desde) e.desde = 'Indica la fecha de inicio de la licencia';
  if (!valores.hasta) e.hasta = 'Indica la fecha de fin de la licencia';
  else if (desdeDia && hastaDia && hastaDia < desdeDia) e.hasta = 'La fecha fin no puede ser anterior a la fecha de inicio';

  // Rango de meses del tipo: si no está configurado no se bloquea.
  const rango = rangoDeMeses(tipo);
  if (rango) {
    if (valores.desde && !e.desde && !mesPermitido(valores.desde.getMonth() + 1, rango.desde, rango.hasta)) {
      e.desde = rango.mensaje;
    }
    if (valores.hasta && !e.hasta && !mesPermitido(valores.hasta.getMonth() + 1, rango.desde, rango.hasta)) {
      e.hasta = rango.mensaje;
    }
  }

  const dias = diasInclusivos(valores.desde, valores.hasta);
  if (tipo && dias) {
    const limites = limitesDeTipo(tipo);
    if (limites.tieneLimiteAnual && limites.diasDisponibles > 0 && dias > limites.diasDisponibles) {
      e.dias = MSG_DIAS_DISPONIBLES;
    } else if (limites.maxCorridos > 0 && dias > limites.maxCorridos) {
      e.dias = MSG_DIAS_CORRIDOS;
    }
  }

  if (tipo?.certificadoObligatorio === 1 && cantidadArchivos === 0) e.certificado = MSG_CERTIFICADO_REQUERIDO;

  if (esLicenciaPorMudanza(tipo)) Object.assign(e, validarDomicilio(valores.domicilio));
  return e;
};

// ---------------------------------------------------------------------------
// Solicitud de vacaciones
// ---------------------------------------------------------------------------

export interface ValoresVacaciones {
  desde: Date | null;
  hasta: Date | null;
  comentarios: string;
}

export const MAX_COMENTARIOS_VACACIONES = 200;

const contarPalabras = (texto: string): number => texto.trim().split(/\s+/).filter(Boolean).length;

/** `hoy` es yyyy-MM-dd. Las fechas se comparan como texto (desdeGoceIso / hastaGoceIso del período). */
export const validarSolicitudVacaciones = (
  valores: ValoresVacaciones,
  periodo: PeriodoVacaciones,
  hoy: string,
): Errores => {
  const e: Errores = {};
  const desdeDia = diaDeFecha(valores.desde);
  const hastaDia = diaDeFecha(valores.hasta);

  if (!valores.desde) e.desde = 'Indica la fecha de inicio de vacaciones';
  else if (!desdeDia) e.desde = 'La fecha no es válida';
  else if (desdeDia < hoy) e.desde = 'La fecha de inicio debe ser igual o posterior a hoy';
  else if (periodo.desdeGoceIso && desdeDia < periodo.desdeGoceIso) {
    e.desde = `El inicio debe estar dentro del período de goce, a partir del ${periodo.fechaDesdePeriodo}`;
  }

  if (!valores.hasta) e.hasta = 'Indica la fecha de fin de vacaciones';
  else if (!hastaDia) e.hasta = 'La fecha no es válida';
  else if (desdeDia && hastaDia < desdeDia) e.hasta = 'La fecha fin no puede ser anterior a la fecha de inicio';
  else if (periodo.hastaGoceIso && hastaDia > periodo.hastaGoceIso) {
    e.hasta = `El fin no puede pasar del límite de goce (${periodo.fechaHastaPeriodo})`;
  }

  const dias = diasInclusivos(valores.desde, valores.hasta);
  if (dias !== null) {
    if (dias < 1) e.dias = 'Debe solicitar al menos 1 día';
    else if (dias > periodo.diasPendientesTotales) e.dias = 'Los días solicitados exceden los días disponibles';
  }

  if (valores.comentarios.length > MAX_COMENTARIOS_VACACIONES) {
    e.comentarios = 'El campo "Comentarios" no puede superar los 200 caracteres.';
  } else if (contarPalabras(valores.comentarios) > 200) {
    e.comentarios = 'No puede superar las 200 palabras';
  }
  return e;
};

// ---------------------------------------------------------------------------
// Aprobación del líder
// ---------------------------------------------------------------------------

/** Motivo de rechazo de una licencia: obligatorio y hasta 300 caracteres. */
export const validarMotivoRechazoLicencia = (motivo: string): string | null => {
  if (!motivo.trim()) return 'Debe indicar el motivo del rechazo';
  if (motivo.length > 300) return 'El motivo de rechazo no puede superar los 300 caracteres';
  return null;
};

export const MAX_MOTIVO_VACACION = 200;

/** Motivo de rechazo de unas vacaciones: obligatorio y hasta 200 caracteres. */
export const validarMotivoRechazoVacacion = (motivo: string): string | null => {
  if (!motivo.trim()) return 'El motivo de rechazo es obligatorio';
  if (motivo.length > MAX_MOTIVO_VACACION) return 'No puede superar los 200 caracteres';
  return null;
};
