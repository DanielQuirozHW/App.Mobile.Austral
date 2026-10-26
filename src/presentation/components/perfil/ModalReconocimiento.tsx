// Alta, edición y vista de un reconocimiento profesional. Port de Portal-Austral-Dev -> perfil/_components/trayectoria (reconocimientos).
import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarReconocimiento } from '../../../application/perfil/trayectoriaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import {
  reconocimientoAFormulario,
  type FormularioReconocimiento,
  type Reconocimiento,
} from '../../../domain/perfil/trayectoria';
import { AMBITOS } from '../../../domain/perfil/trayectoriaOpciones';
import { esquemaReconocimiento } from '../../../domain/perfil/trayectoriaValidacion';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: Reconocimiento;
  onClose: () => void;
}

const TITULO = 'Reconocimientos profesionales';
const SUB_NUEVO = 'Agrega un nuevo reconocimiento';
const SUB_EDITAR = 'Modifica la información del reconocimiento';

export const ModalReconocimiento: React.FC<Props> = ({ modo, item, onClose }) => {
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';

  const { control, handleSubmit, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: reconocimientoAFormulario(item),
    resolver: yupResolver(esquemaReconocimiento as any),
  });

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando…');
    try {
      await guardarReconocimiento(valores as FormularioReconocimiento, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Reconocimiento cargado con éxito' : 'Reconocimiento modificado con éxito');
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
          <FilaDato label="Tipo de reconocimiento" valor={item.tipo} />
          <FilaDato label="Nombre del reconocimiento" valor={item.nombre} />
          <FilaDato label="Institución / organismo otorgante" valor={item.institucion} />
          <FilaDato label="Ámbito" valor={item.ambito.label} />
          <FilaDato label="Fecha de otorgamiento" valor={aFechaVisible(item.fecha)} />
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
        <FormTextField
          control={control}
          name="tipo"
          label="Tipo de reconocimiento"
          required
          maximo={200}
          mostrarContador
        />
        <FormTextField
          control={control}
          name="nombre"
          label="Nombre del reconocimiento"
          required
          maximo={200}
          mostrarContador
        />
        <FormTextField
          control={control}
          name="institucion"
          label="Institución / organismo otorgante"
          required
          maximo={200}
          mostrarContador
        />
        <FormSelectField control={control} name="ambito" label="Ámbito" required options={AMBITOS as any} />
        <FormDateField
          control={control}
          name="fecha"
          label="Fecha de otorgamiento"
          required
          maximumDate={new Date()}
        />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
