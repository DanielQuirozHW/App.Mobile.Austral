// Perfil > Extensión. Port de Portal-Austral-Dev -> src/app/(dashboard)/perfil/extension/page.tsx.
import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { cargarExtension, eliminarActividadExtension, MSG_ERROR_CARGA_EXTENSION } from '../../../application/perfil/extensionService';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { AppButton } from '../../components/AppButton';
import { AppText } from '../../components/AppText';
import { InfoAlert } from '../../components/InfoAlert';
import { ModalExtension } from '../../components/perfil/ModalExtension';
import { SeccionRegistros } from '../../components/perfil/SeccionRegistros';
import { Screen } from '../../components/Screen';
import { useExtensionStore } from '../../stores/extensionStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { spacing } from '../../utils/responsive';

export const ExtensionScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const actividades = useExtensionStore((s) => s.actividades);
  const cargando = useExtensionStore((s) => s.cargando);
  const cargado = useExtensionStore((s) => s.cargado);
  const error = useExtensionStore((s) => s.error);

  const recargar = useCallback(() => {
    void cargarExtension();
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  if (!cargado && cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={globalColors.accentPrimary} />
      </View>
    );
  }

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      <View style={styles.titulos}>
        <AppText variant="h5">Extensión</AppText>
        <AppText variant="body2" tone="secondary">
          Aquí podrá cargar y actualizar la información relacionada a sus actividades de extensión.
        </AppText>
      </View>

      {error ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">{MSG_ERROR_CARGA_EXTENSION}</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={recargar} loading={cargando} />
        </View>
      ) : null}

      <SeccionRegistros
        numero={1}
        titulo="Actividades de extensión"
        items={actividades}
        idDe={(a) => a.id}
        tituloDe={(a) => a.actividad || '—'}
        subtituloDe={(a) => a.unidadAcademica.label ?? undefined}
        lineasDe={(a) => [
          { label: 'Dedicación horaria anual', valor: a.dedicacion },
          { label: 'Fecha de inicio', valor: aFechaVisible(a.fechaInicio) },
          { label: 'Fecha de fin', valor: aFechaVisible(a.fechaFin) },
        ]}
        textoAgregar="Agregar actividad"
        textoVacio="Todavía no cargaste actividades de extensión."
        sustantivoEliminar="esta actividad de extensión"
        mensajes={{
          eliminando: 'Eliminando actividad...',
          eliminado: 'Actividad eliminada con éxito.',
          errorEliminar: 'Error al eliminar la actividad.',
        }}
        onEliminar={(a) => eliminarActividadExtension(a.id)}
        renderModal={({ modo, item, onClose }) => <ModalExtension modo={modo} item={item} onClose={onClose} />}
      />
    </Screen>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
    contenido: { padding: spacing.lg, gap: spacing.lg },
    titulos: { gap: spacing.xs },
    aviso: { gap: spacing.sm },
  });
