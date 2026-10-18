// Perfil > Gestión académica. Port de Portal-Austral-Dev -> src/app/(dashboard)/perfil/gestion-academica/page.tsx.
import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  cargarGestionAcademica,
  eliminarEncargo,
  eliminarExterno,
  MSG_ERROR_CARGA_GESTION,
} from '../../../application/perfil/gestionAcademicaService';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { cargoMayorDedicacion } from '../../../domain/perfil/gestionAcademica';
import { AppButton } from '../../components/AppButton';
import { AppText } from '../../components/AppText';
import { InfoAlert } from '../../components/InfoAlert';
import { FilaDato } from '../../components/legajo/FilaDato';
import { ModalCargoEncargoExterno } from '../../components/perfil/ModalCargoEncargoExterno';
import { ModalCargoGestion } from '../../components/perfil/ModalCargoGestion';
import { ModalEncargoGestion } from '../../components/perfil/ModalEncargoGestion';
import { SeccionRegistros } from '../../components/perfil/SeccionRegistros';
import { Screen } from '../../components/Screen';
import { SeccionCard } from '../../components/SeccionCard';
import { useGestionAcademicaStore } from '../../stores/gestionAcademicaStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { spacing } from '../../utils/responsive';

export const GestionAcademicaScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const cargos = useGestionAcademicaStore((s) => s.cargos);
  const encargos = useGestionAcademicaStore((s) => s.encargos);
  const externos = useGestionAcademicaStore((s) => s.externos);
  const cargando = useGestionAcademicaStore((s) => s.cargando);
  const cargado = useGestionAcademicaStore((s) => s.cargado);
  const error = useGestionAcademicaStore((s) => s.error);

  const recargar = useCallback(() => {
    void cargarGestionAcademica();
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
        <AppText variant="h5">Gestión académica</AppText>
        <AppText variant="body2" tone="secondary">
          Aquí podrá visualizar la información relacionada a la gestión académica.
        </AppText>
      </View>

      {error ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">{MSG_ERROR_CARGA_GESTION}</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={recargar} loading={cargando} />
        </View>
      ) : null}

      <SeccionCard numero={1} titulo="Gestión académica actual con mayor dedicación semanal">
        <FilaDato label="Cargo" valor={cargoMayorDedicacion(cargos)} />
      </SeccionCard>

      <SeccionRegistros
        numero={2}
        titulo="Cargos en gestión académica Austral"
        items={cargos}
        idDe={(c) => c.id}
        tituloDe={(c) => c.cargo || '—'}
        subtituloDe={(c) => c.unidadAcademica || undefined}
        lineasDe={(c) => [
          { label: 'Dedicación semanal en horas', valor: c.dedicacionSemanal },
          { label: 'Fecha de inicio', valor: aFechaVisible(c.fechaInicio) },
          { label: 'Fecha de finalización', valor: aFechaVisible(c.fechaFin) },
        ]}
        textoAgregar=""
        soloLectura
        textoVacio="No hay cargos en gestión académica."
        renderModal={({ item, onClose }) => <ModalCargoGestion item={item} onClose={onClose} />}
      />

      <SeccionRegistros
        numero={3}
        titulo="Encargos en gestión académica Austral"
        items={encargos}
        idDe={(e) => e.id}
        tituloDe={(e) => e.encargo || '—'}
        subtituloDe={(e) => e.tipo.map((t) => t.label).join(', ') || undefined}
        lineasDe={(e) => [
          { label: 'Unidad académica', valor: e.unidadAcademica.label ?? '' },
          { label: 'Propuesta formativa', valor: e.propuestaFormativa },
          { label: 'Dedicación semanal en horas', valor: e.dedicacionSemanal },
          { label: 'Fecha de inicio', valor: aFechaVisible(e.fechaInicio) },
          { label: 'Fecha de finalización', valor: aFechaVisible(e.fechaFin) },
        ]}
        textoAgregar="Agregar encargo"
        textoVacio="Todavía no cargaste encargos."
        sustantivoEliminar="este encargo"
        mensajes={{
          eliminando: 'Eliminando encargo...',
          eliminado: 'Encargo eliminado con éxito.',
          errorEliminar: 'Error al eliminar el encargo.',
        }}
        onEliminar={(e) => eliminarEncargo(e.id)}
        renderModal={({ modo, item, onClose }) => <ModalEncargoGestion modo={modo} item={item} onClose={onClose} />}
      />

      <SeccionRegistros
        numero={4}
        titulo="Cargos / encargos en gestión académica externos"
        items={externos}
        idDe={(x) => x.id}
        tituloDe={(x) => x.cargoEncargo || '—'}
        subtituloDe={(x) => x.institucion || undefined}
        lineasDe={(x) => [
          { label: 'País', valor: x.pais.label ?? '' },
          { label: 'Dedicación semanal en horas', valor: x.dedicacionSemanal },
          { label: 'Fecha de inicio', valor: aFechaVisible(x.fechaInicio) },
          { label: 'Estado', valor: x.estado.label ?? '' },
          { label: 'Fecha de finalización', valor: aFechaVisible(x.fechaFin) },
        ]}
        textoAgregar="Agregar cargo / encargo"
        textoVacio="Todavía no cargaste cargos o encargos externos."
        sustantivoEliminar="este cargo/encargo"
        mensajes={{
          eliminando: 'Eliminando cargo - encargo...',
          eliminado: 'Cargo - Encargo eliminado con éxito.',
          errorEliminar: 'Error al eliminar el cargo - encargo.',
        }}
        onEliminar={(x) => eliminarExterno(x.id)}
        renderModal={({ modo, item, onClose }) => (
          <ModalCargoEncargoExterno modo={modo} item={item} onClose={onClose} />
        )}
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
