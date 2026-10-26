// Alta, edición y vista de un comité profesional o técnico. Port de Portal-Austral-Dev -> perfil/_components/trayectoria (comités).
import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarComite } from '../../../application/perfil/trayectoriaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { comiteAFormulario, type ComiteProfesional, type FormularioComite } from '../../../domain/perfil/trayectoria';
import { AMBITOS } from '../../../domain/perfil/trayectoriaOpciones';
import { esquemaComite } from '../../../domain/perfil/trayectoriaValidacion';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: ComiteProfesional;
  onClose: () => void;
}

const TITULO = 'Comité profesional o técnico';
const SUB_NUEVO = 'Agrega un nuevo comité';
const SUB_EDITAR = 'Modifica la información del comité';

export const ModalComite: React.FC<Props> = ({ modo, item, onClose }) => {
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';

  const { control, handleSubmit, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: comiteAFormulario(item),
    resolver: yupResolver(esquemaComite as any),
  });

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando…');
    try {
      await guardarComite(valores as FormularioComite, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Comité cargado con éxito' : 'Comité modificado con éxito');
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
          <FilaDato label="Nombre del Comité / Organismo" valor={item.nombre} />
          <FilaDato label="Cargo / Rol" valor={item.cargo} />
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha de fin" valor={aFechaVisible(item.fechaFin)} />
          <FilaDato label="Ámbito" valor={item.ambito.label} />
          <FilaDato label="Principales contribuciones" valor={item.contribuciones} />
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
          name="nombre"
          label="Nombre del Comité / Organismo"
          required
          maximo={200}
          mostrarContador
        />
        <FormTextField control={control} name="cargo" label="Cargo / Rol" required maximo={200} mostrarContador />
        <FormDateField
          control={control}
          name="fechaInicio"
          label="Fecha de inicio"
          required
          maximumDate={new Date()}
        />
        <FormDateField control={control} name="fechaFin" label="Fecha de fin" clearable maximumDate={new Date()} />
        <FormSelectField control={control} name="ambito" label="Ámbito" required options={AMBITOS as any} />
        <FormTextField
          control={control}
          name="contribuciones"
          label="Principales contribuciones"
          maximo={1000}
          mostrarContador
          multiline
        />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
