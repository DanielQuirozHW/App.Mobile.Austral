// Alta, edición y vista de una participación en jornadas, congresos y eventos. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/resultados-impacto-i+d/participacion/modales/ModalParticipacion.tsx
// (+ hooks/investigacion-perfil/useCargarEditarParticipacionJornadas.ts).
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarJornada } from '../../../application/perfil/resultadosService';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import {
  esquemaJornada,
  jornadaActividadEsOtro,
  jornadaAFormulario,
  jornadaParticipacionEsOtro,
  TIPO_ACTIVIDAD_JORNADA,
  TIPO_PARTICIPACION_JORNADA,
  type FormularioJornada,
  type Jornada,
} from '../../../domain/perfil/resultados';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: Jornada;
  onClose: () => void;
}

const TITULO = 'Participación en eventos científicos';
const SUB = 'Información de participación en eventos científicos';

export const ModalJornada: React.FC<Props> = ({ modo, item, onClose }) => {
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(() => jornadaAFormulario(item), [item]);

  const { control, handleSubmit, formState, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaJornada as any),
  });
  const tipoActividad = watch('tipoActividad');
  const tipoParticipacion = watch('tipoParticipacion');

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarJornada(valores as FormularioJornada, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(
        nuevo ? 'Participación en jornadas cargada con éxito' : 'Participación en jornadas editada con éxito',
      );
      onClose();
    } catch {
      toast.dismiss(idToast);
      toast.error(
        nuevo ? 'Error al cargar la participación en jornadas' : 'Error al editar la participación en jornadas',
      );
    } finally {
      setGuardando(false);
    }
  });

  if (modo === 'ver' && item) {
    return (
      <ModalPerfil modo="ver" titulo={TITULO} subtituloNuevo={SUB} subtituloEditar={SUB} onClose={onClose}>
        <View style={{ gap: 8 }}>
          <FilaDato label="Nombre" valor={item.nombre} />
          <FilaDato label="Tipo de actividad" valor={item.tipoActividad?.label ?? ''} />
          {jornadaActividadEsOtro(item.tipoActividad) ? (
            <FilaDato label="Otro tipo de actividad" valor={item.otraActividad} />
          ) : null}
          <FilaDato label="Lugar" valor={item.lugar} />
          <FilaDato label="Tipo de participación" valor={item.tipoParticipacion?.label ?? ''} />
          {jornadaParticipacionEsOtro(item.tipoParticipacion) ? (
            <FilaDato label="Otro tipo de participación" valor={item.otraParticipacion} />
          ) : null}
          <FilaDato label="Fecha" valor={aFechaVisible(item.fecha)} />
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
        <FormTextField control={control} name="nombre" label="Nombre" required maximo={100} />
        <FormSelectField
          control={control}
          name="tipoActividad"
          label="Tipo de actividad"
          required
          options={TIPO_ACTIVIDAD_JORNADA as any}
        />
        {jornadaActividadEsOtro(tipoActividad) ? (
          <FormTextField control={control} name="otraActividad" label="Otro tipo de actividad" required maximo={100} />
        ) : null}
        <FormTextField control={control} name="lugar" label="Lugar" required maximo={100} />
        <FormSelectField
          control={control}
          name="tipoParticipacion"
          label="Tipo de participación"
          required
          options={TIPO_PARTICIPACION_JORNADA as any}
        />
        {jornadaParticipacionEsOtro(tipoParticipacion) ? (
          <FormTextField
            control={control}
            name="otraParticipacion"
            label="Otro tipo de participación"
            required
            maximo={100}
          />
        ) : null}
        <FormDateField control={control} name="fecha" label="Fecha" required />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
