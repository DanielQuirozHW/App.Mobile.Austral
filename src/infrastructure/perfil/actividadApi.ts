// Lecturas y escrituras de Perfil > Investigación > Actividad I+D (financiamientos y formación de RRHH).
// Port de Portal-Austral-Dev -> store/useInvestigacionDocenciaStore.ts (fetchers) y hooks/investigacion-perfil/*.
import { endpoints } from '../../config/api/endpoints';
import { escribirRegistro, leerCatalogoFetchXml, leerRegistrosDeEmpleado } from './perfilApi';

type Metodo = 'post' | 'put' | 'delete';

// --- Financiamiento propio de la UA ---

export const leerFinanciamientosPropios = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_financiamientopropiodelauas',
    entidad: 'new_financiamientopropiodelaua',
    atributos: [
      'new_financiamientopropiodelauaid',
      'new_rol',
      'new_estado',
      'new_fechainicio',
      'new_fechafin',
      'new_tipofinanciamiento',
      'new_modalidad',
      'new_name',
      'new_moneda_opcion',
      'new_monto',
      'statuscode',
      'new_otrofinanciamiento',
      'new_nombredelsubsidio',
      'new_fechaotorgamiento',
      'createdon',
      'statecode',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'createdon',
    descendente: true,
  });

export const escribirFinanciamientoPropio = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.financiamientoPropioUa(), metodo, data);

// --- Financiamiento externo a la UA ---

export const leerFinanciamientosExternos = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_financiamientoexternoalauas',
    entidad: 'new_financiamientoexternoalaua',
    atributos: [
      'new_financiamientoexternoalauaid',
      'new_name',
      'new_rol',
      'new_estado',
      'new_fechainicio',
      'new_fechafin',
      'new_destinodelfinanciamiento',
      'new_institucionotorgante',
      'new_moneda',
      'new_monto',
      'new_fechadeotorgamiento',
      'new_actividadesquefinancia',
      'new_otraactividad',
      'statuscode',
      'createdon',
      'statecode',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
  });

export const escribirFinanciamientoExterno = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.financiamientoExternoUa(), metodo, data);

// --- Formación de tesistas ---

export const leerTesistas = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_formaciontesistases',
    entidad: 'new_formaciontesistas',
    atributos: [
      'new_formaciontesistasid',
      'new_formacion',
      'new_pertenenciadirector',
      'new_director_principal',
      'new_director_otro',
      'new_pertenenciacodirector',
      'new_codirector_otro',
      'new_codirector_principal',
      'new_pertenenciadeltesista',
      'new_tesista_principal',
      'new_instituciondelprograma',
      'new_programa',
      'new_sededepresentacion',
      'new_fechainicio',
      'new_estado',
      'new_anoprevistodelapresentacion',
      'new_fechadeladefensa',
      'new_name',
      'new_director_busqueda',
      'new_codirector_busqueda',
      'new_tesista_otro',
      'new_tesista_busqueda',
      'new_otro_director',
      'new_otro_codirector',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'new_fechainicio',
    descendente: true,
  });

export const escribirTesista = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.formacionTesistas(), metodo, data);

// --- Dirección de investigadores y/o becarios ---

export const leerDirecciones = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_direcciondeinvestigadoresbecarioses',
    entidad: 'new_direcciondeinvestigadoresbecarios',
    atributos: [
      'new_direcciondeinvestigadoresbecariosid',
      'new_directorbusqueda',
      'new_pertenenciadirector',
      'new_pertenenciacodirector',
      'new_directorotro',
      'new_directorprincipal',
      'new_codirectorotro',
      'new_codirectorbusqueda',
      'new_codirectorprincipal',
      'new_carrera',
      'new_pertenenciadelinvestigadorbecario',
      'new_investigadorbecarioprincipal',
      'new_investigadorbecariootro',
      'new_institucion',
      'new_fechadeinicio',
      'new_fechadefin',
      'new_encurso',
      'new_investigadorbecariobusqueda',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'new_fechadeinicio',
    descendente: true,
  });

export const escribirDireccion = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.investigadoresBecarios(), metodo, data);

// --- Colaboradores activos (selects de director, codirector e investigador / becario) ---

export const leerColaboradoresActivos = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_empleados',
    'new_empleado',
    ['new_name', 'new_numerolegajo', 'new_empleadoid', 'new_nivel'],
    'new_name',
  );
