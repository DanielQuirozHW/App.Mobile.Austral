// Formulario de perfiles de investigación (ORCID, Google Scholar, Research Gate y líneas prioritarias de la UA).
// Port de Portal-Austral-Dev -> perfil/investigacion/perfil/perfiles/page.tsx.
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarPerfil } from '../../../application/perfil/afiliacionesService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import {
  esquemaPerfil,
  esValor,
  LINEAS_PRIORITARIAS_UA,
  perfilAFormulario,
  SI_NO_NUM,
  type FormularioPerfil,
} from '../../../domain/perfil/afiliaciones';
import { useAfiliacionesStore } from '../../stores/afiliacionesStore';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AppButton } from '../AppButton';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { Campos, PieObligatorios } from './CamposComunes';

export const FormInvPerfil: React.FC = () => {
  const perfil = useAfiliacionesStore((s) => s.perfil);
  const [guardando, setGuardando] = useState(false);
  const valores = useMemo(() => perfilAFormulario(perfil), [perfil]);

  const { control, handleSubmit, formState, reset, setValue, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: valores,
    resolver: yupResolver(esquemaPerfil as any),
  });

  // Al recargar el perfil (por ejemplo después de guardar) el formulario vuelve a quedar sin cambios.
  useEffect(() => {
    reset(valores);
  }, [valores, reset]);

  const lineasUA = watch('lineasUA');

  const guardar = handleSubmit(async (v: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarPerfil(v as FormularioPerfil);
      toast.dismiss(idToast);
      toast.success('Perfil cargado con éxito');
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(error, 'Error al cargar el perfil'));
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
        <FormTextField control={control} name="orcid" label="ORCID" autoCapitalize="none" />
        <FormTextField control={control} name="googleScholar" label="Google Scholar" autoCapitalize="none" />
        <FormTextField control={control} name="researchGate" label="Research Gate" autoCapitalize="none" />
        <FormSelectField
          control={control}
          name="lineasUA"
          label="¿Está directamente relacionado con alguna de las líneas prioritarias de investigación de la UA?"
          required
          options={SI_NO_NUM as any}
          onCambio={(op: any) => {
            if (String(op?.value) !== '1') setValue('linea', null, { shouldDirty: true });
          }}
        />
        {esValor(lineasUA, 1) ? (
          <FormSelectField
            control={control}
            name="linea"
            label="Línea de Investigación"
            required
            options={LINEAS_PRIORITARIAS_UA as any}
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
