// Perfil > Extensión: tipos, mapeo, payload y validación de las actividades de extensión.
// Port de Portal-Austral-Dev -> perfil/extension/page.tsx, hooks/useGetActividadesDeExtension.ts,
// hooks/useCargarActividadExtension.ts, columns/columnsActividadesExtension.tsx y
// perfil/_components/extension/modales/ModalExtension.tsx.
import * as yup from 'yup';
import { aFechaApi } from '../legajo/fechas';
import type { Opcion, OpcionSelect } from '../legajo/tipos';
import {
  esFechaFutura,
  fechaDeFila,
  fechaOpcional,
  fechaRequerida,
  opcionDeFila,
  opcionRequerida,
  texto,
  type Fila,
  type OpcionONull,
} from './comun';

export interface ActividadExtension {
  id: string;
  actividad: string;
  unidadAcademica: Opcion;
  otraUnidadAcademica: string;
  dedicacion: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
}

export const mapearActividadExtension = (fila: Fila): ActividadExtension => ({
  id: texto(fila?.new_actividadesdeextensionid),
  actividad: texto(fila?.new_actividad),
  unidadAcademica: opcionDeFila(fila, '_new_unidadacademica1_value'),
  otraUnidadAcademica: texto(fila?.new_unidadacademicaotro),
  dedicacion: texto(fila?.new_dedicacionhorariaanual),
  fechaInicio: fechaDeFila(fila, 'new_fechadeinicio'),
  fechaFin: fechaDeFila(fila, 'new_fechadefinalizacion'),
});

/** Unidad académica / organizativa del catálogo (new_unidadorganigrama). */
export const mapearUnidadAcademica = (fila: Fila): OpcionSelect => ({
  value: texto(fila?.new_unidadorganigramaid),
  label: texto(fila?.new_name),
});

export interface FormularioActividadExtension {
  actividad: string;
  unidadAcademica: OpcionONull;
  otraUnidadAcademica: string;
  dedicacion: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
}

/** Al editar, la unidad llega como texto: se busca en el catálogo por id o por nombre, y si no está se conserva igual. */
export const actividadAFormulario = (
  a: ActividadExtension | undefined,
  unidades: OpcionSelect[],
): FormularioActividadExtension => {
  let unidad: OpcionONull = null;
  if (a && (a.unidadAcademica.value || a.unidadAcademica.label)) {
    const etiqueta = texto(a.unidadAcademica.label);
    const encontrada = unidades.find(
      (u) => u.value === texto(a.unidadAcademica.value) || (etiqueta !== '' && u.label === etiqueta),
    );
    unidad = encontrada
      ? { value: encontrada.value, label: encontrada.label }
      : { value: texto(a.unidadAcademica.value || etiqueta), label: etiqueta };
  }
  return {
    actividad: a?.actividad ?? '',
    unidadAcademica: unidad,
    otraUnidadAcademica: a?.otraUnidadAcademica ?? '',
    dedicacion: a?.dedicacion ?? '',
    fechaInicio: a?.fechaInicio ?? null,
    fechaFin: a?.fechaFin ?? null,
  };
};

/**
 * Cuerpo de POST / PUT api/hrfactors/actividadesextension (useCargarActividadesExtension del portal).
 * Al editar se manda también `clear_new_fechadefinalizacion` cuando la fecha de fin quedó vacía.
 */
export const armarPayloadActividad = (
  empleadoId: string,
  d: FormularioActividadExtension,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_actividadesdeextensionid: id } : {}),
  new_empleado: empleadoId,
  new_actividad: d.actividad || '',
  new_dedicacionhorariaanual: Number(d.dedicacion) || 0,
  new_fechadeinicio: aFechaApi(d.fechaInicio),
  new_fechadefinalizacion: d.fechaFin ? aFechaApi(d.fechaFin) : null,
  new_unidadacademica: d.unidadAcademica?.value || '',
  new_unidadacademicaotro: d.otraUnidadAcademica || '',
  ...(id ? { clear_new_fechadefinalizacion: !d.fechaFin } : {}),
});

export const esquemaActividadExtension = yup.object({
  actividad: yup.string().trim().max(100, 'Máximo 100 caracteres').required('La actividad es requerida'),
  unidadAcademica: opcionRequerida('La unidad académica es requerida'),
  otraUnidadAcademica: yup
    .string()
    .max(200, 'Máximo 200 caracteres')
    .test('otra-unidad', 'Otra unidad es requerida', function (valor) {
      return this.parent.unidadAcademica?.label !== 'Otra' || Boolean(valor && valor.trim());
    }),
  dedicacion: yup
    .string()
    .required('La dedicación horaria anual es requerida')
    .test('positivo', 'La dedicación horaria anual debe ser un número positivo', (v) => !v || Number(v) > 0)
    .test('entero', 'La dedicación horaria anual debe ser un número entero', (v) => !v || Number.isInteger(Number(v)))
    .test('maximo', 'La dedicación horaria anual es demasiado grande', (v) => !v || Number(v) <= 2147483647),
  fechaInicio: fechaRequerida('La fecha de inicio es requerida').test(
    'inicio-no-futura',
    'La fecha de inicio no puede ser mayor a la fecha actual',
    (valor) => !valor || !esFechaFutura(valor),
  ),
  fechaFin: fechaOpcional().test(
    'fin-orden',
    'La fecha de fin debe ser igual o posterior a la fecha de inicio',
    function (valor) {
      const inicio = this.parent.fechaInicio as Date | null;
      if (!valor || !inicio) return true;
      const dia = (f: Date) => new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();
      return dia(valor) >= dia(inicio);
    },
  ),
});
