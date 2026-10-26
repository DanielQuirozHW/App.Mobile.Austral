// Lecturas y escrituras de Perfil > Gestión académica. Port de useGestionAcademicaStore, useAutocompletadosStore
// (unidades organizativas) y hooks/gestion-academica/*.
// DIFERENCIA CONSCIENTE: el portal tiene escrito en el FetchXML de encargos y externos un nombre de persona de ejemplo
// (atributo uiname); no se copia, el filtro por empleado se arma solo con uitype y value.
import { endpoints } from '../../config/api/endpoints';
import {
  escribirRegistro,
  leerCatalogoFetchXml,
  leerRegistrosDeEmpleado,
} from './perfilApi';

type Metodo = 'post' | 'put' | 'delete';

const LINK_POSICION =
  '<link-entity name="new_posicion" from="new_posicionid" to="new_posicion" link-type="inner" alias="pos">' +
  '<attribute name="new_name"/><attribute name="new_unidadorganizativa"/>' +
  '<filter type="and"><condition attribute="new_tipodeposicion" operator="eq" value="100000002"/></filter>' +
  '</link-entity>';

export const leerCargosGestion = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_posicion_hists',
    entidad: 'new_posicion_hist',
    atributos: [
      'new_posicion_histid',
      'new_posicion',
      'new_fechadesde',
      'new_fechahasta',
      'new_dedicacionsemanalenhoras',
    ],
    campoEmpleado: 'new_empleado',
    empleadoId,
    orden: 'new_fechadesde',
    descendente: true,
    extra: LINK_POSICION,
  });

export const leerEncargosGestion = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_encargoses',
    entidad: 'new_encargos',
    atributos: [
      'new_encargosid',
      'new_name',
      'createdon',
      'new_unidadacademica',
      'new_tipo_multisel',
      'new_reportaa',
      'new_propuestaformativa',
      'new_otrotipo',
      'new_otraunidad',
      'new_otraentidadacademica',
      'new_fechadeinicio',
      'new_fechadefinalizacion',
      'new_encargo',
      'new_descripciondelencargo',
      'new_dedicacionsemanalenhoras',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'new_name',
  });

export const leerCargosEncargosExternos = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_cargosencargosexternoses',
    entidad: 'new_cargosencargosexternos',
    atributos: [
      'new_cargosencargosexternosid',
      'new_name',
      'createdon',
      'statuscode',
      'new_pais',
      'new_institucion',
      'new_fechadeinicio',
      'new_fechadefinalizacion',
      'new_estadostatuscode',
      'new_cargoencargo',
      'new_dedicacionsemanalenhoras',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'new_name',
  });

/** Unidades académicas del selector de encargos: solo las de tipo 100000010 (el portal filtra igual en el cliente). */
export const leerUnidadesDeEncargos = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_unidadorganigramas',
    'new_unidadorganigrama',
    ['new_name', 'new_unidadorganigramaid', 'new_tipo'],
    null,
    '<condition attribute="new_tipo" operator="eq" value="100000010"/>',
  );

export const escribirEncargo = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(
    metodo === 'post'
      ? endpoints.nuevoEncargo()
      : metodo === 'put'
        ? endpoints.editarEncargo()
        : endpoints.eliminarEncargo(),
    metodo,
    data,
  );

export const escribirCargoEncargoExterno = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.cargosYEncargosExternos(), metodo, data);
