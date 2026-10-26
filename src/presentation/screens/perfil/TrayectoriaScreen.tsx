// Perfil > Trayectoria profesional. Port de Portal-Austral-Dev -> src/app/(dashboard)/perfil/trayectoria/page.tsx.
// Tarjeta con el link de LinkedIn y las cinco secciones con alta, edición y baja.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import {
  cargarTrayectoria,
  guardarLinkLinkedin,
  MSG_ERROR_CARGA_TRAYECTORIA,
} from '../../../application/perfil/trayectoriaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { AppButton } from '../../components/AppButton';
import { AppText } from '../../components/AppText';
import { FormTextField } from '../../components/form/FormTextField';
import { InfoAlert } from '../../components/InfoAlert';
import { SeccionesTrayectoria } from '../../components/perfil/SeccionesTrayectoria';
import { Screen } from '../../components/Screen';
import { useTrayectoriaStore } from '../../stores/trayectoriaStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, platformSpecific, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';

interface ValoresTrayectoria {
  linkLinkedin: string;
}

export const TrayectoriaScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const cargando = useTrayectoriaStore((s) => s.cargando);
  const cargado = useTrayectoriaStore((s) => s.cargado);
  const error = useTrayectoriaStore((s) => s.error);
  const empleado = useTrayectoriaStore((s) => s.empleado);
  const [guardando, setGuardando] = useState(false);

  const { control, handleSubmit, reset, formState } = useForm<ValoresTrayectoria>({
    mode: 'onChange',
    defaultValues: { linkLinkedin: '' },
  });

  const recargar = useCallback(() => {
    void cargarTrayectoria();
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // Cuando llega (o se actualiza) el empleado se vuelca el link en el formulario.
  useEffect(() => {
    if (empleado) reset({ linkLinkedin: empleado.linkLinkedin });
  }, [empleado, reset]);

  const guardar = handleSubmit(async (valores) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando…');
    try {
      const ok = await guardarLinkLinkedin(String(valores.linkLinkedin ?? ''));
      toast.dismiss(idToast);
      if (ok) toast.success('Datos guardados correctamente.');
      else toast.error('Ocurrió un error al guardar.');
    } catch (e) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(e, 'Ocurrió un error al guardar.'));
    } finally {
      setGuardando(false);
    }
  });

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
        Aquí podrá cargar y actualizar su trayectoria profesional.
      </AppText>

      {error ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">{MSG_ERROR_CARGA_TRAYECTORIA}</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={recargar} loading={cargando} />
        </View>
      ) : null}

      <View style={styles.tarjeta}>
        <FormTextField
          control={control}
          name="linkLinkedin"
          label="Link LinkedIn"
          helperText="URL de su perfil de LinkedIn"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!guardando && Boolean(empleado)}
        />
        <AppButton
          title="Guardar"
          onPress={guardar}
          loading={guardando}
          disabled={!formState.isDirty || !empleado}
        />
      </View>

      <SeccionesTrayectoria />
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
