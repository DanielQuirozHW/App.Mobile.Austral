// Opciones fijas (OptionSets del CRM). Valores verificados en Portal-Austral-Dev:
// src/app/(dashboard)/legajo/datos-personales/page.tsx, ModalConyuge.tsx y ModalHijos.tsx.
import type { Opcion } from './tipos';

export const TIPOS_DOCUMENTO: Opcion[] = [
  { value: 100000000, label: 'D.N.I. Argentino' },
  { value: 100000003, label: 'D.E.' },
  { value: 100000004, label: 'Pasaporte' },
];

export const ESTADOS_CIVILES: Opcion[] = [
  { value: 100000001, label: 'Soltero/a' },
  { value: 100000000, label: 'Casado/a' },
  { value: 100000003, label: 'Viudo/a' },
  { value: 100000005, label: 'Separado/a de hecho' },
  { value: 100000002, label: 'Divorciado/a' },
  { value: 100000007, label: 'Conviviente' },
];

export const SEXOS: Opcion[] = [
  { value: 100000000, label: 'Masculino' },
  { value: 100000001, label: 'Femenino' },
  { value: 100000002, label: 'X' },
];

export const VINCULOS_EMERGENCIA: Opcion[] = [
  { value: 100000005, label: 'Madre' },
  { value: 100000000, label: 'Padre' },
  { value: 100000001, label: 'Hijo/a' },
  { value: 100000002, label: 'Hermano/a' },
  { value: 100000003, label: 'Conyuge' },
  { value: 100000004, label: 'Otro' },
];

/** ¿Está a cargo? (hijos). `booleano` es el valor lógico de la opción. */
export const A_CARGO: Array<Opcion & { booleano: boolean }> = [
  { value: 100000000, label: 'Si', booleano: true },
  { value: 100000001, label: 'No', booleano: false },
];

export const COD_PARENTESCO_CONYUGE = 100000000;
export const COD_PARENTESCO_HIJO = 100000001;
export const PARENTESCO_CONYUGE: Opcion = { value: COD_PARENTESCO_CONYUGE, label: 'Conyuge' };
export const PARENTESCO_HIJO: Opcion = { value: COD_PARENTESCO_HIJO, label: 'Hijo/a' };
export const COD_A_CARGO_SI = 100000000;

// Casado/a y Conviviente son los estados civiles que implican cónyuge.
const ESTADOS_CON_CONYUGE = [100000000, 100000007];

export const esEstadoConConyuge = (valor: unknown): boolean => ESTADOS_CON_CONYUGE.includes(Number(valor));

// Para estos tipos el número es alfanumérico (máx. 20); para el resto son 8 dígitos.
const TIPOS_DOC_ALFANUMERICOS = ['D.E.', 'Pasaporte', 'Documento Extranjero'];

export const esDocumentoAlfanumerico = (label?: string | null): boolean =>
  TIPOS_DOC_ALFANUMERICOS.includes(label ?? '');

/** Busca en una lista de opciones por código (tolera número o string). */
export const opcionPorValor = <T extends Opcion>(opciones: T[], valor: unknown): T | null =>
  opciones.find((o) => String(o.value) === String(valor)) ?? null;
