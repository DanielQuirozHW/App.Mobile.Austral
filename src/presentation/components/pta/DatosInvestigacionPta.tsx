// Investigación: "1. Formación/Vinculación con actividades de investigación" y "5. Total horas proyectos de
// investigación y resultados esperados". Port de ModalPlanDeTrabajoDocente.tsx (Portal-Austral-Dev).
import React, { useEffect, useState } from 'react';
import { guardarCargaDeInvestigacion, guardarDatosDelPlan } from '../../../application/pta/ptaService';
import {
  OPC_FORMACION_INV,
  OPC_TIPO_CARGA,
  TIPO_CARGA_DIAS,
  TIPO_CARGA_HORAS,
} from '../../../domain/pta/constantes';
import type { PlanDeTrabajo } from '../../../domain/pta/tipos';
import { AppButton } from '../AppButton';
import { AppTextField } from '../AppTextField';
import { SelectField, type OpcionDeSelect } from '../form/SelectField';
import { CajaPta } from './CajaPta';
import { ejecutarConToast } from './ejecutarPta';

interface Props {
  plan: PlanDeTrabajo;
  deshabilitado: boolean;
  /** El estado del PTA permite cargar (1 o 100000000). */
  editable: boolean;
}

const TEXTOS_PLAN = {
  procesando: 'Procesando...',
  exito: 'Cambios guardados correctamente',
  error: 'Error al editar el plan de trabajo',
};

const aTexto = (n: number | null): string => (n === null || n === undefined ? '' : String(n));
const soloDigitos = (t: string): string => t.replace(/\D/g, '');

const opcionDe = (lista: Array<{ value: number | string; label: string }>, valor: unknown): OpcionDeSelect | null => {
  if (valor === null || valor === undefined || valor === '') return null;
  const hallada = lista.find((o) => String(o.value) === String(valor));
  return hallada ? ({ value: hallada.value, label: hallada.label } as OpcionDeSelect) : null;
};

export const FormacionVinculacionInv: React.FC<Props> = ({ plan, deshabilitado, editable }) => {
  const [opcion, setOpcion] = useState<OpcionDeSelect | null>(opcionDe(OPC_FORMACION_INV, plan.formacionInv.value));
  const [guardando, setGuardando] = useState(false);

  useEffect(() => setOpcion(opcionDe(OPC_FORMACION_INV, plan.formacionInv.value)), [plan.formacionInv.value]);

  const guardar = async () => {
    setGuardando(true);
    await ejecutarConToast(
      () => guardarDatosDelPlan(plan, { formacionInv: opcion ? Number(opcion.value) : 0 }),
      TEXTOS_PLAN,
    );
    setGuardando(false);
  };

  return (
    <CajaPta titulo="1. Formación/Vinculación con actividades de investigación">
      <SelectField
        label="Formación/Vinculación con actividades de investigación"
        options={OPC_FORMACION_INV as any}
        value={opcion}
        onChange={setOpcion}
        disabled={!editable || deshabilitado}
      />
      <AppButton
        title="Guardar"
        onPress={guardar}
        loading={guardando}
        disabled={!editable || deshabilitado || guardando}
      />
    </CajaPta>
  );
};

export const TotalInvestigacion: React.FC<Props> = ({ plan, deshabilitado, editable }) => {
  const [tipo, setTipo] = useState<OpcionDeSelect | null>(opcionDe(OPC_TIPO_CARGA, plan.tipoCarga.value));
  const [horas, setHoras] = useState(aTexto(plan.totalHorasInvestigacion));
  const [dias, setDias] = useState(aTexto(plan.totalDiasInvestigacion));
  const [guardando, setGuardando] = useState(false);
  const [intento, setIntento] = useState(false);

  useEffect(() => {
    setTipo(opcionDe(OPC_TIPO_CARGA, plan.tipoCarga.value));
    setHoras(aTexto(plan.totalHorasInvestigacion));
    setDias(aTexto(plan.totalDiasInvestigacion));
  }, [plan.tipoCarga.value, plan.totalHorasInvestigacion, plan.totalDiasInvestigacion]);

  const tipoNumero = tipo ? Number(tipo.value) : 0;
  const esDias = tipoNumero === TIPO_CARGA_DIAS;
  const esHoras = tipoNumero === TIPO_CARGA_HORAS;
  const faltaDias = esDias && dias.trim() === '';

  const guardar = async () => {
    setIntento(true);
    if (faltaDias) return;
    setGuardando(true);
    await ejecutarConToast(() => guardarCargaDeInvestigacion(plan, { tipoCarga: tipoNumero, horas, dias }), {
      procesando: 'Procesando...',
      exito: `Total ${esDias ? 'días' : 'horas'} proyectos de investigación y resultados esperados`,
      error: 'Error al cargar',
    });
    setGuardando(false);
  };

  return (
    <CajaPta titulo="5. Total horas proyectos de investigación y resultados esperados">
      <SelectField
        label="Tipo de carga"
        options={OPC_TIPO_CARGA as any}
        value={tipo}
        onChange={setTipo}
        disabled={!editable || deshabilitado}
      />
      {esDias ? (
        <AppTextField
          label="Días"
          required
          value={dias}
          onChangeText={(t) => setDias(soloDigitos(t))}
          keyboardType="number-pad"
          editable={!deshabilitado && editable}
          error={intento && faltaDias ? 'Los días son requeridos' : undefined}
        />
      ) : null}
      {esHoras ? (
        <AppTextField
          label="Horas"
          value={horas}
          onChangeText={(t) => setHoras(soloDigitos(t))}
          keyboardType="number-pad"
          editable={!deshabilitado && editable}
        />
      ) : null}
      <AppButton
        title="Guardar"
        onPress={guardar}
        loading={guardando}
        disabled={!editable || deshabilitado || guardando || tipoNumero === 0}
      />
    </CajaPta>
  );
};
