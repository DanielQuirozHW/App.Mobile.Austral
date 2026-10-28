// Catálogo de módulos del menú lateral, de la pantalla Mi perfil y de los accesos de Inicio.
//
// Hay dos estructuras:
//   - ITEMS_DE_MENU: lista plana de los módulos con pantalla propia (Mi perfil, accesos de Inicio, qué módulos tienen
//     contenido). Es lo que usan Inicio, MiPerfilScreen y RootNavigator.
//   - SECCIONES_DE_MENU: el ÁRBOL del menú lateral, calcado de Portal-Austral-Dev -> src/navigation/vertical/index.tsx
//     (Inicio, Legajo, Perfil con Docencia e Investigación, Licencias y vacaciones, Plan de Trabajo, Gestión del
//     Desempeño, Indicadores, Funciones SA, Funciones VRAA y Referente MATHU). Las entradas que no se migran figuran igual
//     y abren la pantalla "En construcción" (decisión 100).
//
// MVP DE DEMOSTRACIÓN (docs/ALCANCE-MVP.md): módulo 1 = Mi perfil (Datos personales + Documentación + Perfil), módulo 2 =
// Licencias y vacaciones (decisión 93), Plan de trabajo (solo docente) habilitado en la decisión 98.
import type { AppIconName } from '../components/AppIcon';
import type { UserData } from '../../domain/auth/tipos';
import { RolNombramientos } from '../../domain/roles/enums';
import {
  esReferenteMathu,
  esSAoAdSA,
  esVRAAoAdVRAA,
  funcionesPromocionEfectivas,
  tieneAlgunaFuncion,
} from '../../domain/roles/funciones';
import { puedeVerLegajo } from '../stores/rolStore';
import { irAModulo } from './navigationRef';
import type { RootStackParams } from './tipos';

export type RutaDeMenu = Exclude<
  keyof RootStackParams,
  'Cargando' | 'Login' | 'SeleccionarPuesto' | 'PlanTrabajoDetalle' | 'EnConstruccion'
>;

export type GrupoDeMenu = 'Principal' | 'Mi perfil' | 'Gestión' | 'Cuenta';

export interface ItemDeMenu {
  ruta: RutaDeMenu;
  titulo: string;
  /** Texto corto que explica la sección en la pantalla Mi perfil (texto propio de la app). */
  descripcion?: string;
  icono: AppIconName;
  grupo: GrupoDeMenu;
  /** true: el módulo tiene contenido en la demostración. false: pantalla vacía. */
  enDemo: boolean;
  /** true: tiene un acceso directo (botón) en Inicio. */
  accesoInicio?: boolean;
  /** Quién lo ve, según el puesto elegido (mismas reglas que el portal). */
  visiblePara: (puesto: string | null) => boolean;
}

const paraTodos = (): boolean => true;
const soloDocente = (puesto: string | null): boolean => puesto === 'docente';

export const GRUPOS_DE_MENU: GrupoDeMenu[] = ['Principal', 'Mi perfil', 'Gestión', 'Cuenta'];

