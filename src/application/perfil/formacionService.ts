// Flujos de Perfil > Formación que combinan varias llamadas. El orden de las llamadas es el de los hooks del portal
// (hooks/formacion/useCargarTitulosGrado, useCargarEspecialidad, useCargarCertificacionesCapacitaciones,
// useCargarIdioma, useCargarAreasExpertise) y de perfil/formacion/page.tsx.
// Las notificaciones (toasts) las muestran los modales y la pantalla; acá se devuelve el resultado o se lanza el error.
import type { Adjunto } from '../../domain/legajo/tipos';
import { mapearAdjunto } from '../../domain/legajo/mapeo';
import type { ArchivoDeFormulario, Fila, OpcionONull } from '../../domain/perfil/comun';
import {
  armarPayloadAreaExpertise,
  armarPayloadCertificacion,
  armarPayloadEspecialidad,
  armarPayloadIdioma,
  armarPayloadTitulo,
  agruparNotasPorTitulo,
  mapearActuacion,
  mapearAgrupador,
  mapearAreaExpertise,
  mapearAreaInteres,
  mapearCertificacion,
  mapearEmpleadoFormacion,
  mapearEspecialidad,
  mapearIdioma,
  mapearInstitucion,
  mapearTitulo,
  type CategoriaTitulo,
  type FormularioAreaExpertise,
  type FormularioCertificacion,
  type FormularioEspecialidad,
  type FormularioIdioma,
  type FormularioTitulo,
} from '../../domain/perfil/formacion';
import {
  escribirAreaExpertise,
  escribirCertificacion,
  escribirEspecialidad,
  escribirIdioma,
  escribirTitulo,
  leerActuaciones,
  leerAdjuntosDeTitulo,
  leerAgrupadores,
  leerAreasDeInteres,
  leerAreasExpertise,
  leerCertificaciones,
  leerEmpleadoFormacion,
  leerEspecialidades,
  leerIdiomas,
  leerInstitucionesOtorgantes,
  leerNotasDeTitulos,
  leerTitulos,
  subirConstanciasDeTitulo,
} from '../../infrastructure/perfil/formacionApi';
import { actualizarEmpleado } from '../../infrastructure/perfil/perfilApi';
import { useAuthStore } from '../../presentation/stores/authStore';
import { useCatalogosStore } from '../../presentation/stores/catalogosStore';
import { useFormacionStore } from '../../presentation/stores/formacionStore';

export const MSG_ERROR_CARGA_FORMACION = 'No pudimos cargar tu formación. Por favor, volvé a intentar.';

const empleadoIdActual = (): string => {
  const id = useAuthStore.getState().user?.empleadoid;
  if (!id) throw new Error('No hay un empleado en sesión.');
  return id;
};

/** Un 200 vacío tras los reintentos NO es "sin datos": se trata como fallo y se conserva lo que ya había. */
const filasOFallar = (filas: unknown): Fila[] => {
  if (!Array.isArray(filas)) throw new Error(MSG_ERROR_CARGA_FORMACION);
  return filas as Fila[];
};

const store = () => useFormacionStore.getState();

// ---------------------------------------------------------------------------
// Lecturas
// ---------------------------------------------------------------------------

export const cargarEmpleadoFormacion = async (): Promise<void> => {
  const filas = filasOFallar(await leerEmpleadoFormacion(empleadoIdActual()));
  store().fijar({ empleado: filas.length > 0 ? mapearEmpleadoFormacion(filas[0]) : null });
};

export const cargarTitulos = async (categoria: CategoriaTitulo): Promise<void> => {
  const id = empleadoIdActual();
  // La formación posdoctoral no tiene constancias.
  const [filas, notas] = await Promise.all([
    leerTitulos(id, categoria),
    categoria === 'posdoctoral' ? Promise.resolve([]) : leerNotasDeTitulos(id, categoria),
  ]);
  const adjuntos = agruparNotasPorTitulo(notas);
  store().fijar({ [categoria]: filasOFallar(filas).map((fila) => mapearTitulo(fila, adjuntos)) });
};

export const cargarEspecialidades = async (): Promise<void> => {
  const filas = filasOFallar(await leerEspecialidades(empleadoIdActual()));
  store().fijar({ especialidades: filas.map(mapearEspecialidad) });
};

export const cargarCertificaciones = async (): Promise<void> => {
  const filas = filasOFallar(await leerCertificaciones(empleadoIdActual()));
  store().fijar({ certificaciones: filas.map(mapearCertificacion) });
};

