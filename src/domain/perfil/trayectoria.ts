// Tipos, mapeo de filas del CRM y armado de payloads de Perfil > Trayectoria profesional.
// Port de Portal-Austral-Dev -> src/hooks/trayectoria/*, src/stores/useTrayectoriaStore.ts y
// src/app/(dashboard)/perfil/trayectoria/page.tsx con sus modales.
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { aFechaApi } from '../legajo/fechas';
import type { Opcion } from '../legajo/tipos';
import {
  FV,
  booleanAOpcion,
  fechaDeFila,
  opcionABoolean,
  opcionDeFila,
  opcionDeLista,
  texto,
  type Fila,
  type OpcionONull,
} from './comun';
import { AMBITOS, SECTORES_INDUSTRIA, TIPOS_DEDICACION } from './trayectoriaOpciones';

export { mapearEmpleadoFormacion as mapearEmpleadoTrayectoria } from './formacion';

/** "septiembre 2025" -> "Septiembre 2025". */
export const aMesAnioVisible = (fecha: Date | null | undefined): string => {
  if (!fecha) return '';
  const t = format(fecha, 'LLLL yyyy', { locale: es });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/** Los selectores de mes y año del portal guardan el día 1; a la API va el día 2 del mes (evita el corrimiento de zona). */
export const mesAnioAFechaApi = (fecha: Date | null | undefined): string =>
  fecha ? aFechaApi(new Date(fecha.getFullYear(), fecha.getMonth(), 2, 12, 0, 0, 0)) : '';

const numeroOCero = (valor: string): number => Number(valor) || 0;

// ---------------------------------------------------------------------------
// Experiencia laboral fuera del ámbito académico
// ---------------------------------------------------------------------------

export interface ExperienciaFuera {
  id: string;
  cargo: string;
  institucion: string;
  sector: Opcion;
  otroSector: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  dedicacion: string;
  personasACargo: string;
  responsabilidades: string;
  logros: string;
}

export const mapearExperiencia = (fila: Fila): ExperienciaFuera => ({
  id: texto(fila?.new_experienciafueraambitoacademicoid),
  cargo: texto(fila?.new_cargoposicion),
  institucion: texto(fila?.new_institucionempresa),
  sector: opcionDeFila(fila, 'new_sectorindustria'),
  otroSector: texto(fila?.new_sectorindustriaotro),
  fechaInicio: fechaDeFila(fila, 'new_fechadeinicio'),
  fechaFin: fechaDeFila(fila, 'new_fechadefin'),
  dedicacion: texto(fila?.new_dedicacionhorariasemanal),
  personasACargo: texto(fila?.new_personasacargo),
  responsabilidades: texto(fila?.new_principalesresponsabilidades),
  logros: texto(fila?.new_logrosdestacados),
});

export interface FormularioExperiencia {
  cargo: string;
  institucion: string;
  sector: OpcionONull;
  otroSector: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  dedicacion: string;
  personasACargo: string;
  responsabilidades: string;
  logros: string;
}

export const experienciaAFormulario = (e?: ExperienciaFuera): FormularioExperiencia => ({
  cargo: e?.cargo ?? '',
  institucion: e?.institucion ?? '',
  sector: opcionDeLista(e?.sector.value, SECTORES_INDUSTRIA),
  otroSector: e?.otroSector ?? '',
  fechaInicio: e?.fechaInicio ?? null,
  fechaFin: e?.fechaFin ?? null,
  dedicacion: e?.dedicacion ?? '',
  personasACargo: e?.personasACargo ?? '',
  responsabilidades: e?.responsabilidades ?? '',
  logros: e?.logros ?? '',
});

export const armarPayloadExperiencia = (
  empleadoId: string,
  d: FormularioExperiencia,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_experienciafueraambitoacademicoid: id } : {}),
  new_empleado: empleadoId,
  new_cargoposicion: d.cargo || '',
  new_dedicacionhorariasemanal: numeroOCero(d.dedicacion),
  new_fechadeinicio: aFechaApi(d.fechaInicio),
  new_fechadefin: aFechaApi(d.fechaFin),
  new_institucionempresa: d.institucion || '',
  new_logrosdestacados: d.logros || '',
  new_personasacargo: numeroOCero(d.personasACargo),
  new_principalesresponsabilidades: d.responsabilidades || '',
  new_sectorindustria: d.sector?.value || 0,
  new_sectorindustriaotro: d.otroSector || '',
});