export const ITEMS_DE_MENU: ItemDeMenu[] = [
  { ruta: 'Inicio', titulo: 'Inicio', icono: 'home-outline', grupo: 'Principal', enDemo: true, visiblePara: paraTodos },
  {
    ruta: 'Notificaciones',
    titulo: 'Notificaciones',
    icono: 'notifications-outline',
    grupo: 'Principal',
    enDemo: true,
    visiblePara: paraTodos,
  },
  {
    ruta: 'MiPerfil',
    titulo: 'Mi perfil',
    icono: 'person-circle-outline',
    grupo: 'Mi perfil',
    enDemo: true,
    accesoInicio: true,
    visiblePara: paraTodos,
  },
  {
    ruta: 'DatosPersonales',
    titulo: 'Datos personales',
    descripcion: 'Identidad, contacto, domicilio, familia y contacto de emergencia',
    icono: 'person-outline',
    grupo: 'Mi perfil',
    enDemo: true,
    visiblePara: puedeVerLegajo,
  },
  {
    ruta: 'Documentacion',
    titulo: 'Documentación',
    descripcion: 'Documentos requeridos de tu legajo',
    icono: 'document-text-outline',
    grupo: 'Mi perfil',
    enDemo: true,
    visiblePara: paraTodos,
  },
  {
    ruta: 'Formacion',
    titulo: 'Formación',
    descripcion: 'Tu formación académica',
    icono: 'school-outline',
    grupo: 'Mi perfil',
    enDemo: true,
    visiblePara: paraTodos,
  },
  {
    ruta: 'Trayectoria',
    titulo: 'Trayectoria profesional',
    descripcion: 'Tu trayectoria profesional',
    icono: 'briefcase-outline',
    grupo: 'Mi perfil',
    enDemo: true,
    visiblePara: paraTodos,
  },
  {
    ruta: 'Extension',
    titulo: 'Extensión',
    descripcion: 'Actividades de extensión',
    icono: 'people-outline',
    grupo: 'Mi perfil',
    enDemo: true,
    visiblePara: paraTodos,
  },
  {
    ruta: 'GestionAcademica',
    titulo: 'Gestión académica',
    descripcion: 'Tus cargos y actividades de gestión académica',
    icono: 'git-network-outline',
    grupo: 'Mi perfil',
    enDemo: true,
    visiblePara: paraTodos,
  },
  {
    ruta: 'Docencia',
    titulo: 'Docencia',
    descripcion: 'Categorización, nombramientos, docencia y asesoramiento',
    icono: 'book-outline',
    grupo: 'Mi perfil',
    enDemo: true,
    visiblePara: paraTodos,
  },
  {
    ruta: 'Investigacion',
    titulo: 'Investigación',
    descripcion: 'Afiliaciones, actividad I+D y resultados / impacto I+D',
    icono: 'flask-outline',
    grupo: 'Mi perfil',
    enDemo: true,
    visiblePara: paraTodos,
  },
  {
    ruta: 'Licencias',
    titulo: 'Licencias y vacaciones',
    icono: 'calendar-outline',
    grupo: 'Gestión',
    enDemo: true,
    accesoInicio: true,
    visiblePara: paraTodos,
  },
  {
    ruta: 'PlanesDeTrabajo',
    titulo: 'Plan de trabajo',
    icono: 'clipboard-outline',
    grupo: 'Gestión',
    enDemo: true,
    visiblePara: soloDocente,
  },
  { ruta: 'Ajustes', titulo: 'Ajustes', icono: 'settings-outline', grupo: 'Cuenta', enDemo: true, visiblePara: paraTodos },
];

/** true si el módulo tiene contenido en la demostración. */
export const moduloEnDemo = (ruta: RutaDeMenu): boolean =>
  ITEMS_DE_MENU.find((item) => item.ruta === ruta)?.enDemo ?? false;

/** Título de una ruta para mostrar en pantallas genéricas. */
export const tituloDeRuta = (ruta: string): string => ITEMS_DE_MENU.find((item) => item.ruta === ruta)?.titulo ?? ruta;

/** Módulos con acceso directo (botón) en Inicio: los que tienen contenido y `accesoInicio`. */
export const ACCESOS_DE_INICIO = ITEMS_DE_MENU.filter((item) => item.enDemo && item.accesoInicio);

/** Secciones que se listan en la pantalla Mi perfil: las del grupo "Mi perfil" con contenido, menos la propia pantalla. */
export const SECCIONES_DE_MI_PERFIL = ITEMS_DE_MENU.filter(
  (item) => item.grupo === 'Mi perfil' && item.ruta !== 'MiPerfil' && item.enDemo,
);

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Árbol del menú lateral (calcado de navigation/vertical/index.tsx del portal)
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────

/** Lo que hace falta para decidir qué entradas se ven: el puesto elegido y el usuario (sus funciones de gestión). */
export interface ContextoDeMenu {
  puesto: string | null;
  user: UserData | null;
}

