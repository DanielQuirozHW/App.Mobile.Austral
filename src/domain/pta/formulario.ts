// Plan de Trabajo Anual (PTA): formularios de las secciones.
// Los valores iniciales, la limpieza de campos ocultos y la validación salen de la definición de cada campo.
import * as yup from 'yup';
import { texto } from '../perfil/comun';
import { fechaUtcADate } from './fechas';
import { opcionesBase, type CatalogosPta } from './opciones';
import type { CampoPta, RegistroPta } from './tipos';

const ENTERO_MIN = -2147483648;
const ENTERO_MAX = 2147483647;
const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

const vacio = (valor: unknown): boolean =>
  valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '');

/** ¿El campo se muestra con estos valores? */
export const campoVisible = (campo: CampoPta, valores: any): boolean => !campo.visibleSi || campo.visibleSi(valores);

// --- Valores iniciales ---

type OpcionDeFormulario = { value: any; label: string };

const opcionInicial = (campo: CampoPta, valor: unknown, cat: CatalogosPta): OpcionDeFormulario | null => {
  if (valor === null || valor === undefined || valor === '') return null;
  const base = campo.opciones ? opcionesBase(campo.opciones, cat) : [];
  const esTexto = typeof valor === 'string';
  const crudo: { value: any; label: unknown } = esTexto
    ? { value: valor, label: valor }
    : typeof valor === 'object'
      ? (valor as { value: any; label: unknown })
      : { value: valor, label: String(valor) };
  const sinValor = crudo.value === null || crudo.value === undefined || crudo.value === '';
  const etiqueta = texto(crudo.label).trim().toLowerCase();
  const porValor = sinValor
    ? undefined
    : base.find((o) => String(o.value).toLowerCase() === String(crudo.value).toLowerCase());
  const porEtiqueta = porValor || !etiqueta ? undefined : base.find((o) => o.label.trim().toLowerCase() === etiqueta);
  const hallada = porValor ?? porEtiqueta;
  if (hallada) return { value: hallada.value, label: hallada.label };
  // Un texto que no está en la lista (la forma de dictado llega como etiqueta) no es un código válido.
  if (sinValor || esTexto) return null;
  return { value: crudo.value, label: texto(crudo.label) };
};

const textoInicial = (valor: unknown): string => {
  if (valor && typeof valor === 'object') return texto((valor as { label?: unknown }).label);
  return texto(valor);
};

/** Valores del formulario para un registro (o vacíos si es un alta). */
export const valoresIniciales = (
  campos: CampoPta[],
  item: RegistroPta | undefined,
  cat: CatalogosPta,
): Record<string, any> => {
  const valores: Record<string, any> = {};
  campos.forEach((campo) => {
    const valor = item?.[campo.nombre];
    if (campo.tipo === 'select') valores[campo.nombre] = opcionInicial(campo, valor, cat);
    else if (campo.tipo === 'fecha') valores[campo.nombre] = fechaUtcADate(valor);
    else valores[campo.nombre] = textoInicial(valor);
  });
  return valores;
};

/** Los campos que no se muestran ("Otra unidad académica" sin elegir "Otra", por ejemplo) se envían vacíos. */
export const limpiarOcultos = (campos: CampoPta[], valores: Record<string, any>): Record<string, any> => {
  const limpios: Record<string, any> = { ...valores };
  campos.forEach((campo) => {
    if (campoVisible(campo, valores)) return;
    limpios[campo.nombre] = campo.tipo === 'select' || campo.tipo === 'fecha' ? null : '';
  });
  return limpios;
};

// --- Validación ---

const esquemaDeCampo = (campo: CampoPta) => {
  const oculto = (padre: unknown): boolean => !campoVisible(campo, padre);
  const requeridoMsg = campo.mensajeRequerido ?? `${campo.label} es requerido`;

  if (campo.tipo === 'select') {
    return yup.mixed().test('requerido', requeridoMsg, function (this: yup.TestContext, valor: any) {
      if (!campo.requerido || oculto(this.parent)) return true;
      return Boolean(valor) && valor.value !== null && valor.value !== undefined && valor.value !== '';
    });
  }

  if (campo.tipo === 'fecha') {
    return yup.mixed().test('requerido', requeridoMsg, function (this: yup.TestContext, valor: any) {
      if (!campo.requerido || oculto(this.parent)) return true;
      return valor instanceof Date && !Number.isNaN(valor.getTime());
    });
  }

  if (campo.tipo === 'entero') {
    const base = campo.baseNumero ?? campo.label;
    const activo = (padre: unknown, valor: unknown): boolean => !oculto(padre) && !vacio(valor);
    return yup
      .mixed()
      .test('requerido', requeridoMsg, function (this: yup.TestContext, valor: any) {
        if (!campo.requerido || oculto(this.parent)) return true;
        return !vacio(valor);
      })
      .test('numero', `${base} debe ser un número`, function (this: yup.TestContext, valor: any) {
        return !activo(this.parent, valor) || Number.isFinite(Number(valor));
      })
      .test('entero', `${base} debe ser un número entero`, function (this: yup.TestContext, valor: any) {
        return !activo(this.parent, valor) || !Number.isFinite(Number(valor)) || Number.isInteger(Number(valor));
      })
      .test('minimo', `${base} no puede ser menor que -2.147.483.648`, function (this: yup.TestContext, valor: any) {
        return !activo(this.parent, valor) || !Number.isFinite(Number(valor)) || Number(valor) >= ENTERO_MIN;
      })
      .test('maximo', `${base} no puede ser mayor que 2.147.483.647`, function (this: yup.TestContext, valor: any) {
        return !activo(this.parent, valor) || !Number.isFinite(Number(valor)) || Number(valor) <= ENTERO_MAX;
      });
  }

  // texto y multilinea
  return yup
    .mixed()
    .test('requerido', requeridoMsg, function (this: yup.TestContext, valor: any) {
      if (!campo.requerido || oculto(this.parent)) return true;
      return !vacio(valor);
    })
    .test(
      'maximo',
      campo.mensajeMaximo ?? `${campo.label} no puede tener más de ${campo.maximo} caracteres`,
      (valor: any) => !campo.maximo || vacio(valor) || String(valor).length <= campo.maximo,
    )
    .test('letras', 'Solo se permiten letras', function (this: yup.TestContext, valor: any) {
      if (!campo.soloLetras || oculto(this.parent) || vacio(valor)) return true;
      return SOLO_LETRAS.test(String(valor));
    });
};

/** Esquema yup de un formulario de sección. */
export const esquemaDeCampos = (campos: CampoPta[]) => {
  const forma: Record<string, yup.AnySchema> = {};
  campos.forEach((campo) => {
    forma[campo.nombre] = esquemaDeCampo(campo) as yup.AnySchema;
  });
  return yup.object(forma);
};
