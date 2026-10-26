// Lecturas y escrituras de Perfil > Extensión. Port de useLegajoStore.getActividadesDeExtension,
// useAutocompletadosStore.obtenerUnidadOrganizativa / obtenerOtrasEntidadesAcademicas y hooks/useCargarActividadExtension.
import { endpoints } from '../../config/api/endpoints';
import { escribirRegistro, leerCatalogoFetchXml, leerRegistrosDeEmpleado } from './perfilApi';

type Metodo = 'post' | 'put' | 'delete';

export const leerActividadesExtension = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_actividadesdeextensions',
    entidad: 'new_actividadesdeextension',
    atributos: [
      'new_actividadesdeextensionid',
      'createdon',
      'new_actividad',
      'new_unidadacademica1',
      'new_unidadacademicaotro',
      'new_otraentidadacademica',
      'new_dedicacionhorariaanual',
      'new_fechadeinicio',
      'new_fechadefinalizacion',
    ],
    // En esta entidad el empleado cuelga de new_colaborador (no de new_empleado).
    campoEmpleado: 'new_colaborador',
    empleadoId,
  });

/** Unidades organizativas de tipo 100000010 y 100000011 (las que ofrece el selector de entidad académica). */
export const leerUnidadesAcademicas = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_unidadorganigramas',
    'new_unidadorganigrama',
    ['new_name', 'new_unidadorganigramaid', 'new_tipo'],
    null,
    '<condition attribute="new_tipo" operator="in"><value>100000010</value><value>100000011</value></condition>',
  );

/**
 * Opciones de "Otra entidad académica": las unidades que el BO marca con new_otraentidadacademica = 1, ordenadas por
 * nombre. Va en una consulta aparte (como en el portal): si el atributo no existe en el BO, la consulta de unidades
 * de arriba no se ve afectada.
 */
export const leerOtrasEntidadesAcademicas = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_unidadorganigramas',
    'new_unidadorganigrama',
    ['new_name', 'new_unidadorganigramaid'],
    'new_name',
    '<condition attribute="new_otraentidadacademica" operator="eq" value="1"/>',
  );

export const escribirActividadExtension = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.actividadesExtension(), metodo, data);
