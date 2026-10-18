// Alta, edición y vista de un área de expertise - área de actuación.
// Port de Portal-Austral-Dev -> perfil/_components/formacion/modales (áreas de expertise): agrupador -> área -> actuación.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarAreaExpertise } from '../../../application/perfil/formacionService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import {
  areaExpertiseAFormulario,
  esOpcionOtras,
  type AreaExpertise,
  type FormularioAreaExpertise,
} from '../../../domain/perfil/formacion';
import { esquemaAreaExpertise } from '../../../domain/perfil/formacionValidacion';
import { useFormacionStore } from '../../stores/formacionStore';
import { toast } from '../../utils/toast';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: AreaExpertise;
  onClose: () => void;
}

const TITULO = 'Áreas de expertise - Áreas de Actuación';
const SUB_NUEVO = 'Agrega una nueva área de expertise - área de actuación';
const SUB_EDITAR = 'Modifica la información del área de expertise - área de actuación';

export const ModalAreaExpertise: React.FC<Props> = ({ modo, item, onClose }) => {
  const agrupadores = useFormacionStore((s) => s.agrupadores);
  const areasInteres = useFormacionStore((s) => s.areasInteres);
  const actuaciones = useFormacionStore((s) => s.actuaciones);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';

  const { control, handleSubmit, watch, setValue, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: areaExpertiseAFormulario(item),
    resolver: yupResolver(esquemaAreaExpertise as any),
  });

  const agrupador = watch('agrupador');
  const area = watch('area');
  const actuacion = watch('actuacion');

  const opcionesArea = useMemo(
    () => areasInteres.filter((a) => a.agrupador === agrupador?.value).map(({ value, label }) => ({ value, label })),
    [areasInteres, agrupador],
  );
  const opcionesActuacion = useMemo(
    () => actuaciones.filter((a) => a.areaId === area?.value).map(({ value, label }) => ({ value, label })),
    [actuaciones, area],
  );

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Guardando…');
    try {
      const datos = valores as FormularioAreaExpertise;
      // Si la opción no es "otras", el texto libre no corresponde.
      await guardarAreaExpertise(
        {
          ...datos,
          otraArea: esOpcionOtras(datos.area) ? datos.otraArea : '',
          otraActuacion: esOpcionOtras(datos.actuacion) ? datos.otraActuacion : '',
        },
        nuevo ? undefined : item?.id,
      );
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Área cargada con éxito' : 'Área de Expertise modificada con éxito');
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
          <FilaDato label="Agrupador" valor={item.agrupador.label} />
          <FilaDato label="Área de Interés" valor={item.area.label} />
          {item.otraArea ? <FilaDato label="Otra área de expertise" valor={item.otraArea} /> : null}
          <FilaDato label="Actuación" valor={item.actuacion.label} />
          {item.otraActuacion ? <FilaDato label="Otra área de actuación" valor={item.otraActuacion} /> : null}
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
          name="agrupador"
          label="Agrupador"
          required
          options={agrupadores as any}
          onCambio={() => {
            setValue('area', null, { shouldDirty: true });
            setValue('otraArea', '', { shouldDirty: true });
            setValue('actuacion', null, { shouldDirty: true });
            setValue('otraActuacion', '', { shouldDirty: true });
          }}
        />
        <FormSelectField
          control={control}
          name="area"
          label="Área de Interés"
          required
          disabled={!agrupador}
          options={opcionesArea as any}
          buscable
          onCambio={() => {
            setValue('actuacion', null, { shouldDirty: true });
            setValue('otraActuacion', '', { shouldDirty: true });
          }}
        />
        {esOpcionOtras(area) ? (
          <FormTextField control={control} name="otraArea" label="Otra área (especifique)" required />
        ) : null}
        <FormSelectField
          control={control}
          name="actuacion"
          label="Actuación"
          required
          disabled={!area}
          options={opcionesActuacion as any}
          buscable
        />
        {esOpcionOtras(actuacion) ? (
          <FormTextField control={control} name="otraActuacion" label="Otra actuación (especifique)" required />
        ) : null}
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
