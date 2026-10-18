// Alta, edición y vista de un cargo / encargo en gestión académica externos.
// Port de Portal-Austral-Dev -> perfil/_components/gestion-academica/modales/ModalCargosEncargosGestion.tsx.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarExterno } from '../../../application/perfil/gestionAcademicaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import {
  esEstadoFinalizado,
  esquemaCargoEncargoExterno,
  ESTADOS_EXTERNO,
  externoAFormulario,
  type CargoEncargoExterno,
  type FormularioCargoEncargoExterno,
} from '../../../domain/perfil/gestionAcademica';
import { useGestionAcademicaStore } from '../../stores/gestionAcademicaStore';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: CargoEncargoExterno;
  onClose: () => void;
}

const TITULO = 'Cargo / Encargo en gestión académica externos';
const SUB_NUEVO = 'Información del cargo / encargo';
const SUB_EDITAR = 'Modifica la información del cargo / encargo';

export const ModalCargoEncargoExterno: React.FC<Props> = ({ modo, item, onClose }) => {
  const paises = useGestionAcademicaStore((s) => s.paises);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(() => externoAFormulario(item), [item]);

  const { control, handleSubmit, watch, setValue, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaCargoEncargoExterno as any),
  });

  const finalizado = esEstadoFinalizado(watch('estado'));

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarExterno(valores as FormularioCargoEncargoExterno, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Cargo - Encargo cargado con éxito' : 'Cargo - Encargo modificado con éxito');
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
          <FilaDato label="Cargo/Encargo" valor={item.cargoEncargo} />
          <FilaDato label="Institución" valor={item.institucion} />
          <FilaDato label="País" valor={item.pais.label} />
          <FilaDato label="Dedicación semanal en horas" valor={item.dedicacionSemanal} />
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Estado" valor={item.estado.label} />
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
        <FormTextField control={control} name="cargoEncargo" label="Cargo/Encargo" required />
        <FormTextField control={control} name="institucion" label="Institución" required />
        <FormSelectField control={control} name="pais" label="País" required options={paises as any} buscable />
        <FormTextField
          control={control}
          name="dedicacionSemanal"
          label="Dedicación semanal en horas"
          required
          soloDigitos
          keyboardType="number-pad"
        />
        <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required />
        <FormSelectField
          control={control}
          name="estado"
          label="Estado"
          required
          options={ESTADOS_EXTERNO as any}
          onCambio={(opcion) => {
            // La fecha de fin solo se muestra con estado Finalizado: al pasar a Vigente no queda una fecha oculta.
            if (!esEstadoFinalizado(opcion as any)) setValue('fechaFin', null, { shouldValidate: true });
          }}
        />
        {finalizado ? (
          <FormDateField control={control} name="fechaFin" label="Fecha de finalización" required />
        ) : null}
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
