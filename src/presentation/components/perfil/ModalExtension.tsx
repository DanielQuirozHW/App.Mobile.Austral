// Alta, edición y vista de una actividad de extensión. Port de Portal-Austral-Dev ->
// perfil/_components/extension/modales/ModalExtension.tsx.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarActividadExtension } from '../../../application/perfil/extensionService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import {
  actividadAFormulario,
  esquemaActividadExtension,
  type ActividadExtension,
  type FormularioActividadExtension,
} from '../../../domain/perfil/extension';
import { useExtensionStore } from '../../stores/extensionStore';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: ActividadExtension;
  onClose: () => void;
}

const TITULO = 'Actividades de extensión';
const SUB_NUEVO = 'Agrega una nueva actividad de extensión';
const SUB_EDITAR = 'Modifica la información de la actividad de extensión';

export const ModalExtension: React.FC<Props> = ({ modo, item, onClose }) => {
  const unidades = useExtensionStore((s) => s.unidades);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(() => actividadAFormulario(item, unidades), [item, unidades]);

  const { control, handleSubmit, watch, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaActividadExtension as any),
  });

  const unidad = watch('unidadAcademica');

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      const datos = valores as FormularioActividadExtension;
      await guardarActividadExtension(datos, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Actividad cargada con éxito' : 'Actividad modificada con éxito');
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
          <FilaDato label="Actividad" valor={item.actividad} />
          <FilaDato label="Unidad Académica" valor={item.unidadAcademica.label} />
          {item.otraUnidadAcademica ? <FilaDato label="Otra unidad académica" valor={item.otraUnidadAcademica} /> : null}
          <FilaDato label="Dedicación horaria anual" valor={item.dedicacion} />
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha de finalización" valor={aFechaVisible(item.fechaFin)} />
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
        <FormTextField control={control} name="actividad" label="Actividad" required maximo={100} mostrarContador />
        <FormSelectField
          control={control}
          name="unidadAcademica"
          label="Unidad Académica"
          required
          options={unidades as any}
          buscable
        />
        {unidad?.label === 'Otra' ? (
          <FormTextField
            control={control}
            name="otraUnidadAcademica"
            label="Otra unidad académica"
            required
            maximo={200}
            mostrarContador
          />
        ) : null}
        <FormTextField
          control={control}
          name="dedicacion"
          label="Dedicación horaria anual"
          required
          soloDigitos
          keyboardType="number-pad"
        />
        <FormDateField
          control={control}
          name="fechaInicio"
          label="Fecha de inicio"
          required
          maximumDate={new Date()}
        />
        <FormDateField control={control} name="fechaFin" label="Fecha de finalización" clearable />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
