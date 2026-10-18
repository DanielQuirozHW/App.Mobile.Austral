// Listas fijas de Perfil > Trayectoria profesional. Códigos y textos de los modales del portal:
// Portal-Austral-Dev -> perfil/_components/trayectoria/*.
import type { OpcionDeLista } from './comun';

export const SECTOR_OTRO = 100000015;

export const SECTORES_INDUSTRIA: OpcionDeLista[] = [
  { value: 100000000, label: 'Física, química y afines' },
  { value: 100000001, label: 'Matemática, estadística y afines' },
  { value: 100000002, label: 'Informática' },
  { value: 100000003, label: 'Arquitectura, ingeniería y afines' },
  { value: 100000004, label: 'Ciencias biológicas y otras disciplinas relativas a los seres orgánicos' },
  { value: 100000005, label: 'Medicina y profesiones afines' },
  { value: 100000006, label: 'Enfermería y partería de nivel superior' },
  { value: 100000007, label: 'Organización y administración de empresas y afines' },
  { value: 100000008, label: 'Derecho' },
  { value: 100000009, label: 'Bibliotecología y afines' },
  { value: 100000010, label: 'Ciencias sociales y humanas' },
  { value: 100000011, label: 'Artes' },
  { value: 100000012, label: 'Técnicos y profesiones de nivel medio' },
  { value: 100000013, label: 'Agricultura y trabajadores calificados agropecuarios y pesqueros' },
  { value: 100000014, label: 'Fuerzas armadas' },
  { value: SECTOR_OTRO, label: 'Otro' },
];

export const DEDICACION_TOTAL = 100000000;

export const TIPOS_DEDICACION: OpcionDeLista[] = [
  { value: DEDICACION_TOTAL, label: 'Total' },
  { value: 100000001, label: 'Semanal' },
];

export const AMBITOS: OpcionDeLista[] = [
  { value: 100000000, label: 'Nacional' },
  { value: 100000001, label: 'Internacional' },
];

export const AYUDA_EXPERIENCIA_FUERA = 'No se deben incluir campos de gestión académica ni docencia en este espacio';

export const MAXIMO_ENTERO = 2147483647;
