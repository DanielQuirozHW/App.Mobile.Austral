// Perfil > Formación. Port de Portal-Austral-Dev -> src/app/(dashboard)/perfil/formacion/page.tsx.
// Tarjeta superior (máximo nivel de formación y título de educación básica) y las siete secciones con alta, edición y baja.
import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import {
  cargarFormacion,
  guardarEducacionBasica,
  MSG_ERROR_CARGA_FORMACION,
} from '../../../application/perfil/formacionService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { opcionDeLista } from '../../../domain/perfil/comun';
import { calcularNivelMaximo } from '../../../domain/perfil/formacion';
import { EDUCACION_BASICA } from '../../../domain/perfil/formacionOpciones';
import { AppButton } from '../../components/AppButton';
import { AppText } from '../../components/AppText';
import { FormSelectField } from '../../components/form/FormSelectField';
import { InfoAlert } from '../../components/InfoAlert';
import { FilaDato } from '../../components/legajo/FilaDato';
import { SeccionesFormacion } from '../../components/perfil/SeccionesFormacion';
import { Screen } from '../../components/Screen';
import { useFormacionStore } from '../../stores/formacionStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, platformSpecific, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';

export const FormacionScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const cargando = useFormacionStore((s) => s.cargando);
  const cargado = useFormacionStore((s) => s.cargado);
  const error = useFormacionStore((s) => s.error);
  const empleado = useFormacionStore((s) => s.empleado);
  const pregrado = useFormacionStore((s) => s.pregrado);
  const posgrado = useFormacionStore((s) => s.posgrado);

  const [guardando, setGuardando] = React.useState(false);
  const { control, handleSubmit, reset, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: { educacionBasica: null },
  });

  const recargar = useCallback(() => {
    void cargarFormacion();
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // Cuando llega (o se actualiza) el empleado se vuelca el nivel básico en el formulario.
  useEffect(() => {
    if (empleado) reset({ educacionBasica: opcionDeLista(empleado.educacionBasica?.value, EDUCACION_BASICA) });
  }, [empleado, reset]);

  const nivelMaximo = useMemo(
    () => calcularNivelMaximo([...pregrado, ...posgrado], empleado?.educacionBasica ?? null),
    [pregrado, posgrado, empleado],
  );

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Guardando los cambios…');
    try {
      const ok = await guardarEducacionBasica(valores.educacionBasica, (mensaje) => {
        toast.dismiss(idToast);
        toast.loading(mensaje);
      });
      toast.dismiss();
      if (ok) toast.success('Datos guardados correctamente.');
      else toast.error('Ocurrió un error al guardar.');
    } catch (e) {
      toast.dismiss();
      toast.error(mensajeDeErrorApi(e, 'Ocurrió un error al guardar.'));
    } finally {
      setGuardando(false);
    }
  });

  // Primera carga sin datos todavía.
  if (!cargado && cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={globalColors.accentPrimary} />
      </View>
    );
  }

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      {/* El título lo muestra el encabezado de la navegación: acá solo la bajada del portal. */}
      <AppText variant="body2" tone="secondary">
        Aquí podrá cargar y actualizar su formación académica.
      </AppText>

      {error ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">{MSG_ERROR_CARGA_FORMACION}</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={recargar} loading={cargando} />
        </View>
      ) : null}

      <View style={styles.tarjeta}>
        <FilaDato label="Máximo Nivel de Formación" valor={nivelMaximo.label} />
        <FormSelectField
          control={control}
          name="educacionBasica"
          label="Título de Educación Básica"
          options={EDUCACION_BASICA as any}
          disabled={guardando || !empleado}
        />
        <AppButton
          title="Guardar"
          onPress={guardar}
          loading={guardando}
          disabled={!formState.isDirty || !empleado}
        />
      </View>

      <SeccionesFormacion />
    </Screen>
  );
};

// El margen de la pantalla ya lo pone Screen: acá solo el espacio entre bloques.
const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
    contenido: { gap: spacing.lg, paddingBottom: spacing.xxxl },
    aviso: { gap: spacing.sm },
    tarjeta: {
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
      gap: spacing.md,
      ...platformSpecific.shadow(2),
    },
  });
