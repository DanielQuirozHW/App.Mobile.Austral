// Catálogo de módulos del menú lateral, de la pantalla Mi perfil y de los accesos de Inicio.
//
// MVP DE DEMOSTRACIÓN (docs/ALCANCE-MVP.md): todos los módulos figuran en el menú, pero solo los marcados
// `enDemo: true` tienen contenido. El resto abre una pantalla vacía (ModuloVacioScreen). Su código sigue escrito en
// el repo: para habilitar uno basta con pasar `enDemo` a true.
//
// Módulo 1 de la demo: MI PERFIL = Datos personales + Documentación + todo el Perfil (Formación, Trayectoria,
// Extensión, Gestión académica, Docencia, Investigación). Módulo 2: Licencias y vacaciones (decisión 93).
import type { AppIconName } from '../components/AppIcon';
import { puedeVerLegajo } from '../stores/rolStore';
import type { RootStackParams } from './tipos';

export type RutaDeMenu = Exclude<
  keyof RootStackParams,
  'Cargando' | 'Login' | 'SeleccionarPuesto' | 'PlanTrabajoDetalle'
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
    enDemo: false,
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
