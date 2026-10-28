// Reglas de Notificaciones. Port de Portal-Austral-Dev:
//   src/hooks/useGetNotificaciones.ts      (mapeo de la fila del CRM, pendientes / leídas, texto de la descripción)
//   src/@core/utils/rutaNotificacion.ts    (ruta destino y módulo de cada aviso)
//   src/app/(dashboard)/notificaciones/page.tsx (filas de la grilla y filtros)
// Funciones puras: no tocan la red ni el estado.
import { format, isValid } from 'date-fns';
import { RolNombramientos, RolPromocion } from '../roles/enums';
import { funcionesEfectivas, funcionesPromocionEfectivas } from '../roles/funciones';

// ---------- Tipos ----------

export interface Notificacion {
  /** activityid de la tarea del CRM. */
  id: string;
  /** subject */
  title: string;
  /** description ya pasada por formatearDescripcionPorSubject. */
  description: string;
  /** statuscode formateado (texto del CRM). */
  statuscode: string;
  statuscodeValue: number | null;
  /** new_tipodenotificacion formateado (columna "Tipo (CRM)"). */
  type: string;
  /** "DD/MM/YYYY HH:mm" en hora del dispositivo. */
  createdAt: string | null;
  /** createdon tal como llega del CRM (UTC). */
  createdeOn: string | null;
  /** Plan de trabajo anual asociado (texto formateado). Vacío si no tiene. */
  pta: string;
  statecode: number | null;
}

/** Fila de la grilla de /notificaciones (aFila del portal). */
export interface FilaNotificacion extends Notificacion {
  pendiente: boolean;
  /** "Pendiente" | "Leída". */
  estado: string;
  modulo: string;
  /** Ruta del portal (o URL completa) a la que lleva "Ir". */
  destino: string;
  /** "YYYY-MM-DD" en hora del dispositivo, para el filtro por fecha. */
  fecha: string | null;
}

// ---------- Fecha ----------

/** El CRM manda createdon en UTC; si el texto no trae zona se interpreta como UTC (dayjs.utc del portal). */
const aFechaUtc = (crudo: string): Date => {
  const tieneZona = /(Z|[+-]\d{2}:?\d{2})$/i.test(crudo);
  return new Date(tieneZona ? crudo : `${crudo}Z`);
};

/** convertirUTCaLocal del portal: "DD/MM/YYYY HH:mm" en hora local, o null si no hay fecha. */
export const convertirUTCaLocal = (crudo: string | null): string | null => {
  if (!crudo) return null;
  const fecha = aFechaUtc(crudo);
  return isValid(fecha) ? format(fecha, 'dd/MM/yyyy HH:mm') : null;
};

/** "YYYY-MM-DD" local (el campo `fecha` de la fila del portal). */
export const fechaLocalIso = (crudo: string | null): string | null => {
  if (!crudo) return null;
  const fecha = aFechaUtc(crudo);
  return isValid(fecha) ? format(fecha, 'yyyy-MM-dd') : null;
};

// ---------- Texto de la descripción ----------

const ENTIDADES_HTML: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/**
 * htmlAtexto del portal. El portal usa DOMParser, que en React Native no existe: acá se sacan las etiquetas con una
 * expresión regular y se decodifican las entidades más comunes (nombradas básicas y numéricas). Igual que el portal,
 * el cierre de un bloque (p, div, li, h1-h6) y <br> dejan un espacio.
 */
export const htmlAtexto = (html = ''): string => {
  if (!html) return '';
  const conEspacios = String(html).replace(/<br\s*\/?>|<\/(p|div|li|h[1-6])>/gi, ' ');
  return conEspacios.replace(/<[^>]*>/g, '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (coincidencia: string, entidad: string) => {
    if (entidad[0] === '#') {
      const codigo = entidad[1].toLowerCase() === 'x' ? parseInt(entidad.slice(2), 16) : parseInt(entidad.slice(1), 10);
      return Number.isFinite(codigo) && codigo > 0 && codigo <= 0x10ffff ? String.fromCodePoint(codigo) : coincidencia;
    }
    return ENTIDADES_HTML[entidad.toLowerCase()] ?? coincidencia;
  });
};