export const cargarIdiomas = async (): Promise<void> => {
  const filas = filasOFallar(await leerIdiomas(empleadoIdActual()));
  store().fijar({ idiomas: filas.map(mapearIdioma) });
};

export const cargarAreasExpertise = async (): Promise<void> => {
  const filas = filasOFallar(await leerAreasExpertise(empleadoIdActual()));
  store().fijar({ areas: filas.map(mapearAreaExpertise) });
};

let catalogosEnCurso: Promise<void> | null = null;

/** Instituciones otorgantes, agrupadores, áreas de interés y actuaciones (una vez por sesión, salvo que fallen). */
export const cargarCatalogosFormacion = (): Promise<void> => {
  if (catalogosEnCurso) return catalogosEnCurso;
  const actual = store();
  catalogosEnCurso = (async () => {
    const pedir = async <T>(
      yaTiene: boolean,
      leer: () => Promise<unknown>,
      mapear: (fila: Fila) => T,
    ): Promise<T[] | null> => (yaTiene ? null : filasOFallar(await leer()).map(mapear));
    const resultados = await Promise.allSettled([
      pedir(actual.instituciones.length > 0, leerInstitucionesOtorgantes, mapearInstitucion),
      pedir(actual.agrupadores.length > 0, leerAgrupadores, mapearAgrupador),
      pedir(actual.areasInteres.length > 0, leerAreasDeInteres, mapearAreaInteres),
      pedir(actual.actuaciones.length > 0, leerActuaciones, mapearActuacion),
      useCatalogosStore.getState().cargar(),
    ]);
    const [instituciones, agrupadores, areasInteres, actuaciones] = resultados;
    const valor = <T>(r: PromiseSettledResult<T[] | null | void>): T[] | undefined =>
      r.status === 'fulfilled' && Array.isArray(r.value) ? (r.value as T[]) : undefined;
    const parcial: Record<string, unknown> = {};
    const i = valor(instituciones as any);
    const g = valor(agrupadores as any);
    const a = valor(areasInteres as any);
    const c = valor(actuaciones as any);
    if (i) parcial.instituciones = i;
    if (g) parcial.agrupadores = g;
    if (a) parcial.areasInteres = a;
    if (c) parcial.actuaciones = c;
    store().fijar(parcial);
    if (resultados.some((r) => r.status === 'rejected')) store().fijarEstado({ error: true });
  })().finally(() => {
    catalogosEnCurso = null;
  });
  return catalogosEnCurso;
};

/** Lo que lee la pantalla al abrirse: el empleado, las siete listas y los catálogos. */
export const cargarFormacion = async (): Promise<void> => {
  store().fijarEstado({ cargando: true, error: false });
  const resultados = await Promise.allSettled([
    cargarEmpleadoFormacion(),
    cargarTitulos('pregrado'),
    cargarTitulos('posgrado'),
    cargarTitulos('posdoctoral'),
    cargarEspecialidades(),
    cargarCertificaciones(),
    cargarIdiomas(),
    cargarAreasExpertise(),
    cargarCatalogosFormacion(),
  ]);
  store().fijarEstado({
    cargando: false,
    cargado: true,
    error: resultados.some((r) => r.status === 'rejected'),
  });
};

// ---------------------------------------------------------------------------
// Nivel de educación básica
// ---------------------------------------------------------------------------

/**
 * Guarda el título de educación básica (PUT api/hrfactors/empleado con { new_tituloseducacionbasica, new_empleadoid })
 * y vuelve a leer el empleado. `onEtapa` avisa cada paso ("Guardando los cambios…", "Actualizando los datos…").
 */
export const guardarEducacionBasica = async (
  valor: OpcionONull,
  onEtapa?: (mensaje: string) => void,
): Promise<boolean> => {
  const id = empleadoIdActual();
  onEtapa?.('Guardando los cambios…');
  const resultado = await actualizarEmpleado({
    new_tituloseducacionbasica: valor?.value || 0,
    new_empleadoid: id,
  });
  if (!resultado) return false;
  onEtapa?.('Actualizando los datos…');
  await cargarEmpleadoFormacion();
  return true;
};

// ---------------------------------------------------------------------------
// Títulos
// ---------------------------------------------------------------------------

