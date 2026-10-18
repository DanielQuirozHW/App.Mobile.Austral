// Alta, edición y vista de una certificación / capacitación.
// Port de Portal-Austral-Dev -> perfil/_components/formacion/modales (certificaciones y capacitaciones).
import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarCertificacion } from '../../../application/perfil/formacionService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import {
  certificacionAFormulario,
  type Certificacion,
  type FormularioCertificacion,
} from '../../../domain/perfil/formacion';
import {
  EJES_FORMATIVOS,
  ESTADOS_CERTIFICACION,
  ESTADO_CERTIFICACION_FINALIZADO,
  ORIGENES_CERTIFICACION,
  ORIGEN_EXTERNA,
  ORIGEN_INTERNA,
  TIPOS_FORMACION_CERTIFICACION,
} from '../../../domain/perfil/formacionOpciones';
import { esquemaCertificacion } from '../../../domain/perfil/formacionValidacion';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, InfoAlert, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: Certificacion;
  onClose: () => void;
}

const TITULO = 'Certificación / Capacitación';
const SUB_NUEVO =
  'Agregá tus seminarios del programa de estudios humanísticos, las capacitaciones de la Dirección de Innovación Educativa, los cursos de formación que ofrece el VRII, entre otros';
const SUB_EDITAR = 'Modifica la información de la certificación / capacitación';

export const ModalCertificacion: React.FC<Props> = ({ modo, item, onClose }) => {
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';

  const { control, handleSubmit, watch, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: certificacionAFormulario(item),
    resolver: yupResolver(esquemaCertificacion as any),
  });

  const origen = Number(watch('tipoCapacitacion')?.value);
  const tipoFormacion = watch('tipoFormacion');
  const segmento = watch('segmento');
  const estado = Number(watch('estado')?.value);
  const externa = origen === ORIGEN_EXTERNA;
  const interna = origen === ORIGEN_INTERNA;
  const finalizado = estado === ESTADO_CERTIFICACION_FINALIZADO;

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Guardando…');
    try {
      await guardarCertificacion(valores as FormularioCertificacion, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Certificación/Capacitación cargada con éxito' : 'Certificación/Capacitación modificada con éxito');
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
          <FilaDato label="Origen de formación" valor={item.tipoCapacitacion.label} />
          <FilaDato label="Tipo de formación" valor={item.tipoFormacion.label} />
          {item.otroTipoFormacion ? <FilaDato label="Otro tipo de formación" valor={item.otroTipoFormacion} /> : null}
          <FilaDato label="Eje formativo" valor={item.segmento.label} />
          {item.otroSegmento ? <FilaDato label="Otro eje formativo" valor={item.otroSegmento} /> : null}
          <FilaDato label="Denominación" valor={item.denominacion} />
          {item.institucion ? <FilaDato label="Institución / organismo otorgante" valor={item.institucion} /> : null}
          {item.area ? <FilaDato label="Área capacitadora" valor={item.area} /> : null}
          {item.duracionMeses ? <FilaDato label="Duración (meses)" valor={item.duracionMeses} /> : null}
          {item.cargaHoraria ? <FilaDato label="Carga horaria" valor={item.cargaHoraria} /> : null}
          <FilaDato label="Estado" valor={item.estado.label} />
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha de obtención" valor={aFechaVisible(item.fechaObtencion)} />
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
        <InfoAlert tipo="info">Los seminarios del PEH se cargan aquí.</InfoAlert>
        <FormSelectField
          control={control}
          name="tipoCapacitacion"
          label="Origen de formación"
          required
          options={ORIGENES_CERTIFICACION as any}
        />
        <FormSelectField
          control={control}
          name="tipoFormacion"
          label="Tipo de formación"
          required
          options={TIPOS_FORMACION_CERTIFICACION as any}
        />
        {tipoFormacion?.label === 'Otro' ? (
          <FormTextField
            control={control}
            name="otroTipoFormacion"
            label="Otro tipo de formación"
            required
            maximo={200}
            mostrarContador
          />
        ) : null}
        <FormSelectField
          control={control}
          name="segmento"
          label="Eje formativo"
          required
          options={EJES_FORMATIVOS as any}
        />
        {segmento?.label === 'Otro' ? (
          <FormTextField control={control} name="otroSegmento" label="Otro eje formativo" maximo={200} mostrarContador />
        ) : null}
        <FormTextField
          control={control}
          name="denominacion"
          label="Denominación de la certificación / capacitación"
          required
          maximo={200}
          mostrarContador
        />
        {externa ? (
          <FormTextField
            control={control}
            name="institucion"
            label="Institución / organismo otorgante"
            required
            maximo={200}
            mostrarContador
          />
        ) : null}
        {interna ? (
          <FormTextField
            control={control}
            name="area"
            label="Área capacitadora"
            required
            maximo={200}
            mostrarContador
          />
        ) : null}
        {externa ? (
          <>
            <FormTextField
              control={control}
              name="duracionMeses"
              label="Duración (en meses)"
              required
              soloDigitos
              keyboardType="number-pad"
            />
            <FormTextField
              control={control}
              name="cargaHoraria"
              label="Carga horaria (en horas)"
              required
              soloDigitos
              keyboardType="number-pad"
            />
          </>
        ) : null}
        <FormSelectField
          control={control}
          name="estado"
          label="Estado"
          required
          options={ESTADOS_CERTIFICACION as any}
        />
        <FormDateField
          control={control}
          name="fechaInicio"
          label="Fecha de inicio"
          required
          maximumDate={new Date()}
        />
        {externa && finalizado ? (
          <FormDateField
            control={control}
            name="fechaObtencion"
            label="Fecha de obtención"
            required
            maximumDate={new Date()}
          />
        ) : null}
        {finalizado ? (
          <FormDateField
            control={control}
            name="fechaFin"
            label="Fecha de finalización"
            required={interna}
            maximumDate={new Date()}
          />
        ) : null}
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
