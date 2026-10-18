// Lecturas y escrituras de Perfil > Investigación > Afiliaciones.
// Port de Portal-Austral-Dev -> store/useInvestigacionDocenciaStore.ts (fetchers) y hooks/investigacion-perfil/*.
import { endpoints } from '../../config/api/endpoints';
import { escribirRegistro, leerCatalogoFetchXml, leerRegistrosDeEmpleado } from './perfilApi';

type Metodo = 'post' | 'put' | 'delete';

// --- Perfiles ---

export const leerPerfilInvestigacion = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_empleados',
    entidad: 'new_empleado',
    atributos: [
      'new_name',
      'new_numerolegajo',
      'new_empleadoid',
      'new_orcid',
      'new_googlescholar',
      'new_research_gate',
      'new_lineasinvestua',
      'new_lineadeinvestigacion',
    ],
    campoEmpleado: 'new_empleadoid',
    empleadoId,
    orden: 'new_numerolegajo',
  });

export const escribirPerfilInvestigacion = (data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.investigacionPerfil(), 'put', data);

// --- Categorización externa y PRINUAR vigentes (new_empleado) ---

export const leerCategorizacionesVigentes = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_empleados',
    entidad: 'new_empleado',
    atributos: [
      'new_name',
      'new_empleadoid',
      'new_categoria_investigador_conicet',
      'new_tipodecategorizacionconicet',
      'new_fechadeingresoinicio_catexterna',
      'new_fechadefin_catexterna',
      'new_lugardetrabajouniv',
      'new_lugardetrabajoagencia',
      'new_lugardetrabajootro',
      'new_categorizacionexterna_opglob',
      'new_categoriainvestigador_prinuar',
      'new_categoriaotra',
      'new_categoriainvestigador_agencia',
      'new_categoria_conicet',
      'new_categorizacinexternaopciones',
      'new_categorizacionexterna',
      'new_categorizacionexterna_busqueda',
      'new_fechadefincatprinuar',
      'new_lugardetrabajouniversidadaustral',
      'new_lugardetrabajo_univaustral',
      'new_lugardetrabajoprinuar_universidad',
      'new_lugardetrabajoprinuar_unidorg',
      'new_lugardetrabajoprinuar',
      'new_lugardetrabajoconicet',
      'new_lugardetrabajocic',
      'new_fechadeingresoiniciocatprinuar',
      'new_fechadeingresoiniciocatconicet',
      'new_fechadeingresoiniciocatcic',
      'new_fechadeingresoiniciocatagencia',
      'new_fechadefincatconicet',
      'new_fechadefincatcic',
      'new_fechadefincatagencia',
      'new_categoria_cic',
      'new_categoriainvestigadorotra',
      'new_lugardetrabajoinsotor',
      'new_lugardetrabajoprinuarinstitucionotorgante',
      'new_lugardetrabajo_univaustral_prinuar',
      'new_prinuarotra',
      'new_categoexter_unidadcertificante',
    ],
    campoEmpleado: 'new_empleadoid',
    empleadoId,
    orden: 'new_name',
  });

export const escribirCategorizacionExterna = (data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.categorizacionExternaVigente(), 'put', data);

export const escribirCategorizacionPrinuar = (metodo: 'post' | 'put', data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.categorizacionPrinuarVigente(), metodo, data);

// --- Históricos (solo lectura) ---

const CONDICION_HISTORICO = '<condition attribute="new_statuscode" operator="eq" value="100000001"/>';

export const leerExternasHistoricas = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_categorizacionexternas',
    entidad: 'new_categorizacionexterna',
    atributos: [
      'new_categorizacionexternaid',
      'new_fechadefin',
      'new_fechadeinicio',
      'new_categoriainvestigadorconicet',
      'new_categorizacionexterna_historico',
      'new_lugardetrabajo_historico',
      'new_lugardetrabajo_otro',
      'new_lugardetrabajouniversidadaustral',
      'new_tipodecategorizacion',
      'new_categoria_conicet',
      'new_categoria_cic',
      'new_categoriaagencia',
      'new_otra_categoria',
      'new_categoria_otra',
      'new_lugardetrabajo_uo',
      'new_lugardetrabajo_univ',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'createdon',
    descendente: true,
    filtrosExtra: CONDICION_HISTORICO,
  });

export const leerPrinuarHistoricas = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_categorizacionprinuars',
    entidad: 'new_categorizacionprinuar',
    atributos: [
      'new_categorizacionprinuarid',
      'createdon',
      'new_lugardetrabajo_historico',
      'new_lugardetrabajoprinuar_otro',
      'new_fechadeinicio',
      'new_fechadefin',
      'new_categoriaprinuar',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'createdon',
    descendente: true,
    filtrosExtra: CONDICION_HISTORICO,
  });

// --- Pertenencia a centros ---

export const leerPertenencias = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_pertenenciaacentroses',
    entidad: 'new_pertenenciaacentros',
    atributos: [
      'new_pertenenciaacentrosid',
      'new_pertenencia',
      'new_fechainicio',
      'new_fechafin',
      'new_statuscode',
      'statuscode',
      'new_pertcentro_insthua',
      'new_name',
      'new_pertenencia_texto',
      'createdon',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'createdon',
  });

export const leerCatalogoPertenencias = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_unidadacademicadepertenencias',
    'new_unidadacademicadepertenencia',
    ['new_unidadacademicadepertenenciaid', 'new_name', 'createdon', 'new_idunidadacademicapertenencia'],
    'createdon',
  );

export const escribirPertenencia = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.perteneciaACentros(), metodo, data);

// --- Jurados - tribunal ---

export const leerJuradosTribunal = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_participacionencomitesyjuradoses',
    entidad: 'new_participacionencomitesyjurados',
    atributos: [
      'new_participacionencomitesyjuradosid',
      'new_tipodeactividaddeevaluacion',
      'new_otraactividad',
      'new_fechadeinicio',
      'new_fechadefin',
      'new_institucionconvocantedelaevaluacion',
      'new_rol',
      'new_otrorol',
      'new_pais',
      'new_ciudad',
      'new_observaciones',
      'new_tipodeevaluacin',
      'new_institucinconvocante',
      'new_name',
      'new_lugar',
      'createdon',
      'new_fecha',
      'statecode',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'new_fechadeinicio',
    descendente: true,
  });

export const escribirJuradoTribunal = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.juradosTribunal(), metodo, data);