export interface ResultadoGuardadoTitulo {
  guardado: boolean;
  /** El título se guardó pero las constancias no se pudieron subir. */
  adjuntoFallo: boolean;
}

/** Id del registro recién creado: el portal acepta el texto de la respuesta o `data.id`. */
const idDeRespuesta = (data: unknown): string => {
  if (typeof data === 'string') return data.trim();
  const id = (data as { id?: unknown } | null)?.id;
  return typeof id === 'string' ? id.trim() : '';
};

export const guardarTitulo = async (cfg: {
  categoria: CategoriaTitulo;
  /** Si viene, es edición (PUT). */
  id?: string;
  datos: FormularioTitulo;
  archivos: ArchivoDeFormulario[];
  onEtapa?: (mensaje: string) => void;
}): Promise<ResultadoGuardadoTitulo> => {
  const empleadoId = empleadoIdActual();
  const { categoria, id, datos, archivos, onEtapa } = cfg;
  const respuesta = await escribirTitulo(id ? 'put' : 'post', armarPayloadTitulo(empleadoId, categoria, datos, id));
  const tituloId = id ?? idDeRespuesta(respuesta);
  if (!tituloId) return { guardado: false, adjuntoFallo: false };

  let adjuntoFallo = false;
  if (archivos.length > 0 && categoria !== 'posdoctoral') {
    onEtapa?.(archivos.length === 1 ? 'Adjuntando el documento…' : 'Adjuntando los documentos…');
    try {
      const subida = await subirConstanciasDeTitulo(
        tituloId,
        archivos.map(({ uri, name, type }) => ({ uri, name, type })),
      );
      if (!subida) adjuntoFallo = true;
    } catch {
      adjuntoFallo = true;
    }
  }

  onEtapa?.('Actualizando el listado…');
  await cargarTitulos(categoria);
  return { guardado: true, adjuntoFallo };
};

export const eliminarTitulo = async (categoria: CategoriaTitulo, id: string): Promise<void> => {
  await escribirTitulo('delete', { new_universidadporcontactoid: id });
  await cargarTitulos(categoria);
};

/** Constancias de un título con su contenido en base64 (para abrirlas); se piden solo al verlas. */
export const obtenerAdjuntosDeTitulo = async (tituloId: string): Promise<Adjunto[]> => {
  const filas = await leerAdjuntosDeTitulo(empleadoIdActual(), tituloId);
  return Array.isArray(filas) ? filas.map(mapearAdjunto) : [];
};

// ---------------------------------------------------------------------------
// Especialidad, certificaciones, idiomas y áreas de expertise
// ---------------------------------------------------------------------------

export const guardarEspecialidad = async (datos: FormularioEspecialidad, id?: string): Promise<void> => {
  await escribirEspecialidad(id ? 'put' : 'post', armarPayloadEspecialidad(empleadoIdActual(), datos, id));
  await cargarEspecialidades();
};

export const eliminarEspecialidad = async (id: string): Promise<void> => {
  await escribirEspecialidad('delete', { new_especialidadcertificadosaludid: id });
  await cargarEspecialidades();
};

export const guardarCertificacion = async (datos: FormularioCertificacion, id?: string): Promise<void> => {
  await escribirCertificacion(id ? 'put' : 'post', armarPayloadCertificacion(empleadoIdActual(), datos, id));
  await cargarCertificaciones();
};

export const eliminarCertificacion = async (id: string): Promise<void> => {
  await escribirCertificacion('delete', { new_certificaciones_capacitacionesid: id });
  await cargarCertificaciones();
};

export const guardarIdioma = async (datos: FormularioIdioma, id?: string): Promise<void> => {
  await escribirIdioma(id ? 'put' : 'post', armarPayloadIdioma(empleadoIdActual(), datos, id));
  await cargarIdiomas();
};

export const eliminarIdioma = async (id: string): Promise<void> => {
  await escribirIdioma('delete', { new_idiomaporcontactoid: id });
  await cargarIdiomas();
};

export const guardarAreaExpertise = async (datos: FormularioAreaExpertise, id?: string): Promise<void> => {
  await escribirAreaExpertise(id ? 'put' : 'post', armarPayloadAreaExpertise(empleadoIdActual(), datos, id));
  await cargarAreasExpertise();
};

export const eliminarAreaExpertise = async (id: string): Promise<void> => {
  await escribirAreaExpertise('delete', { new_pta_areasinteresid: id });
  await cargarAreasExpertise();
};
