// Alta, edición y vista de una pertenencia a un centro de investigación / HUA. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/perfil/pertenencia/modales/ModalPertenencia.tsx.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarPertenencia } from '../../../application/perfil/afiliacionesService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import {
  esquemaPertenencia,
  esValor,
  etiquetaDePertenencia,
  pertenenciaAFormulario,
  SI_NO_NUM,
  type FormularioPertenencia,
  type Pertenencia,
} from '../../../domain/perfil/afiliaciones';
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
  item?: Pertenencia;
  onClose: () => void;
}

const TITULO = 'Pertenencia a un centro de investigación / HUA';
const SUB_NUEVO = 'Información de la pertenencia';
const SUB_EDITAR = 'Editar información de la pertenencia';

export const ModalPertenencia: React.FC<Props> = ({ modo, item, onClose }) => {
  const catalogo = useAfiliacionesStore((s) => s.catalogoPertenencias);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(() => pertenenciaAFormulario(item, catalogo), [item, catalogo]);

  const { control, handleSubmit, formState, setValue, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaPertenencia as any),
  });
  const centro = watch('centro');

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarPertenencia(valores as FormularioPertenencia, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Pertenencia HUA cargado con éxito' : 'Pertenencia HUA editado con éxito');
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(error, nuevo ? 'Error al cargar Pertenencia HUA' : 'Error al editar Pertenencia HUA'));
    } finally {
      setGuardando(false);
    }
  });

  if (modo === 'ver' && item) {
    return (
      <ModalPerfil modo="ver" titulo={TITULO} subtituloNuevo={SUB_NUEVO} subtituloEditar={SUB_EDITAR} onClose={onClose}>
        <View style={{ gap: 8 }}>
          <FilaDato
            label="Pertenencia a un centro / instituto de investigación / HUA de la UA"
            valor={item.centro?.label ?? ''}
          />
          <FilaDato label="Pertenencia" valor={etiquetaDePertenencia(item)} />
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha fin" valor={aFechaVisible(item.fechaFin)} />
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
          name="centro"
          label="Pertenencia a un centro / instituto de investigación / HUA de la UA"
          required
          options={SI_NO_NUM as any}
          onCambio={(op: any) => {
            if (!op) return;
            if (String(op.value) === '0') setValue('pertenencia', null, { shouldDirty: true });
            else setValue('pertenenciaTexto', '', { shouldDirty: true });
          }}
        />
        {esValor(centro, 1) ? (
          <FormSelectField
            control={control}
            name="pertenencia"
            label="Pertenencia"
            required
            options={catalogo as any}
            buscable
          />
        ) : null}
        {esValor(centro, 0) ? (
          <FormTextField control={control} name="pertenenciaTexto" label="Pertenencia" required maximo={99} mostrarContador />
        ) : null}
        <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required />
        <FormDateField control={control} name="fechaFin" label="Fecha fin" clearable />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