// ---------------------------------------------------------------------------
// Consultorías externas
// ---------------------------------------------------------------------------

export interface ConsultoriaExterna {
  id: string;
  tema: string;
  cliente: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  tipoDedicacion: Opcion;
  dedicacion: string;
  financiamiento: OpcionONull;
  resultados: string;
}

export const mapearConsultoria = (fila: Fila): ConsultoriaExterna => ({
  id: texto(fila?.new_consultorasexternasid),
  tema: texto(fila?.new_temareadeconsultoria),
  cliente: texto(fila?.new_clienteorganizacion),
  fechaInicio: fechaDeFila(fila, 'new_fechadeinicio'),
  fechaFin: fechaDeFila(fila, 'new_fechadefin'),
  tipoDedicacion: opcionDeFila(fila, 'new_tipodededicacion'),
  dedicacion: texto(fila?.new_dedicacionhoraria),
  financiamiento: booleanAOpcion(fila?.new_financiamientorecibido, fila?.[`new_financiamientorecibido${FV}`]),
  resultados: texto(fila?.new_principalesresultados),
});

export interface FormularioConsultoria {
  tema: string;
  cliente: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  tipoDedicacion: OpcionONull;
  dedicacion: string;
  financiamiento: OpcionONull;
  resultados: string;
}

export const consultoriaAFormulario = (c?: ConsultoriaExterna): FormularioConsultoria => ({
  tema: c?.tema ?? '',
  cliente: c?.cliente ?? '',
  fechaInicio: c?.fechaInicio ?? null,
  fechaFin: c?.fechaFin ?? null,
  tipoDedicacion: opcionDeLista(c?.tipoDedicacion.value, TIPOS_DEDICACION),
  dedicacion: c?.dedicacion ?? '',
  financiamiento: c?.financiamiento ?? null,
  resultados: c?.resultados ?? '',
});

export const armarPayloadConsultoria = (
  empleadoId: string,
  d: FormularioConsultoria,
  id?: string,
): Record<string, unknown> => ({
  new_empleado: empleadoId,
  ...(id ? { new_consultorasexternasid: id } : {}),
  new_clienteorganizacion: d.cliente || '',
  new_dedicacionhoraria: numeroOCero(d.dedicacion),
  new_fechadeinicio: aFechaApi(d.fechaInicio),
  new_fechadefin: aFechaApi(d.fechaFin),
  // El portal manda `true` cuando no se eligió Sí / No.
  new_financiamientorecibido: d.financiamiento ? opcionABoolean(d.financiamiento) : true,
  new_principalesresultados: d.resultados || '',
  new_temareadeconsultoria: d.tema || '',
  new_tipodededicacion: d.tipoDedicacion?.value || 0,
});

// ---------------------------------------------------------------------------
// Comités profesionales o técnicos
// ---------------------------------------------------------------------------

export interface ComiteProfesional {
  id: string;
  nombre: string;
  cargo: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  ambito: Opcion;
  contribuciones: string;
}

export const mapearComite = (fila: Fila): ComiteProfesional => ({
  id: texto(fila?.new_comiteprofesionalotecnicoid),
  nombre: texto(fila?.new_nombredelcomiteorganismo),
  cargo: texto(fila?.new_cargorol),
  fechaInicio: fechaDeFila(fila, 'new_fechadeinicio'),
  fechaFin: fechaDeFila(fila, 'new_fechadefin'),
  ambito: opcionDeFila(fila, 'new_ambito'),
  contribuciones: texto(fila?.new_principalescontribuciones),
});

export interface FormularioComite {
  nombre: string;
  cargo: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  ambito: OpcionONull;
  contribuciones: string;
}

export const comiteAFormulario = (c?: ComiteProfesional): FormularioComite => ({
  nombre: c?.nombre ?? '',
  cargo: c?.cargo ?? '',
  fechaInicio: c?.fechaInicio ?? null,
  fechaFin: c?.fechaFin ?? null,
  ambito: opcionDeLista(c?.ambito.value, AMBITOS),
  contribuciones: c?.contribuciones ?? '',
});

