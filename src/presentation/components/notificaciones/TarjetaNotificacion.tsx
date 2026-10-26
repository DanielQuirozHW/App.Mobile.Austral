// Fila de la grilla de /notificaciones, adaptada al celular como tarjeta.
// Port de Portal-Austral-Dev -> src/columns/columnsNotificaciones.tsx: acciones (Ir, Marcar como leída), estado, título,
// descripción, módulo, tipo (CRM) y fecha.
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { FilaNotificacion } from '../../../domain/notificaciones/notificaciones';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, platformSpecific, spacing } from '../../utils/responsive';
import { AccionIcono } from '../AccionIcono';
import { AppText } from '../AppText';
import { EstadoChip } from '../licencias/EstadoChip';

interface TarjetaNotificacionProps {
  fila: FilaNotificacion;
  /** true mientras se marca esta notificación. */
  marcando: boolean;
  onIr: (fila: FilaNotificacion) => void;
  onMarcarLeida: (fila: FilaNotificacion) => void;
}

export const TarjetaNotificacion: React.FC<TarjetaNotificacionProps> = ({ fila, marcando, onIr, onMarcarLeida }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  return (
    <View style={styles.card}>
      <View style={styles.encabezado}>
        <EstadoChip texto={fila.estado} />
        <AppText variant="caption" tone="secondary">
          {fila.createdAt ?? '—'}
        </AppText>
      </View>

      <AppText variant="subtitle2" style={styles.titulo}>
        {fila.title}
      </AppText>
      {fila.description ? (
        <AppText variant="body2" tone="secondary">
          {fila.description}
        </AppText>
      ) : null}

      <View style={styles.meta}>
        <View style={styles.dato}>
          <AppText variant="caption" tone="secondary">
            Módulo
          </AppText>
          <AppText variant="body2" style={styles.valor}>
            {fila.modulo}
          </AppText>
        </View>
        <View style={styles.dato}>
          <AppText variant="caption" tone="secondary">
            Tipo (CRM)
          </AppText>
          <AppText variant="body2" style={styles.valor}>
            {fila.type || '—'}
          </AppText>
        </View>
      </View>

      <View style={styles.acciones}>
        <AccionIcono icono="arrow-forward-outline" etiqueta="Ir" onPress={() => onIr(fila)} />
        {fila.pendiente ? (
          marcando ? (
            <View style={styles.cargando}>
              <ActivityIndicator size="small" color={globalColors.accentPrimary} />
            </View>
          ) : (
            <AccionIcono icono="checkmark-outline" etiqueta="Marcar como leída" onPress={() => onMarcarLeida(fila)} />
          )
        ) : null}
      </View>
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
      gap: spacing.sm,
      ...platformSpecific.shadow(1),
    },
    encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    titulo: { fontWeight: '600' },
    meta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: spacing.md,
      columnGap: spacing.lg,
      backgroundColor: c.surfaceSecondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
    },
    dato: { minWidth: '40%', flexGrow: 1, gap: spacing.xxs },
    valor: { fontWeight: '500' },
    acciones: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    cargando: {
      minWidth: platformSpecific.minTouchTarget,
      minHeight: platformSpecific.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
