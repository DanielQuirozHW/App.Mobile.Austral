// Alta, edición y vista de una especialidad certificada por organismo/s de salud.
// Port de Portal-Austral-Dev -> perfil/_components/formacion/modales (especialidad certificada).
import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarEspecialidad } from '../../../application/perfil/formacionService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { opcionesDeAnios } from '../../../domain/perfil/comun';
import { especialidadAFormulario, type Especialidad, type FormularioEspecialidad } from '../../../domain/perfil/formacion';
import {
  AYUDA_FECHA_MANUAL,
  ESPECIALIDADES,
  ESPECIALIDAD_OTRA,
  ESTADOS_ESPECIALIDAD,
  ESTADO_FINALIZADO,
  TIPOS_FORMACION_ESPECIALIDAD,
  TIPO_FORMACION_ESPECIALIDAD_OTRO,
} from '../../../domain/perfil/formacionOpciones';
import { esquemaEspecialidad } from '../../../domain/perfil/formacionValidacion';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, InfoAlert, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: Especialidad;
  onClose: () => void;
}

const SUB_NUEVO = 'Agrega una nueva especialidad certificada por organismo/s de salud';
const SUB_EDITAR = 'Modifica la información de la especialidad certificada por organismo/s de salud';
const TITULO = 'Especialidad certificada por organismo/s de salud';
const OPCIONES_ANIOS = opcionesDeAnios();

export const ModalEspecialidad: React.FC<Props> = ({ modo, item, onClose }) => {
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';

  const { control, handleSubmit, watch, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: especialidadAFormulario(item),
    resolver: yupResolver(esquemaEspecialidad as any),
  });

  const tipoFormacion = watch('tipoFormacion');
  const especialidad = watch('especialidad');
  const estado = watch('estado');
  const finalizado = Number(estado?.value) === ESTADO_FINALIZADO;

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading(nuevo ? 'Guardando…' : 'Guardando los cambios…');
    try {
      await guardarEspecialidad(valores as FormularioEspecialidad, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Especialidad cargada con éxito' : 'Especialidad modificada con éxito');
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
          <FilaDato label="Tipo de formación incluída" valor={item.tipoFormacion.label} />
          {item.otroTipoFormacion ? <FilaDato label="Otro tipo de formación" valor={item.otroTipoFormacion} /> : null}
          <FilaDato label="Especialidad" valor={item.especialidad.label} />
          {item.otraEspecialidad ? <FilaDato label="Otra especialidad" valor={item.otraEspecialidad} /> : null}
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha de fin" valor={aFechaVisible(item.fechaFin)} />
          <FilaDato label="Estado" valor={item.estado.label} />
          <FilaDato label="Año de obtención" valor={item.anioObtencion} />
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
        <FormSelectField
          control={control}
          name="tipoFormacion"
          label="Tipo de formación incluída"
          required
          options={TIPOS_FORMACION_ESPECIALIDAD as any}
        />
        {Number(tipoFormacion?.value) === TIPO_FORMACION_ESPECIALIDAD_OTRO ? (
          <FormTextField
            control={control}
            name="otroTipoFormacion"
            label="Otro (especifique)"
            required
            maximo={200}
            mostrarContador
          />
        ) : null}
        <FormSelectField
          control={control}
          name="especialidad"
          label="Especialidad"
          required
          options={ESPECIALIDADES as any}
          buscable
        />
        {Number(especialidad?.value) === ESPECIALIDAD_OTRA ? (
          <FormTextField
            control={control}
            name="otraEspecialidad"
            label="Otra (especifique)"
            required
            maximo={200}
            mostrarContador
          />
        ) : null}
        <InfoAlert tipo="info">{AYUDA_FECHA_MANUAL}</InfoAlert>
        <FormDateField
          control={control}
          name="fechaInicio"
          label="Fecha de inicio:"
          required
          maximumDate={new Date()}
        />
        <FormSelectField
          control={control}
          name="estado"
          label="Estado"
          required
          options={ESTADOS_ESPECIALIDAD as any}
        />
        {finalizado ? (
          <>
            <FormDateField
              control={control}
              name="fechaFin"
              label="Fecha de fin:"
              required
              maximumDate={new Date()}
            />
            <FormSelectField
              control={control}
              name="anioObtencion"
              label="Año de obtención de la última certificación"
              required
              options={OPCIONES_ANIOS as any}
              buscable
            />
          </>
        ) : null}
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
