// Port de Portal-Austral-Dev -> VacacionesPanel ("Progreso de Vacaciones") y COLUMNS_VACACIONES (columnsVacaciones.tsx):
// barra con gozados, solicitados y pendientes del período, los cuatro números de la grilla (días a gozar, solicitados,
// pendientes y gozados), días disponibles y el botón Solicitar cuando el período está abierto.
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { calcularProgreso } from '../../../domain/licencias/vacaciones';
import type { PeriodoVacaciones } from '../../../domain/licencias/tipos';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, platformSpecific, spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';

interface VacacionesPanelProps {
  periodo: PeriodoVacaciones;
  /** Si se informa, se muestra el botón "Solicitar". */
  onSolicitar?: () => void;
}

export const VacacionesPanel: React.FC<VacacionesPanelProps> = ({ periodo, onSolicitar }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const progreso = useMemo(() => calcularProgreso(periodo), [periodo]);

  const referencias = [
    { clave: 'gozados', texto: 'Gozados', valor: progreso.gozados, color: globalColors.success },
    { clave: 'solicitados', texto: 'Solicitados', valor: progreso.solicitados, color: globalColors.warning },
    { clave: 'pendientes', texto: 'Pendientes', valor: progreso.pendientes, color: globalColors.info },
  ];

  const numeros = [
    { clave: 'aGozar', texto: 'Días a gozar', valor: periodo.diasAGozar },
    { clave: 'solicitados', texto: 'Días solicitados', valor: periodo.diasSolicitados },
    { clave: 'pendientes', texto: 'Días pendientes', valor: periodo.diasPendientes },
    { clave: 'gozados', texto: 'Días gozados', valor: periodo.diasGozados },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.encabezado}>
        <View style={styles.titulos}>
          <AppText variant="subtitle2">{`Período ${periodo.periodo}`}</AppText>
          <AppText variant="caption" tone="secondary">
            {`Para gozar entre el ${periodo.fechaDesdePeriodo} y el ${periodo.fechaHastaPeriodo}`}
          </AppText>
        </View>
        <View style={styles.disponibles}>
          <AppText variant="h6">{String(periodo.diasPendientesTotales)}</AppText>
          <AppText variant="caption" tone="secondary">
            Disponibles
          </AppText>
        </View>
      </View>

      <View style={styles.numeros}>
        {numeros.map((n) => (
          <View key={n.clave} style={styles.numero}>
            <AppText variant="h6">{String(n.valor ?? 0)}</AppText>
            <AppText variant="caption" tone="secondary">
              {n.texto}
            </AppText>
          </View>
        ))}
      </View>

      <AppText variant="label">Progreso de Vacaciones</AppText>
      <View
        style={styles.barra}
        accessibilityRole="progressbar"
        accessibilityLabel={`Gozados ${progreso.gozados}, solicitados ${progreso.solicitados}, pendientes ${progreso.pendientes}`}
      >
        {progreso.hayTotal ? (
          <>
            <View style={{ width: `${progreso.porcentajeGozados}%`, backgroundColor: globalColors.success }} />
            <View style={{ width: `${progreso.porcentajeSolicitados}%`, backgroundColor: globalColors.warning }} />
            <View style={{ width: `${progreso.porcentajePendientes}%`, backgroundColor: globalColors.info }} />
          </>
        ) : null}
      </View>
      <View style={styles.referencias}>
        {referencias.map((r) => (
          <View key={r.clave} style={styles.referencia}>
            <View style={[styles.punto, { backgroundColor: r.color }]} />
            <AppText variant="caption">{`${r.texto}: ${r.valor}`}</AppText>
          </View>
        ))}
      </View>

      {onSolicitar ? <AppButton title="Solicitar" icon="add-circle-outline" onPress={onSolicitar} /> : null}
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
      gap: spacing.md,
      ...platformSpecific.shadow(1),
    },
    encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
    titulos: { flex: 1, gap: spacing.xxs },
    disponibles: { alignItems: 'center' },
    numeros: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    numero: {
      flexGrow: 1,
      flexBasis: '45%',
      backgroundColor: c.surfaceSecondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      gap: spacing.xxs,
    },
    barra: {
      flexDirection: 'row',
      height: 10,
      borderRadius: borderRadius.round,
      overflow: 'hidden',
      backgroundColor: c.surfaceSecondary,
    },
    referencias: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    referencia: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    punto: { width: 8, height: 8, borderRadius: borderRadius.round },
  });
