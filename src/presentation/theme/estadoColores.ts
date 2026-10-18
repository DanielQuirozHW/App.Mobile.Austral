// Colores de las insignias de estado. Port de Portal-Austral-Dev -> src/@core/components/status-badge/index.tsx:
// la paleta se elige por la etiqueta (en minúsculas y sin espacios en los bordes), no por el código de estado.
// Una etiqueta que no está en el mapa usa el gris.

export interface ColoresDeInsignia {
  /** Color del texto. */
  color: string;
  /** Color de fondo. */
  fondo: string;
}

interface PaletaDeInsignia {
  claro: ColoresDeInsignia;
  oscuro: ColoresDeInsignia;
}

const verde: PaletaDeInsignia = {
  claro: { color: '#1A8C5B', fondo: '#E6F6EE' },
  oscuro: { color: '#4ADE80', fondo: 'rgba(74,222,128,0.15)' },
};
const amarillo: PaletaDeInsignia = {
  claro: { color: '#B87A00', fondo: '#FFF8E0' },
  oscuro: { color: '#FBBF24', fondo: 'rgba(251,191,36,0.15)' },
};
const rojo: PaletaDeInsignia = {
  claro: { color: '#C0392B', fondo: '#FDECEA' },
  oscuro: { color: '#F87171', fondo: 'rgba(248,113,113,0.15)' },
};
const azul: PaletaDeInsignia = {
  claro: { color: '#1565C0', fondo: '#E3F0FF' },
  oscuro: { color: '#60A5FA', fondo: 'rgba(96,165,250,0.15)' },
};
const indigo: PaletaDeInsignia = {
  claro: { color: '#2E3092', fondo: '#E8E9F6' },
  oscuro: { color: '#A5B4FC', fondo: 'rgba(165,180,252,0.15)' },
};
const pizarra: PaletaDeInsignia = {
  claro: { color: '#5A5C80', fondo: '#EEEEF8' },
  oscuro: { color: '#94A3B8', fondo: 'rgba(148,163,184,0.15)' },
};
const naranja: PaletaDeInsignia = {
  claro: { color: '#E08030', fondo: '#FFF0E0' },
  oscuro: { color: '#FB923C', fondo: 'rgba(251,146,60,0.15)' },
};
const gris: PaletaDeInsignia = {
  claro: { color: '#757575', fondo: '#F5F5F5' },
  oscuro: { color: '#9CA3AF', fondo: 'rgba(156,163,175,0.15)' },
};

const PALETA_POR_ETIQUETA: Record<string, PaletaDeInsignia> = {
  aprobado: verde,
  aprobada: verde,
  publicado: verde,
  liquidada: verde,
  pendiente: amarillo,
  'pendiente de validación por dirección de personas': amarillo,
  'solicitada. pendiente certificado': amarillo,
  'validada, documentación pendiente': amarillo,
  rechazado: rojo,
  rechazada: rojo,
  'no aprobada': rojo,
  'no aprobado': rojo,
  'no admitido': rojo,
  'rechazado por el colaborador': rojo,
  cancelada: rojo,
  cancelado: rojo,
  baja: rojo,
  requerido: rojo,
  'en revisión': azul,
  'en revision': azul,
  'validación si': azul,
  'validacion si': azul,
  'en curso': indigo,
  cursando: indigo,
  vigente: indigo,
  inscripto: indigo,
  postulado: indigo,
  finalizado: pizarra,
  gozada: pizarra,
  solicitado: naranja,
  solicitada: naranja,
  'desvinculado ua': amarillo,
  generada: naranja,
  borrador: gris,
};

/** Colores de la insignia para una etiqueta, en el modo claro u oscuro. */
export const coloresDeInsignia = (etiqueta: string | null | undefined, oscuro: boolean): ColoresDeInsignia => {
  const clave = (etiqueta ?? '').toLowerCase().trim();
  const paleta = PALETA_POR_ETIQUETA[clave] ?? gris;
  return oscuro ? paleta.oscuro : paleta.claro;
};