export interface NodoDeMenu {
  /** Único en todo el árbol. */
  id: string;
  titulo: string;
  icono: AppIconName;
  /** Pantalla a la que lleva. Sin `ruta` ni `hijos`, la entrada abre "En construcción". */
  ruta?: RutaDeMenu;
  /** Parámetros de la ruta (p. ej. la pestaña de Docencia). */
  params?: Record<string, string>;
  /** true: es la entrada que corresponde a la pantalla abierta sin parámetros (la pestaña inicial). */
  porDefecto?: boolean;
  /** true: figura en el menú pero no está migrada. */
  enConstruccion?: boolean;
  hijos?: NodoDeMenu[];
  /** Sin esta función, la ve todo el mundo. Un grupo sin hijos visibles no se muestra (como en el portal). */
  visible?: (contexto: ContextoDeMenu) => boolean;
}

export interface SeccionDeMenu {
  titulo?: string;
  nodos: NodoDeMenu[];
}

const esDocente = (c: ContextoDeMenu): boolean => c.puesto === 'docente';
const esStaff = (c: ContextoDeMenu): boolean => c.puesto === 'codocente';

// Funciones de gestión (portal: esSANombramientos, esSAPromocion, esVRAANombramientos, esVRAAPromocion, esReferenteMathu).
const esSANombramientos = (c: ContextoDeMenu): boolean =>
  tieneAlgunaFuncion(c.user, RolNombramientos.SA, RolNombramientos.AdSA);
const esSAPromocion = (c: ContextoDeMenu): boolean => esSAoAdSA(funcionesPromocionEfectivas(c.user));
const esVRAANombramientos = (c: ContextoDeMenu): boolean =>
  tieneAlgunaFuncion(c.user, RolNombramientos.VRAA, RolNombramientos.AdVRAA);
const esVRAAPromocion = (c: ContextoDeMenu): boolean => esVRAAoAdVRAA(funcionesPromocionEfectivas(c.user));
const esMathu = (c: ContextoDeMenu): boolean => esReferenteMathu(funcionesPromocionEfectivas(c.user));

const hijosPromocion = (idBase: string): NodoDeMenu[] => [
  { id: `${idBase}-ordinario`, titulo: 'Proceso promoción ordinario', icono: 'calendar-outline', enConstruccion: true },
  {
    id: `${idBase}-extraordinario`,
    titulo: 'Proceso promoción extraordinario',
    icono: 'alert-circle-outline',
    enConstruccion: true,
  },
];

