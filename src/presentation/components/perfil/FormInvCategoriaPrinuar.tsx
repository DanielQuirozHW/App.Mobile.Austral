// Formulario de la categorización PRINUAR vigente.
// Port de Portal-Austral-Dev -> perfil/investigacion/perfil/categorizacion-externa/page.tsx (formulario Prinuar).
// Con una categoría ya cargada el portal bloquea todo salvo la fecha de fin.
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarCategorizacionPrinuar } from '../../../application/perfil/afiliacionesService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import {
  CATEGORIAS_PRINUAR,
  esOtra,
  esquemaPrinuar,
  lugaresPrinuar,
  prinuarAFormulario,
  SI_NO_NUM,
  tieneValor,
  type FormularioPrinuar,
} from '../../../domain/perfil/afiliaciones';
import { useAfiliacionesStore } from '../../stores/afiliacionesStore';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AppButton } from '../AppButton';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { Campos, PieObligatorios } from './CamposComunes';

export const FormInvCategoriaPrinuar: React.FC = () => {
  const prinuar = useAfiliacionesStore((s) => s.prinuar);
  const unidades = useAfiliacionesStore((s) => s.unidades);
  const instituciones = useAfiliacionesStore((s) => s.instituciones);
  const [guardando, setGuardando] = useState(false);

  const valores = useMemo(
    () => prinuarAFormulario(prinuar, unidades, instituciones),
    [prinuar, unidades, instituciones],
  );
  const cargada = tieneValor(valores.categoria);
  const resolver = useMemo(() => yupResolver(esquemaPrinuar(cargada) as any), [cargada]);

  const { control, handleSubmit, formState, reset, setValue, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: valores,
    resolver,
  });

  useEffect(() => {
    reset(valores);
  }, [valores, reset]);

  const ua = watch('ua');
  const lugar = watch('lugar');
  const lugares = lugaresPrinuar(ua, unidades, instituciones);

  const guardar = handleSubmit(async (v: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarCategorizacionPrinuar(v as FormularioPrinuar);
      toast.dismiss(idToast);
      toast.success('Categorizaciones guardadas con éxito');
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(error, 'Error al guardar categorizaciones'));
    } finally {
      setGuardando(false);
    }
  });

  const alGuardar = () => {
    if (!formState.isDirty) {
      toast.error('No hay cambios para guardar');
      return;
    }
    void guardar();
  };

  return (
    <View style={styles.contenedor}>
      <Campos>
        <FormSelectField
          control={control}
          name="ua"
          label="Lugar de trabajo Universidad Austral Prinuar"
          required
          options={SI_NO_NUM as any}
          disabled={cargada}
          onCambio={() => {
            setValue('lugar', null, { shouldDirty: true });
            setValue('otroLugar', '', { shouldDirty: true });
          }}
        />
        <FormSelectField
          control={control}
          name="categoria"
          label="Categoría investigador Prinuar"
          required
          options={CATEGORIAS_PRINUAR as any}
          disabled={cargada}
        />
        <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required disabled={cargada} />
        {/* Con una categoría cargada es lo único que se puede editar. */}
        <FormDateField control={control} name="fechaFin" label="Fecha de fin" clearable />
        <FormSelectField
          control={control}
          name="lugar"
          label="Lugar de trabajo Prinuar"
          required
          options={lugares as any}
          buscable
          disabled={cargada}
          onCambio={() => setValue('otroLugar', '', { shouldDirty: true })}
        />
        {esOtra(lugar) ? (
          <FormTextField
            control={control}
            name="otroLugar"
            label="Otro lugar de trabajo"
            required
            maximo={100}
            editable={!cargada}
          />
        ) : null}
        <PieObligatorios />
      </Campos>
      <AppButton title={guardando ? 'Guardando...' : 'Guardar'} onPress={alGuardar} loading={guardando} />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { gap: spacing.lg },
});