export const armarPayloadComite = (empleadoId: string, d: FormularioComite, id?: string): Record<string, unknown> => ({
  new_empleado: empleadoId,
  ...(id ? { new_comiteprofesionalotecnicoid: id } : {}),
  new_ambito: d.ambito?.value || 0,
  new_cargorol: d.cargo || '',
  new_fechadeinicio: aFechaApi(d.fechaInicio),
  new_fechadefin: aFechaApi(d.fechaFin),
  new_nombredelcomiteorganismo: d.nombre || '',
  new_principalescontribuciones: d.contribuciones || '',
});

// ---------------------------------------------------------------------------
// Licencias profesionales, membresías y asociaciones
// ---------------------------------------------------------------------------

export interface LicenciaProfesional {
  id: string;
  tipo: string;
  organismo: string;
  fechaObtencion: Date | null;
  vigenciaHasta: Date | null;
}

export const mapearLicenciaProfesional = (fila: Fila): LicenciaProfesional => ({
  id: texto(fila?.new_licprof_membresiaencolegio_asocprofid),
  tipo: texto(fila?.new_tipodelicenciamembresia),
  organismo: texto(fila?.new_organismoemisor),
  fechaObtencion: fechaDeFila(fila, 'new_fechadeobtencion'),
  vigenciaHasta: fechaDeFila(fila, 'new_vigenciahasta'),
});

export interface FormularioLicenciaProfesional {
  tipo: string;
  organismo: string;
  fechaObtencion: Date | null;
  vigenciaHasta: Date | null;
}

export const licenciaProfesionalAFormulario = (l?: LicenciaProfesional): FormularioLicenciaProfesional => ({
  tipo: l?.tipo ?? '',
  organismo: l?.organismo ?? '',
  fechaObtencion: l?.fechaObtencion ?? null,
  vigenciaHasta: l?.vigenciaHasta ?? null,
});

export const armarPayloadLicenciaProfesional = (
  empleadoId: string,
  d: FormularioLicenciaProfesional,
  id?: string,
): Record<string, unknown> => ({
  new_empleado: empleadoId,
  ...(id ? { new_licprof_membresiaencolegio_asocprofid: id } : {}),
  new_fechadeobtencion: mesAnioAFechaApi(d.fechaObtencion),
  new_organismoemisor: d.organismo || '',
  new_tipodelicenciamembresia: d.tipo || '',
  new_vigenciahasta: mesAnioAFechaApi(d.vigenciaHasta),
});

// ---------------------------------------------------------------------------
// Reconocimientos profesionales
// ---------------------------------------------------------------------------

export interface Reconocimiento {
  id: string;
  tipo: string;
  nombre: string;
  institucion: string;
  fecha: Date | null;
  ambito: Opcion;
}

export const mapearReconocimiento = (fila: Fila): Reconocimiento => ({
  id: texto(fila?.new_reconocimientoprofesionalid),
  tipo: texto(fila?.new_tipodereconocimiento),
  nombre: texto(fila?.new_nombredelreconocimiento),
  institucion: texto(fila?.new_institucionorganismootorgante),
  fecha: fechaDeFila(fila, 'new_fechadeotorgamiento'),
  ambito: opcionDeFila(fila, 'new_ambito'),
});

export interface FormularioReconocimiento {
  tipo: string;
  nombre: string;
  institucion: string;
  fecha: Date | null;
  ambito: OpcionONull;
}

export const reconocimientoAFormulario = (r?: Reconocimiento): FormularioReconocimiento => ({
  tipo: r?.tipo ?? '',
  nombre: r?.nombre ?? '',
  institucion: r?.institucion ?? '',
  fecha: r?.fecha ?? null,
  ambito: opcionDeLista(r?.ambito.value, AMBITOS),
});

/** Esta ruta del portal usa nombres en camelCase, distintos del resto. */
export const armarPayloadReconocimiento = (
  empleadoId: string,
  d: FormularioReconocimiento,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_reconocimientoprofesionalid: id } : {}),
  tipoReconocimiento: d.tipo || '',
  nombreReconocimiento: d.nombre || '',
  institucionOtorgante: d.institucion || '',
  fechaOtorgamiento: aFechaApi(d.fecha),
  ambito: d.ambito?.value || 0,
  empleadoId,
});
