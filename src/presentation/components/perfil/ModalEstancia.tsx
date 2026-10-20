// Alta, edición y vista de una estancia. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/resultados-impacto-i+d/estancias/modales/ModalEstancias.tsx
// (+ hooks/investigacion-perfil/useCargarEditarFormacionEstancias.ts).
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarEstancia } from '../../../application/perfil/resultadosService';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import {
  esquemaEstancia,
  estanciaAFormulario,
  estanciaEsOtros,
  TIPO_ACTIVIDAD_ESTANCIA,
  type Estancia,
  type FormularioEstancia,
} from '../../../domain/perfil/resultados';
import { useResultadosStore } from '../../stores/resultadosStore';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: Estancia;
  onClose: () => void;
}

const TITULO = 'Estancias';
const SUB = 'Información de estancias';

export const ModalEstancia: React.FC<Props> = ({ modo, item, onClose }) => {
  const paises = useResultadosStore((s) => s.paises);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(() => estanciaAFormulario(item, paises), [item, paises]);

  const { control, handleSubmit, formState, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaEstancia as any),
  });
  const tipoActividad = watch('tipoActividad');

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarEstancia(valores as FormularioEstancia, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Estancia cargada con éxito' : 'Estancia editada con éxito');
      onClose();
    } catch {
      toast.dismiss(idToast);
      toast.error(nuevo ? 'Error al cargar la estancia' : 'Error al editar la estancia');
    } finally {
      setGuardando(false);
    }
  });

  if (modo === 'ver' && item) {
    return (
      <ModalPerfil modo="ver" titulo={TITULO} subtituloNuevo={SUB} subtituloEditar={SUB} onClose={onClose}>
        <View style={{ gap: 8 }}>
          <FilaDato label="Tipo de actividad realizada" valor={item.tipoActividad?.label ?? ''} />
          {estanciaEsOtros(item.tipoActividad) ? <FilaDato label="Otro" valor={item.otraActividad} /> : null}
          <FilaDato label="Institución" valor={item.institucion} />
          <FilaDato label="País" valor={item.pais.label ?? ''} />
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
          label="Tipo de actividad realizada"
          options={TIPO_ACTIVIDAD_ESTANCIA as any}
        />
        {estanciaEsOtros(tipoActividad) ? (
          <FormTextField control={control} name="otraActividad" label="Otro" required maximo={100} />
        ) : null}
        <FormTextField control={control} name="institucion" label="Institución" required maximo={100} />
        <FormSelectField control={control} name="pais" label="País" required options={paises as any} buscable />
        <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required />
        <FormDateField control={control} name="fechaFin" label="Fecha de fin" clearable />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
