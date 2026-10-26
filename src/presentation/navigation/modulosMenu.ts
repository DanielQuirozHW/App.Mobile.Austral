// Catálogo de módulos del menú lateral y de los accesos de Inicio.
//
// MVP DE DEMOSTRACIÓN (docs/ALCANCE-MVP.md): todos los módulos figuran en el menú, pero solo los marcados
// `enDemo: true` tienen contenido. El resto abre una pantalla vacía (ModuloVacioScreen). Su código sigue escrito en
// el repo: para habilitar uno basta con pasar `enDemo` a true.
import type { AppIconName } from '../components/AppIcon';
import { puedeVerLegajo } from '../stores/rolStore';
import type { RootStackParams } from './tipos';

export type RutaDeMenu = Exclude<
  keyof RootStackParams,
  'Cargando' | 'Login' | 'SeleccionarPuesto' | 'PlanTrabajoDetalle'
>;

export type GrupoDeMenu = 'Principal' | 'Legajo' | 'Gestión' | 'Perfil' | 'Cuenta';

export interface ItemDeMenu {
  ruta: RutaDeMenu;
  titulo: string;
  icono: AppIconName;
  grupo: GrupoDeMenu;
  /** true: el módulo tiene contenido en la demostración. false: pantalla vacía. */
  enDemo: boolean;
  /** Quién lo ve, según el puesto elegido (mismas reglas que el portal). */
  visiblePara: (puesto: string | null) => boolean;
}

const paraTodos = (): boolean => true;
const soloDocente = (puesto: string | null): boolean => puesto === 'docente';

export const GRUPOS_DE_MENU: GrupoDeMenu[] = ['Principal', 'Legajo', 'Gestión', 'Perfil', 'Cuenta'];

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
    ruta: 'DatosPersonales',
    titulo: 'Datos personales',
    icono: 'person-outline',
    grupo: 'Legajo',
    enDemo: true,
    visiblePara: puedeVerLegajo,
  },
  {
    ruta: 'Documentacion',
    titulo: 'Documentación',
    icono: 'document-text-outline',
    grupo: 'Legajo',
    enDemo: false,
    visiblePara: paraTodos,
  },
  {
    ruta: 'Licencias',
    titulo: 'Licencias y vacaciones',
    icono: 'calendar-outline',
    grupo: 'Gestión',
    enDemo: true,
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
  {
    ruta: 'Formacion',
    titulo: 'Formación',
    icono: 'school-outline',
    grupo: 'Perfil',
    enDemo: false,
    visiblePara: paraTodos,
  },
  {
    ruta: 'Trayectoria',
    titulo: 'Trayectoria profesional',
    icono: 'briefcase-outline',
    grupo: 'Perfil',
    enDemo: false,
    visiblePara: paraTodos,
  },
  {
    ruta: 'Extension',
    titulo: 'Extensión',
    icono: 'people-outline',
    grupo: 'Perfil',
    enDemo: false,
    visiblePara: paraTodos,
  },
  {
    ruta: 'GestionAcademica',
    titulo: 'Gestión académica',
    icono: 'git-network-outline',
    grupo: 'Perfil',
    enDemo: false,
    visiblePara: paraTodos,
  },
  {
    ruta: 'Docencia',
    titulo: 'Docencia',
    icono: 'book-outline',
    grupo: 'Perfil',
    enDemo: false,
    visiblePara: paraTodos,
  },
  {
    ruta: 'Investigacion',
    titulo: 'Investigación',
    icono: 'flask-outline',
    grupo: 'Perfil',
    enDemo: false,
    visiblePara: paraTodos,
  },
  { ruta: 'Ajustes', titulo: 'Ajustes', icono: 'settings-outline', grupo: 'Cuenta', enDemo: true, visiblePara: paraTodos },
];

/** true si el módulo tiene contenido en la demostración. */
export const moduloEnDemo = (ruta: RutaDeMenu): boolean =>
  ITEMS_DE_MENU.find((item) => item.ruta === ruta)?.enDemo ?? false;

/** Título de una ruta para mostrar en pantallas genéricas. */
export const tituloDeRuta = (ruta: string): string => ITEMS_DE_MENU.find((item) => item.ruta === ruta)?.titulo ?? ruta;

/** Módulos con acceso directo en Inicio: los que tienen contenido, sin Inicio, Notificaciones ni Ajustes. */
export const ACCESOS_DE_INICIO = ITEMS_DE_MENU.filter(
  (item) => item.enDemo && item.ruta !== 'Inicio' && item.ruta !== 'Notificaciones' && item.ruta !== 'Ajustes',
);
