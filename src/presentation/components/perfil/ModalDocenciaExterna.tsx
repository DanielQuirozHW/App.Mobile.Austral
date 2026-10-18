// Alta, edición y vista de una docencia externa. Port de Portal-Austral-Dev ->
// perfil/_components/docencia/docencia/ModalDocenciaExterna.tsx.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarDocenciaExterna } from '../../../application/perfil/docenciaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import {
  CARGO_DOCENCIA_EXTERNA,
  DEDICACION_EXTERNA,
  docenciaExternaAFormulario,
  esquemaDocenciaExterna,
  REGIMEN_DE_DICTADO,
  type DocenciaExterna,
  type FormularioDocenciaExterna,
} from '../../../domain/perfil/docencia';
import { useDocenciaStore } from '../../stores/docenciaStore';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: DocenciaExterna;
  onClose: () => void;
}

const TITULO = 'Docencia externa';
const SUB_NUEVO = 'Información de la docencia externa';
const SUB_EDITAR = 'Información de la docencia externa';

export const ModalDocenciaExterna: React.FC<Props> = ({ modo, item, onClose }) => {
  const instituciones = useDocenciaStore((s) => s.instituciones);
  const niveles = useDocenciaStore((s) => s.gradosAcademicos);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(
    () => docenciaExternaAFormulario(item, { instituciones, niveles }),
    [item, instituciones, niveles],
  );

  const { control, handleSubmit, watch, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaDocenciaExterna as any),
  });

  const institucion = watch('institucion');
  const cargo = watch('cargo');
  const nivel = watch('nivel');
  const fechaInicio = watch('fechaInicio') as Date | null;

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarDocenciaExterna(valores as FormularioDocenciaExterna, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Docencia cargada con éxito' : 'Docencia modificada con éxito');
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
          <FilaDato label="Asignatura / Actividad curricular" valor={item.asignatura} />
          <FilaDato label="Carrera / Propuesta formativa" valor={item.carrera} />
          <FilaDato label="Institución" valor={item.institucion.label ?? ''} />
          {item.otraInstitucion ? <FilaDato label="Otra institución" valor={item.otraInstitucion} /> : null}
          <FilaDato label="Unidad Académica / Facultad" valor={item.unidadAcademica} />
          <FilaDato label="Cargo" valor={item.cargo.label ?? ''} />
          {item.otroCargo ? <FilaDato label="Otro cargo" valor={item.otroCargo} /> : null}
          <FilaDato label="Nivel" valor={item.nivel.label ?? ''} />
          {item.otroNivel ? <FilaDato label="Otro nivel" valor={item.otroNivel} /> : null}
          <FilaDato label="Régimen de dictado" valor={item.regimen.label ?? ''} />
          <FilaDato label="Dedicación horaria" valor={item.dedicacionHoraria} />
          <FilaDato label="Dedicación" valor={item.dedicacion.label ?? ''} />
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha de fin" valor={aFechaVisible(item.fechaFin)} />
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
          name="asignatura"
          label="Asignatura / Actividad curricular"
          required
          maximo={100}
          mostrarContador
        />
        <FormTextField
          control={control}
          name="carrera"
          label="Carrera / Propuesta formativa"
          required
          maximo={100}
          mostrarContador
        />
        <FormSelectField
          control={control}
          name="institucion"
          label="Institución"
          required
          options={instituciones as any}
          buscable
        />
        {institucion?.label === 'Otra' ? (
          <FormTextField
            control={control}
            name="otraInstitucion"
            label="Otra institución"
            required
            maximo={100}
            mostrarContador
          />
        ) : null}
        <FormTextField
          control={control}
          name="unidadAcademica"
          label="Unidad Académica / Facultad"
          required
          maximo={100}
          mostrarContador
        />
        <FormSelectField
          control={control}
          name="cargo"
          label="Cargo"
          required
          options={CARGO_DOCENCIA_EXTERNA as any}
          buscable
        />
        {cargo?.label === 'Otro de nivel superior' ? (
          <FormTextField control={control} name="otroCargo" label="Otro cargo" required maximo={100} mostrarContador />
        ) : null}
        <FormSelectField control={control} name="nivel" label="Nivel" required options={niveles as any} buscable />
        {nivel?.label === 'Otro' ? (
          <FormTextField control={control} name="otroNivel" label="Otro nivel" required maximo={100} mostrarContador />
        ) : null}
        <FormSelectField
          control={control}
          name="regimen"
          label="Régimen de dictado"
          required
          options={REGIMEN_DE_DICTADO as any}
        />
        <FormTextField
          control={control}
          name="dedicacionHoraria"
          label="Dedicación horaria"
          required
          soloDigitos
          keyboardType="number-pad"
        />
        <FormSelectField
          control={control}
          name="dedicacion"
          label="Dedicación"
          required
          options={DEDICACION_EXTERNA as any}
        />
        <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required />
        <FormDateField
          control={control}
          name="fechaFin"
          label="Fecha de fin"
          clearable
          minimumDate={fechaInicio ?? undefined}
        />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
