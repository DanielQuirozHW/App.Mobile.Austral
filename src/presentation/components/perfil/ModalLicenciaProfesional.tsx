// Alta, edición y vista de una licencia profesional / membresía / asociación.
// Port de Portal-Austral-Dev -> perfil/_components/trayectoria (licencia profesional / membresías / asociaciones).
// El portal pide mes y año; acá se elige la fecha y se usa solo el mes y el año (se muestra y se envía así).
import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarLicenciaProfesional } from '../../../application/perfil/trayectoriaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import {
  aMesAnioVisible,
  licenciaProfesionalAFormulario,
  type FormularioLicenciaProfesional,
  type LicenciaProfesional,
} from '../../../domain/perfil/trayectoria';
import { esquemaLicenciaProfesional } from '../../../domain/perfil/trayectoriaValidacion';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, InfoAlert, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: LicenciaProfesional;
  onClose: () => void;
}

const TITULO = 'Licencia profesional / Membresías / Asociaciones profesionales';
const SUB_NUEVO = 'Agrega una nueva Licencia / Membresía / Asociación';
const SUB_EDITAR = 'Modifica la información de la licencia / membresía / asociación';
const ETIQUETA_TIPO = 'Tipo de licencia / Membresía / Asociación';

export const ModalLicenciaProfesional: React.FC<Props> = ({ modo, item, onClose }) => {
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';

  const { control, handleSubmit, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: licenciaProfesionalAFormulario(item),
    resolver: yupResolver(esquemaLicenciaProfesional as any),
  });

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando…');
    try {
      await guardarLicenciaProfesional(valores as FormularioLicenciaProfesional, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(
        nuevo
          ? 'Licencia / Membresía / Asociación cargada con éxito'
          : 'Licencia / Membresía / Asociación modificada con éxito',
      );
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
          <FilaDato label={ETIQUETA_TIPO} valor={item.tipo} />
          <FilaDato label="Organismo emisor" valor={item.organismo} />
          <FilaDato label="Fecha de obtención" valor={aMesAnioVisible(item.fechaObtencion)} />
          <FilaDato label="Vigencia hasta" valor={aMesAnioVisible(item.vigenciaHasta)} />
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
        <FormTextField control={control} name="tipo" label={ETIQUETA_TIPO} required maximo={200} mostrarContador />
        <FormTextField
          control={control}
          name="organismo"
          label="Organismo emisor"
          required
          maximo={200}
          mostrarContador
        />
        <FormDateField
          control={control}
          name="fechaObtencion"
          label="Fecha de obtención (mes y año)"
          required
          maximumDate={new Date()}
        />
        <FormDateField control={control} name="vigenciaHasta" label="Vigencia hasta (mes y año)" clearable />
        <InfoAlert tipo="info">De la fecha elegida solo se toma el mes y el año.</InfoAlert>
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
