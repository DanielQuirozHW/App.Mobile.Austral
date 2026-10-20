// Alta, edición y vista de una dirección de investigadores y/o becarios. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/actividad-i+d/formacion-rrhh/modales/ModalDireccion.tsx.
import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarDireccion } from '../../../application/perfil/actividadService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { esValor } from '../../../domain/perfil/afiliaciones';
import { OPCIONES_SI_NO, opcionABoolean } from '../../../domain/perfil/comun';
import {
  CARRERA_BECARIO,
  direccionAFormulario,
  esquemaDireccion,
  PERTENENCIA_RRHH,
  type DireccionBecario,
  type FormularioDireccion,
} from '../../../domain/perfil/formacionRrhh';
import { useActividadStore } from '../../stores/actividadStore';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: DireccionBecario;
  onClose: () => void;
}

const TITULO = 'Dirección de Investigadores y/o Becarios';
const SUB = 'Información de dirección de investigadores y/o becarios';
const UA = 100000000;
const OTRO = 100000001;

export const ModalDireccion: React.FC<Props> = ({ modo, item, onClose }) => {
  const colaboradores = useActividadStore((s) => s.colaboradores);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(() => direccionAFormulario(item, colaboradores), [item, colaboradores]);

  const { control, handleSubmit, formState, watch, setValue } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaDireccion as any),
  });
  const pertenenciaDirector = watch('pertenenciaDirector');
  const pertenenciaCodirector = watch('pertenenciaCodirector');
  const pertenenciaBecario = watch('pertenenciaBecario');
  const enCurso = opcionABoolean(watch('enCurso')) === true;

  // En curso no tiene fecha de fin (como el portal).
  useEffect(() => {
    if (enCurso) setValue('fechaFin', null, { shouldValidate: true });
  }, [enCurso, setValue]);

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarDireccion(valores as FormularioDireccion, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Investigadores becarios cargados con éxito' : 'Investigadores becarios editados con éxito');
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(
        mensajeDeErrorApi(
          error,
          nuevo ? 'Error al cargar los investigadores becarios' : 'Error al editar los investigadores becarios',
        ),
      );
    } finally {
      setGuardando(false);
    }
  });

  if (modo === 'ver' && item) {
    return (
      <ModalPerfil modo="ver" titulo={TITULO} subtituloNuevo={SUB} subtituloEditar={SUB} onClose={onClose}>
        <View style={{ gap: 8 }}>
          <FilaDato label="Pertenencia Director" valor={item.pertenenciaDirector?.label ?? ''} />
          <FilaDato label="Director" valor={item.directorNombre} />
          <FilaDato label="Pertenencia Codirector" valor={item.pertenenciaCodirector?.label ?? ''} />
          <FilaDato label="Codirector" valor={item.codirectorNombre} />
          <FilaDato label="Carrera" valor={item.carrera?.label ?? ''} />
          <FilaDato label="Pertenencia del Investigador / Becario" valor={item.pertenenciaBecario?.label ?? ''} />
          <FilaDato label="Investigador / Becario" valor={item.becarioNombre} />
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha de fin" valor={aFechaVisible(item.fechaFin)} />
          <FilaDato label="En curso" valor={item.enCurso?.label ?? ''} />
        </View>
      </ModalPerfil>
    );
  }

  return (
    <ModalPerfil
      modo={modo}
      titulo={TITULO}
      subtituloNuevo={SUB}
      subtituloEditar={SUB}
      onClose={onClose}
      hayCambios={formState.isDirty}
      guardando={guardando}
      onGuardar={guardar}
    >
      <Campos>
        <FormSelectField
          control={control}
          name="pertenenciaDirector"
          label="Pertenencia Director"
          options={PERTENENCIA_RRHH as any}
          clearable
        />
        {esValor(pertenenciaDirector, UA) ? (
          <FormSelectField
            control={control}
            name="director"
            label="Director"
            required
            options={colaboradores as any}
            buscable
          />
        ) : null}
        {esValor(pertenenciaDirector, OTRO) ? (
          <FormTextField control={control} name="directorOtro" label="Otro" required maximo={100} />
        ) : null}

        <FormSelectField
          control={control}
          name="pertenenciaCodirector"
          label="Pertenencia Codirector"
          options={PERTENENCIA_RRHH as any}
          clearable
        />
        {esValor(pertenenciaCodirector, UA) ? (
          <FormSelectField
            control={control}
            name="codirector"
            label="Codirector"
            required
            options={colaboradores as any}
            buscable
          />
        ) : null}
        {esValor(pertenenciaCodirector, OTRO) ? (
          <FormTextField control={control} name="codirectorOtro" label="Otro" required maximo={100} />
        ) : null}

        <FormSelectField control={control} name="carrera" label="Carrera" options={CARRERA_BECARIO as any} clearable />

        <FormSelectField
          control={control}
          name="pertenenciaBecario"
          label="Pertenencia del Investigador / Becario"
          required
          options={PERTENENCIA_RRHH as any}
        />
        {esValor(pertenenciaBecario, UA) ? (
          <FormSelectField
            control={control}
            name="becario"
            label="Investigador/Becario"
            required
            options={colaboradores as any}
            buscable
          />
        ) : null}
        {esValor(pertenenciaBecario, OTRO) ? (
          <FormTextField control={control} name="becarioOtro" label="Otro" required maximo={100} />
        ) : null}

        <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required />
        <FormDateField control={control} name="fechaFin" label="Fecha de fin" disabled={enCurso} clearable />
        <FormSelectField control={control} name="enCurso" label="En Curso" required options={OPCIONES_SI_NO as any} />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
