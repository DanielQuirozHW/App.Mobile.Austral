// Listas fijas de Perfil > Formación. Los códigos y textos son los de los modales del portal:
// Portal-Austral-Dev -> src/app/(dashboard)/perfil/_components/formacion/modales/* y perfil/formacion/page.tsx.
import type { OpcionDeLista } from './comun';

/** statuscode / estado "Finalizado" de títulos. */
export const ESTADO_FINALIZADO = 100000000;

// --- Nivel de formación (tarjeta superior) ---

export const EDUCACION_BASICA: OpcionDeLista[] = [
  { value: 100000000, label: 'Primario incompleto' },
  { value: 100000001, label: 'Primario completo' },
  { value: 100000002, label: 'Secundario incompleto' },
  { value: 100000003, label: 'Secundario completo' },
];

export const EDUCACION_BASICA_SECUNDARIO_COMPLETO = 100000003;

export const NIVELES_MAXIMOS: OpcionDeLista[] = [
  { value: 100000006, label: 'N/A' },
  { value: 100000004, label: 'Secundario' },
  { value: 100000000, label: 'Grado' },
  { value: 100000005, label: 'Pregrado' },
  { value: 100000001, label: 'Especialización' },
  { value: 100000002, label: 'Maestria' },
  { value: 100000003, label: 'Doctorado' },
  { value: 100000007, label: 'Postdoctorado' },
];

// --- Títulos ---

export const TIPOS_CARRERA_PREGRADO: OpcionDeLista[] = [
  { value: 100000006, label: 'Pregrado' },
  { value: 100000001, label: 'Grado' },
];

export const TIPOS_CARRERA_POSGRADO: OpcionDeLista[] = [
  { value: 100000002, label: 'Especialización' },
  { value: 100000003, label: 'Maestría' },
  { value: 100000004, label: 'Doctorado' },
];

/** new_tipodecarrera fijo de la formación posdoctoral. */
export const CARRERA_POSDOCTORAL = 100000000;

export const ESTADOS_TITULO: OpcionDeLista[] = [
  { value: 100000001, label: 'Iniciado' },
  { value: 100000002, label: 'En proceso' },
  { value: 100000003, label: 'Finalización' },
  { value: 100000000, label: 'Finalizado' },
];

export const ESTADOS_POSDOCTORAL: OpcionDeLista[] = [
  { value: 100000001, label: 'Iniciado' },
  { value: 100000002, label: 'En proceso' },
  { value: 100000000, label: 'Finalizado' },
];

/** Ayuda del portal sobre cada estado de un título de posgrado. */
export const AYUDA_ESTADOS_POSGRADO: Array<{ estado: string; texto: string }> = [
  { estado: 'INICIADO', texto: 'Han sido aceptados/admitidos en un phd.' },
  { estado: 'EN PROCESO', texto: 'Cuentan con un proyecto de tesis aceptado.' },
  { estado: 'FINALIZACIÓN', texto: 'Cuentan con más del 50% de su tesis avanzada.' },
  { estado: 'FINALIZADO', texto: 'Han defendido y aprobado su tesis doctoral.' },
];

// --- Especialidad certificada por organismo/s de salud ---

export const TIPOS_FORMACION_ESPECIALIDAD: OpcionDeLista[] = [
  { value: 100000000, label: 'Residencia' },
  { value: 100000001, label: 'Concurrencia' },
  { value: 100000002, label: 'Acreditación de la antigüedad en el ejercicio de la especialidad' },
  { value: 100000003, label: 'Otro' },
];

export const TIPO_FORMACION_ESPECIALIDAD_OTRO = 100000003;
export const ESPECIALIDAD_OTRA = 100000046;

