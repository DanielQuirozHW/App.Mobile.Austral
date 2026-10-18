// Alta, edición y vista de una participación en jurados - tribunal. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/perfil/jurados/modales/ModalJuradoTribunal.tsx.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarJurado } from '../../../application/perfil/afiliacionesService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import {
  esquemaJurado,
  esValor,
  juradoAFormulario,
  ROL_JURADO,
  TIPO_ACTIVIDAD_EVALUACION,
  type FormularioJurado,
  type JuradoTribunal,
} from '../../../domain/perfil/afiliaciones';
import { caracteresRestantes } from '../../../domain/perfil/comun';
import { useAfiliacionesStore } from '../../stores/afiliacionesStore';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: JuradoTribunal;
  onClose: () => void;
}

const TITULO = 'Jurados - tribunal';
const SUB = 'Información de jurados - tribunal';

export const ModalJurado: React.FC<Props> = ({ modo, item, onClose }) => {
  const paises = useAfiliacionesStore((s) => s.paises);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(() => juradoAFormulario(item, paises), [item, paises]);

  const { control, handleSubmit, formState, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaJurado as any),
  });
  const tipoActividad = watch('tipoActividad');
  const rol = watch('rol');
  const observaciones = watch('observaciones');

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarJurado(valores as FormularioJurado, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Jurados - tribunal cargado con éxito' : 'Jurados - tribunal editado con éxito');
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(
        mensajeDeErrorApi(
          error,
          nuevo ? 'Error al cargar la participación en jurados - tribunal' : 'Error al editar los jurados - tribunal',
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
          <FilaDato label="Tipo de actividad de evaluación" valor={item.tipoActividad?.label ?? ''} />
          {esValor(item.tipoActividad, 100000004) ? (
            <FilaDato label="Otro tipo de actividad" valor={item.otraActividad} />
          ) : null}
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha de fin" valor={aFechaVisible(item.fechaFin)} />
          <FilaDato label="Institución convocante de la evaluación" valor={item.institucion} />
          <FilaDato label="Rol" valor={item.rol?.label ?? ''} />
          {esValor(item.rol, 100000005) ? <FilaDato label="Otro rol" valor={item.otroRol} /> : null}
          <FilaDato label="País" valor={item.pais.label ?? ''} />
          <FilaDato label="Ciudad" valor={item.ciudad} />
          <FilaDato label="Observaciones" valor={item.observaciones} />
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
          name="tipoActividad"
          label="Tipo de actividad de evaluación"
          required
          options={TIPO_ACTIVIDAD_EVALUACION as any}
        />
        {esValor(tipoActividad, 100000004) ? (
          <FormTextField control={control} name="otraActividad" label="Otro tipo de actividad" required maximo={100} />
        ) : null}
        <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required />
        <FormDateField control={control} name="fechaFin" label="Fecha de fin" clearable />
        <FormTextField
          control={control}
          name="institucion"
          label="Institución convocante de la evaluación"
          required
          maximo={100}
        />
        <FormSelectField control={control} name="rol" label="Rol" required options={ROL_JURADO as any} />
        {esValor(rol, 100000005) ? (
          <FormTextField control={control} name="otroRol" label="Otro rol" required maximo={100} />
        ) : null}
        <FormSelectField control={control} name="pais" label="País" required options={paises as any} buscable />
        <FormTextField control={control} name="ciudad" label="Ciudad" required maximo={100} />
        <FormTextField
          control={control}
          name="observaciones"
          label="Observaciones"
          maximo={500}
          multiline
          numberOfLines={4}
          helperText={caracteresRestantes(observaciones, 500)}
        />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
