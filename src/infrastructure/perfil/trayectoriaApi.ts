// Lecturas y escrituras de Perfil > Trayectoria profesional.
// Port de Portal-Austral-Dev -> src/hooks/trayectoria/* y src/stores/useTrayectoriaStore.ts.
import { endpoints } from '../../config/api/endpoints';
import { escribirRegistro, leerRegistrosDeEmpleado } from './perfilApi';
import { leerEmpleadoFormacion } from './formacionApi';

type Metodo = 'post' | 'put' | 'delete';

/** Mismo registro de new_empleado que lee Formación (links de LinkedIn y ResearchGate). */
export const leerEmpleadoTrayectoria = (empleadoId: string): Promise<unknown> => leerEmpleadoFormacion(empleadoId);

export const leerExperienciasFuera = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_experienciafueraambitoacademicos',
    entidad: 'new_experienciafueraambitoacademico',
    atributos: [
      'createdon',
      'new_sectorindustria',
      'new_sectorindustriaotro',
      'new_principalesresponsabilidades',
      'new_personasacargo',
      'new_logrosdestacados',
      'new_institucionempresa',
      'new_fechadeinicio',
      'new_fechadefin',
      'new_dedicacionhorariasemanal',
      'new_cargoposicion',
      'new_experienciafueraambitoacademicoid',
    ],
    campoEmpleado: 'new_empleadoid',
    empleadoId,
  });

export const escribirExperienciaFuera = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.experienciaFuera(), metodo, data);

export const leerConsultorias = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_consultorasexternases',
    entidad: 'new_consultorasexternas',
    atributos: [
      'createdon',
      'new_tipodededicacion',
      'new_temareadeconsultoria',
      'new_principalesresultados',
      'new_financiamientorecibido',
      'new_fechadeinicio',
      'new_fechadefin',
      'new_dedicacionhoraria',
      'new_clienteorganizacion',
      'new_consultorasexternasid',
    ],
    campoEmpleado: 'new_empleadoid',
    empleadoId,
  });

export const escribirConsultoria = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.consultoriaExterna(), metodo, data);

export const leerComites = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_comiteprofesionalotecnicos',
    entidad: 'new_comiteprofesionalotecnico',
    atributos: [
      'createdon',
      'new_principalescontribuciones',
      'new_nombredelcomiteorganismo',
      'new_fechadeinicio',
      'new_fechadefin',
      'new_cargorol',
      'new_ambito',
      'new_comiteprofesionalotecnicoid',
    ],
    campoEmpleado: 'new_empleadoid',
    empleadoId,
  });

export const escribirComite = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.comiteProfesional(), metodo, data);

export const leerLicenciasProfesionales = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_licprof_membresiaencolegio_asocprofs',
    entidad: 'new_licprof_membresiaencolegio_asocprof',
    atributos: [
      'createdon',
      'new_vigenciahasta',
      'new_tipodelicenciamembresia',
      'new_organismoemisor',
      'new_fechadeobtencion',
      'new_licprof_membresiaencolegio_asocprofid',
    ],
    campoEmpleado: 'new_empleadoid',
    empleadoId,
  });

export const escribirLicenciaProfesional = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.licProfMembresia(), metodo, data);

export const leerReconocimientos = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_reconocimientoprofesionals',
    entidad: 'new_reconocimientoprofesional',
    atributos: [
      'createdon',
      'new_tipodereconocimiento',
      'new_nombredelreconocimiento',
      'new_institucionorganismootorgante',
      'new_fechadeotorgamiento',
      'new_ambito',
      'new_reconocimientoprofesionalid',
    ],
    campoEmpleado: 'new_empleadoid',
    empleadoId,
  });

export const escribirReconocimiento = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.reconocimientosProfesionales(), metodo, data);
