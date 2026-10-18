// Alta, edición y vista de una experiencia laboral fuera del ámbito académico.
// Port de Portal-Austral-Dev -> perfil/_components/trayectoria (experiencia laboral fuera del ámbito académico).
import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarExperiencia } from '../../../application/perfil/trayectoriaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import {
  experienciaAFormulario,
  type ExperienciaFuera,
  type FormularioExperiencia,
} from '../../../domain/perfil/trayectoria';
import { AYUDA_EXPERIENCIA_FUERA, SECTORES_INDUSTRIA, SECTOR_OTRO } from '../../../domain/perfil/trayectoriaOpciones';
import { esquemaExperiencia } from '../../../domain/perfil/trayectoriaValidacion';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, InfoAlert, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: ExperienciaFuera;
  onClose: () => void;
}

const TITULO = 'Experiencia laboral fuera del ámbito académico';
const SUB_NUEVO = 'Agrega una nueva experiencia laboral';
const SUB_EDITAR = 'Modifica la información de la experiencia laboral';

export const ModalExperiencia: React.FC<Props> = ({ modo, item, onClose }) => {
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';

  const { control, handleSubmit, watch, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: experienciaAFormulario(item),
    resolver: yupResolver(esquemaExperiencia as any),
  });

  const sector = watch('sector');

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando…');
    try {
      const datos = valores as FormularioExperiencia;
      await guardarExperiencia(
        { ...datos, otroSector: Number(datos.sector?.value) === SECTOR_OTRO ? datos.otroSector : '' },
        nuevo ? undefined : item?.id,
      );
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Experiencia cargada con éxito' : 'Experiencia modificada con éxito');
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
          <FilaDato label="Cargo / Posición" valor={item.cargo} />
          <FilaDato label="Institución / Empresa" valor={item.institucion} />
          <FilaDato label="Sector / Industria" valor={item.sector.label} />
          {item.otroSector ? <FilaDato label="Otro sector / industria" valor={item.otroSector} /> : null}
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha de fin" valor={aFechaVisible(item.fechaFin)} />
          <FilaDato label="Dedicación horaria semanal" valor={item.dedicacion} />
          <FilaDato label="Personas a cargo" valor={item.personasACargo} />
          <FilaDato label="Principales responsabilidades" valor={item.responsabilidades} />
          <FilaDato label="Logros destacados" valor={item.logros} />
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
        <InfoAlert tipo="info">{AYUDA_EXPERIENCIA_FUERA}</InfoAlert>
        <FormTextField control={control} name="cargo" label="Cargo / Posición" required maximo={200} mostrarContador />
        <FormTextField
          control={control}
          name="institucion"
          label="Institución / Empresa"
          required
          maximo={200}
          mostrarContador
        />
        <FormSelectField
          control={control}
          name="sector"
          label="Sector / Industria"
          required
          options={SECTORES_INDUSTRIA as any}
          buscable
        />
        {Number(sector?.value) === SECTOR_OTRO ? (
          <FormTextField control={control} name="otroSector" label="Otro (especifique)" required maximo={200} mostrarContador />
        ) : null}
        <FormDateField
          control={control}
          name="fechaInicio"
          label="Fecha de inicio"
          required
          maximumDate={new Date()}
        />
        <FormDateField control={control} name="fechaFin" label="Fecha de fin" clearable maximumDate={new Date()} />
        <FormTextField
          control={control}
          name="dedicacion"
          label="Dedicación horaria semanal"
          required
          soloDigitos
          keyboardType="number-pad"
        />
        <FormTextField
          control={control}
          name="personasACargo"
          label="Personas a cargo"
          soloDigitos
          keyboardType="number-pad"
        />
        <FormTextField
          control={control}
          name="responsabilidades"
          label="Principales responsabilidades"
          maximo={300}
          mostrarContador
          multiline
        />
        <FormTextField control={control} name="logros" label="Logros destacados" maximo={300} mostrarContador multiline />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