const MENU_DEL_PORTAL: NodoDeMenu[] = [
  { id: 'inicio', titulo: 'Inicio', icono: 'home-outline', ruta: 'Inicio' },
  {
    id: 'legajo',
    titulo: 'Legajo',
    icono: 'folder-open-outline',
    hijos: [
      {
        id: 'legajo-datos-personales',
        titulo: 'Datos personales',
        icono: 'person-outline',
        ruta: 'DatosPersonales',
        visible: (c) => puedeVerLegajo(c.puesto),
      },
      { id: 'legajo-documentacion', titulo: 'Documentación', icono: 'document-text-outline', ruta: 'Documentacion' },
    ],
  },
  {
    id: 'perfil',
    titulo: 'Perfil',
    icono: 'person-circle-outline',
    hijos: [
      { id: 'perfil-formacion', titulo: 'Formación', icono: 'school-outline', ruta: 'Formacion' },
      { id: 'perfil-trayectoria', titulo: 'Trayectoria', icono: 'briefcase-outline', ruta: 'Trayectoria' },
      { id: 'perfil-extension', titulo: 'Extensión', icono: 'people-outline', ruta: 'Extension' },
      { id: 'perfil-gestion-academica', titulo: 'Gestión académica', icono: 'git-network-outline', ruta: 'GestionAcademica' },
      {
        id: 'perfil-docencia',
        titulo: 'Docencia',
        icono: 'book-outline',
        hijos: [
          {
            id: 'perfil-docencia-categorizacion',
            titulo: 'Categorización docente',
            icono: 'ribbon-outline',
            ruta: 'Docencia',
            params: { pestania: 'categorizacion' },
            porDefecto: true,
          },
          {
            id: 'perfil-docencia-nombramientos',
            titulo: 'Nombramientos',
            icono: 'briefcase-outline',
            ruta: 'Docencia',
            params: { pestania: 'nombramientos' },
          },
          // Promoción no se migra (decisión 100): figura en el menú y abre "En construcción".
          {
            id: 'perfil-docencia-promocion',
            titulo: 'Promoción',
            icono: 'trending-up-outline',
            enConstruccion: true,
          },
          {
            id: 'perfil-docencia-docencia',
            titulo: 'Docencia',
            icono: 'library-outline',
            ruta: 'Docencia',
            params: { pestania: 'docencia' },
          },
          {
            id: 'perfil-docencia-asesoramiento',
            titulo: 'Asesoramiento Acad.',
            icono: 'chatbubbles-outline',
            ruta: 'Docencia',
            params: { pestania: 'asesoramiento' },
          },
        ],
      },
      {
        id: 'perfil-investigacion',
        titulo: 'Investigación',
        icono: 'flask-outline',
        hijos: [
          {
            id: 'perfil-investigacion-afiliaciones',
            titulo: 'Perfil/afiliaciones',
            icono: 'flask-outline',
            ruta: 'Investigacion',
            params: { seccion: 'afiliaciones' },
            porDefecto: true,
          },
          {
            id: 'perfil-investigacion-actividad',
            titulo: 'Actividad I+D',
            icono: 'search-outline',
            ruta: 'Investigacion',
            params: { seccion: 'actividad' },
          },
          {
            id: 'perfil-investigacion-resultados',
            titulo: 'Resultados/Impacto I+D',
            icono: 'stats-chart-outline',
            ruta: 'Investigacion',
            params: { seccion: 'resultados' },
          },
        ],
      },
    ],
  },
  { id: 'licencias', titulo: 'Licencias y vacaciones', icono: 'calendar-outline', ruta: 'Licencias' },
  // Solo puesto docente (portal: menuDocente).
  { id: 'plan-de-trabajo', titulo: 'Plan de Trabajo', icono: 'clipboard-outline', ruta: 'PlanesDeTrabajo', visible: esDocente },
  // Puesto Staff (portal: menuCodocente). El docente que calibra alguna evaluación también lo ve en el portal; eso lo
  // resuelve la API y acá no se replica.
  {
    id: 'gdd',
    titulo: 'Gestión del Desempeño',
    icono: 'speedometer-outline',
    enConstruccion: true,
    visible: esStaff,
  },
  // Portal: lo ve quien la API habilita (RRHH, líder o calibrador). Aproximación: puesto Staff.
  {
    id: 'indicadores',
    titulo: 'Indicadores',
    icono: 'bar-chart-outline',
    visible: esStaff,
    hijos: [
      { id: 'indicadores-gdd', titulo: 'Gestión del Desempeño', icono: 'speedometer-outline', enConstruccion: true },
    ],
  },
  // Funciones de gestión: solo en el puesto docente y solo con la posición correspondiente (portal: menuFuncionesSA,
  // menuFuncionesVRAA y menuReferenteMathu). No se replican las banderas NombramientosHabilitado / PromocionHabilitado
  // ni el ciclo extraordinario (dependen de configuración y de la API).
  {
    id: 'funciones-sa',
    titulo: 'Funciones SA',
    icono: 'key-outline',
    visible: esDocente,
    hijos: [
      {
        id: 'funciones-sa-nombramiento-docente',
        titulo: 'Nombramiento docente',
        icono: 'people-outline',
        visible: esSANombramientos,
        hijos: [
          {
            id: 'funciones-sa-nombramiento-ordinario',
            titulo: 'Ciclo de nombramiento ordinario',
            icono: 'calendar-outline',
            enConstruccion: true,
          },
        ],
      },
      {
        id: 'funciones-sa-promocion-docente',
        titulo: 'Promoción docente',
        icono: 'trending-up-outline',
        visible: esSAPromocion,
        hijos: hijosPromocion('funciones-sa-promocion'),
      },
    ],
  },
  {
    id: 'funciones-vraa',
    titulo: 'Funciones VRAA',
    icono: 'shield-checkmark-outline',
    visible: esDocente,
    hijos: [
      {
        id: 'funciones-vraa-nombramientos',
        titulo: 'Nombramientos',
        icono: 'clipboard-outline',
        enConstruccion: true,
        visible: esVRAANombramientos,
      },
      {
        id: 'funciones-vraa-promocion-docente',
        titulo: 'Promoción docente',
        icono: 'trending-up-outline',
        visible: esVRAAPromocion,
        hijos: hijosPromocion('funciones-vraa-promocion'),
      },
    ],
  },
  {
    id: 'referente-mathu',
    titulo: 'Referente MATHU',
    icono: 'star-outline',
    visible: (c) => esDocente(c) && esMathu(c),
    hijos: [
      {
        id: 'referente-mathu-promocion-docente',
        titulo: 'Promoción docente',
        icono: 'trending-up-outline',
        hijos: hijosPromocion('referente-mathu-promocion'),
      },
    ],
  },
];