/** La descripción como texto de una línea: sin etiquetas y sin espacios de más. */
const textoPlano = (html = ''): string => htmlAtexto(html).replace(/\s+/g, ' ').trim();

const reFechaNumerica = /\b(0?[1-9]|[12]\d|3[01])[/\-](0?[1-9]|1[0-2])[/\-](\d{4}|\d{2})\b/;

const MESES_LARGOS: Record<string, number> = {
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

const reFechaLarga =
  /\b(0?[1-9]|[12]\d|3[01])\s*de\s*(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s*de\s*(\d{4})\b/i;

export interface FechaExtraida {
  original: string;
  iso: string;
  /** "DD/MM/YYYY" */
  display: string;
}

const armarFecha = (original: string, anio: number, mes: number, dia: number): FechaExtraida => {
  const fecha = new Date(anio, mes - 1, dia);
  return { original, iso: format(fecha, 'yyyy-MM-dd'), display: format(fecha, 'dd/MM/yyyy') };
};

/** extraerFechaDeDescripcion del portal: primera fecha "31/12/2025" (o "31-12-25") o "31 de diciembre de 2025". */
export const extraerFechaDeDescripcion = (htmlDescripcion = ''): FechaExtraida | null => {
  const texto = htmlAtexto(htmlDescripcion).replace(/\s+/g, ' ').trim();
  if (!texto) return null;

  const numerica = texto.match(reFechaNumerica);
  if (numerica) {
    const dia = parseInt(numerica[1], 10);
    const mes = parseInt(numerica[2], 10);
    const anioCrudo = numerica[3];
    // Año de dos dígitos: 70 o más es 19xx; menos de 70 es 20xx (heurística del portal).
    const anio =
      anioCrudo.length === 2
        ? Number(anioCrudo) >= 70
          ? 1900 + parseInt(anioCrudo, 10)
          : 2000 + parseInt(anioCrudo, 10)
        : parseInt(anioCrudo, 10);
    return armarFecha(numerica[0], anio, mes, dia);
  }

  const larga = texto.match(reFechaLarga);
  if (larga) {
    const mes = MESES_LARGOS[larga[2].toLowerCase()];
    if (mes) return armarFecha(larga[0], parseInt(larga[3], 10), mes, parseInt(larga[1], 10));
  }

  return null;
};

/** formatearDescripcionPorSubject del portal: reescribe la descripción de los avisos del Plan de Trabajo según el asunto. */
export const formatearDescripcionPorSubject = (subject: string, original: string): string => {
  if (!subject) return textoPlano(original);

  const s = subject.trim().toLowerCase();

  if (s.includes('apertura de convocatoria pta') || s.includes('opción para cargar el plan de trabajo anual')) {
    return 'Le informamos que ya está disponible la opción para cargar el Plan de Trabajo Anual del próximo año.';
  }

  if (s.includes('su pta ha recibido observaciones')) {
    return 'Gracias por enviar el Plan de Trabajo Anual. El mismo ha sido revisado y se han identificado algunos puntos que requieren ajustes.';
  }

  if (s.includes('su pta ha sido aprobado')) {
    return 'Gracias por enviar el Plan de Trabajo Anual. El mismo ha sido revisado y se encuentra aprobado.';
  }

  if (s.includes('recordatorio vencimiento del plazo para enviar el plan de trabajo anual')) {
    const fecha = extraerFechaDeDescripcion(original);
    if (fecha?.display) {
      return `Le recordamos que el ${fecha.display} vence el plazo para la presentación del Plan de Trabajo Anual. Agradecemos que pueda enviarlo antes de esa fecha.`;
    }
    return 'Le recordamos que pronto vence el plazo para la presentación del Plan de Trabajo Anual. Agradecemos que pueda enviarlo.';
  }

  return textoPlano(original);
};

// ---------- Mapeo y separación ----------

const texto = (valor: unknown): string => (typeof valor === 'string' ? valor : '');
const numero = (valor: unknown): number | null => (typeof valor === 'number' ? valor : null);

/** mapearNotificacion del portal. */
export const mapearNotificacion = (item: Record<string, unknown>): Notificacion => {
  const title = texto(item.subject).trim();
  const creada = typeof item.createdon === 'string' ? item.createdon : null;
  return {
    id: String(item.activityid ?? ''),
    title,
    description: formatearDescripcionPorSubject(title, texto(item.description)),
    statuscode: texto(item['statuscode@OData.Community.Display.V1.FormattedValue']),
    statuscodeValue: numero(item.statuscode),
    type: texto(item['new_tipodenotificacion@OData.Community.Display.V1.FormattedValue']),
    createdAt: convertirUTCaLocal(creada),
    createdeOn: creada,
    pta: texto(item['_new_plandetrabajoanual_value@OData.Community.Display.V1.FormattedValue']),
    statecode: numero(item.statecode),
  };
};

const masRecientePrimero = (a: Notificacion, b: Notificacion): number =>
  new Date(b.createdeOn ?? '').getTime() - new Date(a.createdeOn ?? '').getTime();

export interface NotificacionesSeparadas {
  /** statecode 0 y statuscode 3. */
  activas: Notificacion[];
  /** statecode 1. */
  inactivas: Notificacion[];
}

/**
 * Pendientes y leídas, de la más nueva a la más vieja. Si el cuerpo no es un array (200 vacío del backend) se trata como
 * lista vacía; el portal, en ese caso, falla al mapear.
 */
export const separarNotificaciones = (filas: unknown): NotificacionesSeparadas => {
  const lista: unknown[] = Array.isArray(filas) ? filas : [];
  const todas = lista
    .filter((fila): fila is Record<string, unknown> => typeof fila === 'object' && fila !== null)
    .map(mapearNotificacion);
  return {
    activas: todas.filter((n) => n.statecode === 0 && n.statuscodeValue === 3).sort(masRecientePrimero),
    inactivas: todas.filter((n) => n.statecode === 1).sort(masRecientePrimero),
  };
};

// ---------- Ruta destino y módulo ----------

type DatosParaRuta = Pick<Notificacion, 'title' | 'description' | 'type' | 'pta'>;

type UsuarioParaRuta =
  | {
      funcionNombramientos?: RolNombramientos[] | RolNombramientos | null;
      funcionPromocion?: RolPromocion[] | RolPromocion | null;
    }
  | null
  | undefined;

export interface ContextoDeRuta {
  user?: UsuarioParaRuta;
  /** URL del Portal Evaluación CAE (vacía si no está configurada). */
  portalCaeUrl?: string;
}

/**
 * rutaNotificacion del portal: la ruta del portal a la que lleva el aviso, derivada del título y la descripción.
 * El orden de las reglas importa (ver los comentarios del portal). Devuelve una ruta del portal ("/licencias?seccion=...")
 * o una URL completa (Portal CAE); `resolverDestino` la traduce a una pantalla de la app.
 */
export const rutaNotificacion = (notificacion: DatosParaRuta, contexto: ContextoDeRuta = {}): string => {
  const { user, portalCaeUrl = '' } = contexto;
  const title = (notificacion.title ?? '').toLowerCase();
  const desc = (notificacion.description ?? '').toLowerCase();
  const textoCompleto = `${title} ${desc}`;

  if (title.includes('proyecto de investigación') || title.includes('proyecto de investigacion')) {
    return '/perfil/investigacion/actividad-i+d';
  }
  if (title.includes('producción científica') || title.includes('produccion cientifica')) {
    return '/perfil/investigacion/resultados-impacto-i+d';
  }

  // Gestión del Desempeño (new_tipodenotificacion = 100000031). Va antes que Licencias y Nombramientos.
  const esDeGdd =
    (notificacion.type ?? '').toLowerCase().includes('gdd') ||
    /\bgdd\b/.test(textoCompleto) ||
    textoCompleto.includes('calibraci') ||
    textoCompleto.includes('gestión del desempeño') ||
    textoCompleto.includes('gestion del desempeno');
  if (esDeGdd) return '/gdd';

  // Licencias y vacaciones (SIP y Dirección de Personas). Va antes que Nombramientos y Promoción a propósito.
  const mencionaLicencia = textoCompleto.includes('licencia');
  const mencionaVacacion = textoCompleto.includes('vacaci');
  if (/\bsip\b/.test(textoCompleto) || mencionaLicencia || mencionaVacacion) {
    const licencias = Number(desc.match(/(\d+)\s*licencia/)?.[1] ?? 0);
    const vacaciones = Number(desc.match(/(\d+)\s*vacaci/)?.[1] ?? 0);

    let seccion = '';
    if (title.includes('vacaci') !== title.includes('licencia')) {
      seccion = title.includes('vacaci') ? 'vacaciones' : 'licencias';
    } else if (licencias > 0 || vacaciones > 0) {
      if (vacaciones === 0) seccion = 'licencias';
      else if (licencias === 0) seccion = 'vacaciones';
    } else if (mencionaLicencia !== mencionaVacacion) {
      seccion = mencionaLicencia ? 'licencias' : 'vacaciones';
    }

    const esAprobador = textoCompleto.includes('por aprobar') || textoCompleto.includes('para aprobar');
    if (esAprobador) {
      const params = ['seccion=gestion', seccion && `tipo=${seccion}`].filter(Boolean);
      return `/licencias?${params.join('&')}`;
    }
    return seccion ? `/licencias?seccion=${seccion}` : '/licencias';
  }

  // Promoción docente (new_tipodenotificacion = 100000030). Va antes que Nombramientos.
  const esDePromocion =
    (notificacion.type ?? '').toLowerCase().includes('promoci') ||
    textoCompleto.includes('postulaci') ||
    textoCompleto.includes('promoción') ||
    textoCompleto.includes('promocion') ||
    /\bcae\b/.test(textoCompleto);
  if (esDePromocion) {
    const proceso = textoCompleto.includes('extraordinari') ? 'proceso-extraordinario' : 'proceso-ordinario';
    const paraElSa = `/funciones-sa/promocion-docente/${proceso}`;
    const paraElVraa = `/funciones-vraa/promocion-docente/${proceso}`;
    const paraElDocente = '/perfil/docencia/promocion';

    const funcionesPromocion = funcionesPromocionEfectivas(user);
    const esReferenteMathu =
      funcionesPromocion.includes(RolPromocion.ReferenteMathu) &&
      !funcionesPromocion.includes(RolPromocion.SA) &&
      !funcionesPromocion.includes(RolPromocion.AdSA);

    if (title.includes('para revisión') || title.includes('para revision')) {
      return portalCaeUrl || paraElDocente;
    }

    if (textoCompleto.includes('composici')) {
      if (title.includes('propuesta')) return paraElVraa;
      return esReferenteMathu ? `/referente-mathu/promocion-docente/${proceso}` : paraElSa;
    }

    if (
      title.includes('elevada a la cpcs') ||
      title.includes('próxima a vencer') ||
      title.includes('proxima a vencer')
    ) {
      return paraElVraa;
    }

    if (
      title.includes('nueva postulación') ||
      title.includes('postulación de promoción modificada') ||
      title.includes('dictamen') ||
      title.startsWith('promoción de categoría')
    ) {
      return paraElSa;
    }

    if (title.includes('convocatoria')) {
      const esDelSa = desc.includes('conformar el cae') || desc.includes('secretario');
      return esDelSa ? paraElSa : paraElDocente;
    }

    return paraElDocente;
  }

  // Nombramientos. La ruta se decide por el TIPO de aviso (a quién va dirigido), no por el rol.
  const esDeNombramientos =
    textoCompleto.includes('nombramiento') ||
    (notificacion.type ?? '').toLowerCase().includes('nombramiento') ||
    (textoCompleto.includes('solicitud') && (textoCompleto.includes('rechazada') || textoCompleto.includes('aprobada')));
  if (esDeNombramientos) {
    if (textoCompleto.includes('su nombramiento')) return '/perfil/docencia/nombramientos';
    if (textoCompleto.includes('nueva solicitud')) return '/funciones-vraa/nombramientos';
    if (textoCompleto.includes('procesad') || textoCompleto.includes('rechazada') || textoCompleto.includes('aprobada')) {
      return '/funciones-sa';
    }
    const funciones = funcionesEfectivas(user);
    if (funciones.includes(RolNombramientos.SA) || funciones.includes(RolNombramientos.AdSA)) return '/funciones-sa';
    if (funciones.includes(RolNombramientos.VRAA) || funciones.includes(RolNombramientos.AdVRAA)) {
      return '/funciones-vraa/nombramientos';
    }
    return '/perfil/docencia/nombramientos';
  }

  // Plan de Trabajo Anual. El campo `pta` refuerza la detección.
  if (/\bpta\b/.test(textoCompleto) || textoCompleto.includes('plan de trabajo') || notificacion.pta) {
    return '/planes-de-trabajo';
  }

  // Sin regla conocida: Inicio.
  return '/';
};

/** moduloNotificacion del portal: la etiqueta del módulo (filtro "Módulo"). Igual que el portal, no usa el usuario. */
export const moduloNotificacion = (notificacion: DatosParaRuta, portalCaeUrl = ''): string => {
  const ruta = rutaNotificacion(notificacion, { portalCaeUrl });
  if (ruta.includes('promocion') || (portalCaeUrl && ruta === portalCaeUrl)) return 'Promoción docente';
  if (ruta.startsWith('/licencias')) return 'Licencias y vacaciones';
  if (ruta.startsWith('/gdd')) return 'Gestión del desempeño';
  if (ruta.startsWith('/planes-de-trabajo')) return 'Plan de trabajo';
  if (ruta.startsWith('/perfil/investigacion')) return 'Investigación';
  if (
    ruta.startsWith('/funciones-sa') ||
    ruta.startsWith('/funciones-vraa') ||
    ruta.startsWith('/perfil/docencia/nombramientos')
  ) {
    return 'Nombramientos';
  }
  return 'Otras';
};

// ---------- Destino dentro de la app ----------

// Los valores de estos tipos son los mismos de presentation/navigation/tipos.ts (el dominio no importa de la capa de
// presentación; TypeScript los trata como compatibles porque son uniones de los mismos textos).
export type SeccionLicencias = 'licencias' | 'vacaciones' | 'calendario' | 'equipo';
export type TipoGestion = 'Licencia' | 'Vacaciones';
export type PestaniaDocencia = 'categorizacion' | 'nombramientos' | 'promocion' | 'docencia' | 'asesoramiento';
export type SeccionInvestigacion = 'afiliaciones' | 'actividad' | 'resultados';

export type DestinoEnApp =
  | { tipo: 'pantalla'; nombre: 'Inicio' | 'PlanesDeTrabajo' }
  | { tipo: 'pantalla'; nombre: 'Docencia'; pestania?: PestaniaDocencia }
  | { tipo: 'pantalla'; nombre: 'Investigacion'; seccion?: SeccionInvestigacion }
  | { tipo: 'pantalla'; nombre: 'Licencias'; seccion?: SeccionLicencias; tipoGestion?: TipoGestion }
  | { tipo: 'url'; url: string }
  | { tipo: 'noDisponible' };

const PESTANIAS_DOCENCIA: PestaniaDocencia[] = ['categorizacion', 'nombramientos', 'promocion', 'docencia', 'asesoramiento'];

/** Valor de un par ?clave=valor de una ruta del portal (undefined si no está). */
const parametroDeRuta = (ruta: string, clave: string): string | undefined =>
  (ruta.split('?')[1] ?? '')
    .split('&')
    .map((par) => par.split('='))
    .find(([nombre]) => nombre === clave)?.[1];

/** Subpágina de /perfil/<módulo>/<subpágina> (sin consulta). */
const subpaginaDeRuta = (ruta: string): string => (ruta.split('?')[0].split('/')[3] ?? '').toLowerCase();

/**
 * Traduce la ruta del portal a una pantalla de la app, conservando lo que el portal abre: la pestaña de Docencia, la
 * sección de Investigación, y en Licencias la sección y el tipo (?seccion= y ?tipo=). Lo que la app todavía no tiene
 * (Gestión del desempeño, Funciones SA / VRAA, Referente MATHU) queda como `noDisponible`. "Plan de trabajo" solo existe
 * para el rol docente.
 */
export const resolverDestino = (ruta: string, opciones: { esDocente: boolean }): DestinoEnApp => {
  if (ruta.startsWith('http')) return { tipo: 'url', url: ruta };
  if (ruta === '/') return { tipo: 'pantalla', nombre: 'Inicio' };

  if (ruta.startsWith('/perfil/investigacion')) {
    const subpagina = subpaginaDeRuta(ruta);
    const seccion: SeccionInvestigacion | undefined = subpagina.startsWith('afiliaci')
      ? 'afiliaciones'
      : subpagina.startsWith('actividad')
        ? 'actividad'
        : subpagina.startsWith('resultados')
          ? 'resultados'
          : undefined;
    return { tipo: 'pantalla', nombre: 'Investigacion', seccion };
  }

  if (ruta.startsWith('/perfil/docencia')) {
    const subpagina = subpaginaDeRuta(ruta);
    const pestania = PESTANIAS_DOCENCIA.find((p) => p === subpagina);
    return { tipo: 'pantalla', nombre: 'Docencia', pestania };
  }

  if (ruta.startsWith('/licencias')) {
    const seccion = parametroDeRuta(ruta, 'seccion');
    if (seccion === 'licencias' || seccion === 'vacaciones' || seccion === 'calendario') {
      return { tipo: 'pantalla', nombre: 'Licencias', seccion };
    }
    // "gestion" es la bandeja de solicitudes del equipo (en la app, la sección "equipo"); ?tipo= la abre filtrada.
    if (seccion === 'gestion') {
      const tipoPedido = parametroDeRuta(ruta, 'tipo');
      const tipoGestion: TipoGestion | undefined =
        tipoPedido === 'licencias' ? 'Licencia' : tipoPedido === 'vacaciones' ? 'Vacaciones' : undefined;
      return { tipo: 'pantalla', nombre: 'Licencias', seccion: 'equipo', tipoGestion };
    }
    return { tipo: 'pantalla', nombre: 'Licencias' };
  }

  if (ruta.startsWith('/planes-de-trabajo')) {
    return opciones.esDocente ? { tipo: 'pantalla', nombre: 'PlanesDeTrabajo' } : { tipo: 'noDisponible' };
  }
  return { tipo: 'noDisponible' };
};

// ---------- Filas y filtros ----------

/** aFila del portal. */
export const aFilaNotificacion = (
  notificacion: Notificacion,
  pendiente: boolean,
  contexto: ContextoDeRuta,
): FilaNotificacion => ({
  ...notificacion,
  pendiente,
  estado: pendiente ? 'Pendiente' : 'Leída',
  modulo: moduloNotificacion(notificacion, contexto.portalCaeUrl),
  destino: rutaNotificacion(notificacion, contexto),
  fecha: fechaLocalIso(notificacion.createdeOn),
});

export interface FiltrosNotificaciones {
  /** Vacío = todos los módulos. */
  modulo: string;
  /** "YYYY-MM-DD" inclusive, o null. */
  desde: string | null;
  /** "YYYY-MM-DD" inclusive, o null. */
  hasta: string | null;
}

/** Filtros "Módulo" y rango de fechas de la grilla. Con un filtro de fecha activo, las filas sin fecha quedan afuera. */
export const filtrarNotificaciones = (filas: FilaNotificacion[], filtros: FiltrosNotificaciones): FilaNotificacion[] =>
  filas.filter((fila) => {
    if (filtros.modulo && fila.modulo !== filtros.modulo) return false;
    if (filtros.desde || filtros.hasta) {
      if (!fila.fecha) return false;
      if (filtros.desde && fila.fecha < filtros.desde) return false;
      if (filtros.hasta && fila.fecha > filtros.hasta) return false;
    }
    return true;
  });
