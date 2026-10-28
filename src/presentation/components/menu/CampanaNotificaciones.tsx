// Campana de notificaciones con la cantidad de pendientes. Equivale al NotificationDropdown del encabezado del portal
// (insignia con los pendientes, tope "99"; "Ver todas las notificaciones" lleva a /notificaciones). En el celular la campana
// lleva directo a la pantalla Notificaciones, que tiene las pestañas Pendientes / Completadas y las acciones Ir y
// "Marcar como leída". Va en el encabezado de todas las pantallas. Comparte la consulta con el resto de la app (no pide
// la lista de nuevo por cada campana).
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNotificaciones } from '../../hooks/useNotificaciones';
import { irAModulo } from '../../navigation/navigationRef';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';

export const CampanaNotificaciones: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const { pendientes } = useNotificaciones();
  const cantidad = pendientes.length;

  return (
    <Pressable
      onPress={() => irAModulo('Notificaciones')}
      hitSlop={spacing.sm}
      accessibilityRole="button"
      accessibilityLabel={cantidad > 0 ? `Notificaciones, ${cantidad} pendientes` : 'Notificaciones'}
      style={styles.boton}
    >
      <AppIcon name="notifications-outline" size={iconSizes.lg} color={globalColors.text} />
      {cantidad > 0 ? (
        <View style={styles.insignia}>
          <AppText variant="caption" style={styles.insigniaTexto}>
            {cantidad > 99 ? '99+' : String(cantidad)}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    boton: {
      minWidth: platformSpecific.minTouchTarget,
      minHeight: platformSpecific.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    insignia: {
      position: 'absolute',
      top: scale(6),
      right: scale(4),
      minWidth: scale(18),
      height: scale(18),
      paddingHorizontal: scale(4),
      borderRadius: scale(9),
      backgroundColor: c.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
    insigniaTexto: { color: c.dangerOn, fontSize: scale(10), lineHeight: scale(12), fontWeight: '700' },
  });
