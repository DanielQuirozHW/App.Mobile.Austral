// Alta, edición y vista de un asesoramiento académico. Port de Portal-Austral-Dev ->
// perfil/_components/docencia/asesoramiento/ModalAsesoramiento.tsx.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarAsesoramiento } from '../../../application/perfil/docenciaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import {
  asesoramientoAFormulario,
  esquemaAsesoramiento,
  type Asesoramiento,
  type FormularioAsesoramiento,
} from '../../../domain/perfil/docencia';
import { useDocenciaStore } from '../../stores/docenciaStore';
import { toast } from '../../utils/toast';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: Asesoramiento;
  onClose: () => void;
}

const TITULO = 'Asesoramiento Académico Personalizado';
const SUB_NUEVO = 'Información de la asesoría académica';
const SUB_EDITAR = 'Información de la asesoría académica';

export const ModalAsesoramiento: React.FC<Props> = ({ modo, item, onClose }) => {
  const unidades = useDocenciaStore((s) => s.unidades);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(() => asesoramientoAFormulario(item, unidades), [item, unidades]);

  const { control, handleSubmit, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaAsesoramiento as any),
  });

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarAsesoramiento(valores as FormularioAsesoramiento, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(
        nuevo ? 'Asesoramiento académico cargado con éxito' : 'Asesoramiento académico modificado con éxito',
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
          <FilaDato label="Cantidad alumnos asignados" valor={item.cantidadAlumnos} />
          <FilaDato label="Año" valor={item.anio} />
          <FilaDato label="Unidad Académica / Facultad" valor={item.unidadAcademica.label ?? ''} />
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
          name="cantidadAlumnos"
          label="Cantidad alumnos asignados"
          required
          soloDigitos
          maximo={3}
          keyboardType="number-pad"
        />
        <FormTextField
          control={control}
          name="anio"
          label="Año"
          required
          soloDigitos
          maximo={4}
          keyboardType="number-pad"
        />
        <FormSelectField
          control={control}
          name="unidadAcademica"
          label="Unidad Académica / Facultad"
          required
          options={unidades as any}
          buscable
        />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