// Las dos entradas "Elemento" (100000019 y 100000020) están así en el portal; se conservan tal cual.
export const ESPECIALIDADES: OpcionDeLista[] = [
  { value: 100000000, label: 'Anatomía patológica' },
  { value: 100000001, label: 'Anestesiología' },
  { value: 100000002, label: 'Cardiología - Cardiología pediátrica' },
  { value: 100000003, label: 'Cirugía cardiovascular' },
  { value: 100000004, label: 'Cirugía general' },
  { value: 100000005, label: 'Cirugía plástica y reparadora' },
  { value: 100000006, label: 'Cirugía pediátrica' },
  { value: 100000007, label: 'Clínica médica o medicina interna' },
  { value: 100000008, label: 'Dermatología' },
  { value: 100000009, label: 'Diagnóstico por imágenes - Diagnóstico por imágenes en pediatría' },
  { value: 100000010, label: 'Endocrinología - Endocrinología pediátrica' },
  {
    value: 100000011,
    label: 'Enfermedades infecciosas o infectología - Enfermedades infecciosas o infectología en pediatría',
  },
  { value: 100000012, label: 'Fisiatría y rehabilitación' },
  { value: 100000013, label: 'Gastroenterología' },
  { value: 100000014, label: 'Geriatría médica' },
  { value: 100000015, label: 'Gerontología y geriatría' },
  { value: 100000016, label: 'Ginecología' },
  { value: 100000017, label: 'Hemodinamia y angiografía general' },
  { value: 100000018, label: 'Hematología - Hematología pediátrica' },
  { value: 100000019, label: 'Elemento' },
  { value: 100000020, label: 'Elemento' },
  { value: 100000021, label: 'Hemoterapia' },
  { value: 100000022, label: 'Inmunología clínica (alergología, alergia)' },
  { value: 100000023, label: 'Medicina del ejercicio de la actividad humana o del deporte' },
  {
    value: 100000024,
    label: 'Medicina crítica y terapia intensiva - Medicina crítica y terapia intensiva en pediatría',
  },
  { value: 100000025, label: 'Medicina del trabajo' },
  { value: 100000026, label: 'Medicina general' },
  { value: 100000027, label: 'Medicina legal' },
  { value: 100000028, label: 'Nefrología - Nefrología pediátrica' },
  { value: 100000029, label: 'Neonatología' },
  { value: 100000030, label: 'Neumonología - Neumonología pediátrica' },
  { value: 100000031, label: 'Neurocirugía' },
  { value: 100000032, label: 'Neurología - Neurología pediátrica' },
  { value: 100000033, label: 'Nutrición' },
  { value: 100000034, label: 'Obstetricia' },
  { value: 100000035, label: 'Oftalmología' },
  { value: 100000036, label: 'Oncología' },
  { value: 100000037, label: 'Ortopedia y traumatología' },
  { value: 100000038, label: 'Otorrinolaringología' },
  { value: 100000039, label: 'Pediatría' },
  { value: 100000040, label: 'Psiquiatría - Psiquiatría infantojuvenil' },
  { value: 100000041, label: 'Radioterapia' },
  { value: 100000042, label: 'Reumatología' },
  { value: 100000043, label: 'Salud pública' },
  { value: 100000044, label: 'Toxicología' },
  { value: 100000045, label: 'Urología' },
  { value: 100000046, label: 'Otra' },
];

export const ESTADOS_ESPECIALIDAD: OpcionDeLista[] = [
  { value: 1, label: 'En curso' },
  { value: 100000000, label: 'Finalizado' },
];

// --- Certificaciones / Capacitaciones ---

export const ORIGEN_INTERNA = 100000000;
export const ORIGEN_EXTERNA = 100000001;
export const ESTADO_CERTIFICACION_FINALIZADO = 100000002;

export const ORIGENES_CERTIFICACION: OpcionDeLista[] = [
  { value: ORIGEN_INTERNA, label: 'Interna Austral' },
  { value: ORIGEN_EXTERNA, label: 'Externa Austral' },
];

export const TIPOS_FORMACION_CERTIFICACION: OpcionDeLista[] = [
  { value: 100000000, label: 'Curso' },
  { value: 100000001, label: 'Programa' },
  { value: 100000002, label: 'Diplomatura' },
  { value: 100000003, label: 'Diplomado' },
  { value: 100000004, label: 'Microcredencial' },
  { value: 100000005, label: 'Seminario' },
  { value: 100000006, label: 'Taller' },
  { value: 100000007, label: 'Otro' },
];

export const EJES_FORMATIVOS: OpcionDeLista[] = [
  { value: 100000000, label: 'Formación Humanística' },
  { value: 100000001, label: 'Formación en docencia (pedagógica)' },
  { value: 100000002, label: 'Seminarios de formación doctoral y/o en metodología de la investigación' },
  { value: 100000003, label: 'Otro' },
];

export const ESTADOS_CERTIFICACION: OpcionDeLista[] = [
  { value: 1, label: 'Iniciado' },
  { value: 100000000, label: 'En proceso' },
  { value: 100000001, label: 'En finalización' },
  { value: ESTADO_CERTIFICACION_FINALIZADO, label: 'Finalizado' },
];

// --- Idioma ---

export const IDIOMA_OTRO = 100000011;

export const IDIOMAS: OpcionDeLista[] = [
  { value: 100000000, label: 'Español' },
  { value: 100000001, label: 'Inglés' },
  { value: 100000002, label: 'Portugués' },
  { value: 100000003, label: 'Francés' },
  { value: 100000004, label: 'Alemán' },
  { value: 100000005, label: 'Italiano' },
  { value: 100000006, label: 'Japonés' },
  { value: 100000007, label: 'Chino' },
  { value: 100000008, label: 'Ruso' },
  { value: 100000009, label: 'Latín' },
  { value: 100000010, label: 'Griego' },
  { value: IDIOMA_OTRO, label: 'Otro' },
];

export const NIVELES_IDIOMA: OpcionDeLista[] = [
  { value: 100000000, label: 'Inicial' },
  { value: 100000001, label: 'Intermedio' },
  { value: 100000002, label: 'Avanzado' },
  { value: 100000003, label: 'Bilingüe' },
];

// --- Áreas de expertise ---

/** El portal deja cargar hasta 4 áreas de actuación. */
export const MAXIMO_AREAS_EXPERTISE = 4;

export const AYUDA_AREAS_EXPERTISE =
  'Seleccione hasta 4 (cuatro) áreas de actuación que indican, en orden de relevancia, los principales campos científicos-tecnológicos de desempeño académico-profesional.';

export const AYUDA_FECHA_MANUAL =
  'Debe seleccionar el icono del calendario para elegir la fecha. Es recomendable no escribir la fecha manualmente para evitar errores de formato.';
