// Alta, edición y vista de una consultoría externa. Port de Portal-Austral-Dev -> perfil/_components/trayectoria (consultorías externas).
import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarConsultoria } from '../../../application/perfil/trayectoriaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { OPCIONES_SI_NO } from '../../../domain/perfil/comun';
import {
  consultoriaAFormulario,
  type ConsultoriaExterna,
  type FormularioConsultoria,
} from '../../../domain/perfil/trayectoria';
import { TIPOS_DEDICACION } from '../../../domain/perfil/trayectoriaOpciones';
import { esquemaConsultoria } from '../../../domain/perfil/trayectoriaValidacion';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: ConsultoriaExterna;
  onClose: () => void;
}

const TITULO = 'Consultoría externa';
const SUB_NUEVO = 'Agrega una nueva consultoría externa';
const SUB_EDITAR = 'Modifica la información de la consultoría externa';

export const ModalConsultoria: React.FC<Props> = ({ modo, item, onClose }) => {
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';

  const { control, handleSubmit, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: consultoriaAFormulario(item),
    resolver: yupResolver(esquemaConsultoria as any),
  });

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando…');
    try {
      await guardarConsultoria(valores as FormularioConsultoria, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Consultoría cargada con éxito' : 'Consultoría modificada con éxito');
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
          <FilaDato label="Tema / área de consultoría" valor={item.tema} />
          <FilaDato label="Cliente / organización" valor={item.cliente} />
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha de fin" valor={aFechaVisible(item.fechaFin)} />
          <FilaDato label="Tipo de dedicación" valor={item.tipoDedicacion.label} />
          <FilaDato label="Dedicación horaria" valor={item.dedicacion} />
          <FilaDato label="Financiamiento recibido" valor={item.financiamiento?.label} />
          <FilaDato label="Principales resultados" valor={item.resultados} />
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
          name="tema"
          label="Tema / área de consultoría"
          required
          maximo={300}
          mostrarContador
        />
        <FormTextField
          control={control}
          name="cliente"
          label="Cliente / organización"
          required
          maximo={200}
          mostrarContador
        />
        <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required />
        <FormDateField control={control} name="fechaFin" label="Fecha de fin" clearable />
        <FormSelectField
          control={control}
          name="tipoDedicacion"
          label="Tipo de dedicación"
          required
          options={TIPOS_DEDICACION as any}
        />
        <FormTextField
          control={control}
          name="dedicacion"
          label="Dedicación horaria"
          required
          soloDigitos
          keyboardType="number-pad"
        />
        <FormSelectField
          control={control}
          name="financiamiento"
          label="Financiamiento recibido"
          options={OPCIONES_SI_NO as any}
          clearable
        />
        <FormTextField
          control={control}
          name="resultados"
          label="Principales resultados"
          maximo={1000}
          mostrarContador
          multiline
        />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
