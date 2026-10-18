// Alta, edición y vista de un encargo en gestión académica Austral.
// Port de Portal-Austral-Dev -> perfil/_components/gestion-academica/modales/ModalEncargosGestion.tsx.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarEncargo } from '../../../application/perfil/gestionAcademicaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import {
  encargoAFormulario,
  esquemaEncargo,
  TIPOS_ENCARGO,
  TIPO_ENCARGO_OTRO,
  type Encargo,
  type FormularioEncargo,
} from '../../../domain/perfil/gestionAcademica';
import { useGestionAcademicaStore } from '../../stores/gestionAcademicaStore';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormMultiSelectField } from '../form/FormMultiSelectField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: Encargo;
  onClose: () => void;
}

const TITULO = 'Encargos en gestión académica Austral';
const SUB_NUEVO = 'Información del encargo';
const SUB_EDITAR = 'Modifica la información del encargo';

export const ModalEncargoGestion: React.FC<Props> = ({ modo, item, onClose }) => {
  const unidades = useGestionAcademicaStore((s) => s.unidades);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(() => encargoAFormulario(item), [item]);

  const { control, handleSubmit, watch, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaEncargo as any),
  });

  const tipos = (watch('tipo') ?? []) as Array<{ value: unknown; label: string }>;
  const unidad = watch('unidadAcademica');
  const mostrarOtroTipo = tipos.some((t) => Number(t.value) === TIPO_ENCARGO_OTRO || t.label === 'Otro');

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarEncargo(valores as FormularioEncargo, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Encargo cargado con éxito' : 'Encargo modificado con éxito');
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(error, 'Error al cargar'));
    } finally {
      setGuardando(false);
    }
  });

  if (modo === 'ver' && item) {
    return (
      <ModalPerfil modo="ver" titulo={TITULO} subtituloNuevo={SUB_NUEVO} subtituloEditar={SUB_EDITAR} onClose={onClose}>
        <View style={{ gap: 8 }}>
          <FilaDato label="Encargo" valor={item.encargo} />
          <FilaDato label="Tipo" valor={item.tipo.map((t) => t.label).join(', ')} />
          {item.otroTipo ? <FilaDato label="Otro" valor={item.otroTipo} /> : null}
          <FilaDato label="Unidad académica / Otras" valor={item.unidadAcademica.label} />
          {item.otraUnidad ? <FilaDato label="Otro" valor={item.otraUnidad} /> : null}
          <FilaDato label="Propuesta formativa" valor={item.propuestaFormativa} />
          <FilaDato label="Dedicación semanal en horas" valor={item.dedicacionSemanal} />
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha de finalización" valor={aFechaVisible(item.fechaFin)} />
          <FilaDato label="Reporta a" valor={item.reportaA} />
          <FilaDato label="Descripción del encargo" valor={item.descripcion} />
        </View>
      </ModalPerfil>
    );
  }

  return (
    <ModalPerfil
      modo={modo}
      titulo={TITULO}
      subtituloNuevo={SUB_NUEVO}
      subtituloEditar={SUB_EDITAR}
      onClose={onClose}
      hayCambios={formState.isDirty}
      guardando={guardando}
      onGuardar={guardar}
    >
      <Campos>
        <FormTextField control={control} name="encargo" label="Encargo" required />
        <FormMultiSelectField control={control} name="tipo" label="Tipo" required options={TIPOS_ENCARGO as any} />
        {mostrarOtroTipo ? <FormTextField control={control} name="otroTipo" label="Otro" required /> : null}
        <FormSelectField
          control={control}
          name="unidadAcademica"
          label="Unidad académica / Otras"
          required
          options={unidades as any}
          buscable
        />
        {unidad?.label === 'Otra' ? <FormTextField control={control} name="otraUnidad" label="Otro" required /> : null}
        <FormTextField control={control} name="propuestaFormativa" label="Propuesta formativa" />
        <FormTextField
          control={control}
          name="dedicacionSemanal"
          label="Dedicación semanal en horas"
          required
          soloDigitos
          keyboardType="number-pad"
        />
        <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required />
        <FormDateField control={control} name="fechaFin" label="Fecha de finalización" clearable />
        <FormTextField control={control} name="reportaA" label="Reporta a" required />
        <FormTextField control={control} name="descripcion" label="Descripción del encargo" multiline />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