// Entradas propias de la app (el portal las resuelve con la campana del encabezado y con el selector de tema).
const MENU_DE_LA_APP: NodoDeMenu[] = [
  { id: 'app-notificaciones', titulo: 'Notificaciones', icono: 'notifications-outline', ruta: 'Notificaciones' },
  { id: 'app-ajustes', titulo: 'Ajustes', icono: 'settings-outline', ruta: 'Ajustes' },
];

export const SECCIONES_DE_MENU: SeccionDeMenu[] = [
  { nodos: MENU_DEL_PORTAL },
  { titulo: 'Aplicación', nodos: MENU_DE_LA_APP },
];

/** Deja solo lo que el usuario ve. Un grupo se muestra únicamente si le queda algún hijo (como en el portal). */
export const filtrarNodos = (nodos: NodoDeMenu[], contexto: ContextoDeMenu): NodoDeMenu[] =>
  nodos.flatMap((nodo) => {
    if (nodo.visible && !nodo.visible(contexto)) return [];
    if (!nodo.hijos) return [nodo];
    const hijos = filtrarNodos(nodo.hijos, contexto);
    return hijos.length > 0 ? [{ ...nodo, hijos }] : [];
  });

/** true si la entrada corresponde a la pantalla abierta (nombre de ruta y parámetros). */
export const nodoCoincide = (
  nodo: NodoDeMenu,
  ruta: string | null,
  params: Record<string, unknown> | null,
): boolean => {
  if (nodo.hijos) return false;
  if (nodo.enConstruccion) return ruta === 'EnConstruccion' && params?.id === nodo.id;
  if (!nodo.ruta || nodo.ruta !== ruta) return false;
  if (!nodo.params) return true;
  return Object.entries(nodo.params).every(([clave, valor]) => (params?.[clave] ?? (nodo.porDefecto ? valor : undefined)) === valor);
};

/** Camino de la raíz hasta la primera entrada que cumple `coincide`, o null. */
export const caminoANodo = (
  nodos: NodoDeMenu[],
  coincide: (nodo: NodoDeMenu) => boolean,
  previo: NodoDeMenu[] = [],
): NodoDeMenu[] | null => {
  for (const nodo of nodos) {
    const actual = [...previo, nodo];
    if (coincide(nodo)) return actual;
    if (nodo.hijos) {
      const encontrado = caminoANodo(nodo.hijos, coincide, actual);
      if (encontrado) return encontrado;
    }
  }
  return null;
};

/** Abre la pantalla de una entrada del menú. `ubicacion` es el camino de grupos (solo se usa en "En construcción"). */
export const irANodo = (nodo: NodoDeMenu, ubicacion?: string): void => {
  if (nodo.ruta) {
    irAModulo(nodo.ruta, nodo.params);
    return;
  }
  if (nodo.enConstruccion) irAModulo('EnConstruccion', { id: nodo.id, titulo: nodo.titulo, ubicacion });
};
