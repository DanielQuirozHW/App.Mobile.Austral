import React, { useMemo, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../utils/responsive';
import { AppIcon, type AppIconName } from './AppIcon';
import { AppText } from './AppText';

interface SeccionCardProps {
  /** Número de la sección (se muestra en el medallón si no hay `icono`). */
  numero?: number;
  /** Ícono del medallón. Tiene prioridad sobre `numero`. */
  icono?: AppIconName;
  titulo: string;
  descripcion?: string;
  /** Texto corto que se muestra debajo del título cuando la sección está cerrada. */
  resumen?: string;
  /** Elemento a la derecha del encabezado (por ejemplo un botón de ayuda). */
  accionEncabezado?: React.ReactNode;
  /** true: tocar el encabezado abre y cierra la sección. El contenido sigue montado cuando está cerrada. */
  colapsable?: boolean;
  /** Si se pasa, el estado abierto/cerrado lo maneja quien la usa (junto con `onAlternar`). */
  abierta?: boolean;
  onAlternar?: () => void;
  /** Estado inicial cuando no es controlada. */
  abiertaInicial?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Tarjeta de una sección de un formulario largo. En la app mobile las secciones se pueden cerrar para recorrer el
 * formulario sin tanto scroll; cerrada muestra un resumen.
 */
export const SeccionCard: React.FC<SeccionCardProps> = ({
  numero,
  icono,
  titulo,
  descripcion,
  resumen,
  accionEncabezado,
  colapsable = false,
  abierta,
  onAlternar,
  abiertaInicial = true,
  style,
  children,
}) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const [abiertaInterna, setAbiertaInterna] = useState(abiertaInicial);
  const estaAbierta = !colapsable || (abierta ?? abiertaInterna);

  const alternar = () => {
    if (onAlternar) onAlternar();
    else setAbiertaInterna((valor) => !valor);
  };

  const medallon = icono ? (
    <View style={styles.medallon}>
      <AppIcon name={icono} size={iconSizes.lg} color={globalColors.accentPrimary} />
    </View>
  ) : numero !== undefined ? (
    <View style={styles.medallon}>
      <AppText variant="subtitle2" tone="primary">
        {String(numero).padStart(2, '0')}
      </AppText>
    </View>
  ) : null;

  const encabezado = (
    <View style={[styles.encabezado, estaAbierta && styles.encabezadoAbierto]}>
      {medallon}
      <View style={styles.titulos}>
        <AppText variant="h6">{titulo}</AppText>
        {!estaAbierta && resumen ? (
          <AppText variant="body2" tone="secondary" numberOfLines={1}>
            {resumen}
          </AppText>
        ) : descripcion ? (
          <AppText variant="caption" tone="secondary">
            {descripcion}
          </AppText>
        ) : null}
      </View>
      {accionEncabezado}
      {colapsable ? (
        <AppIcon
          name={estaAbierta ? 'chevron-up' : 'chevron-down'}
          size={iconSizes.lg}
          color={globalColors.textSecondary}
        />
      ) : null}
    </View>
  );

  return (
    <View style={[styles.card, style]}>
      {colapsable ? (
        <Pressable
          onPress={alternar}
          accessibilityRole="button"
          accessibilityLabel={titulo}
          accessibilityState={{ expanded: estaAbierta }}
          android_ripple={{ color: globalColors.hairline }}
        >
          {encabezado}
        </Pressable>
      ) : (
        encabezado
      )}
      <View style={[styles.cuerpo, !estaAbierta && styles.oculto]}>{children}</View>
    </View>
  );
};

// Sin overflow: 'hidden' junto a la sombra (en Android la elevación se recorta).
const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
      ...platformSpecific.shadow(2),
    },
    encabezado: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      minHeight: platformSpecific.minTouchTarget,
    },
    encabezadoAbierto: {
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    medallon: {
      width: scale(44),
      height: scale(44),
      borderRadius: borderRadius.md,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titulos: { flex: 1, gap: spacing.xxs },
    cuerpo: { padding: spacing.lg, gap: spacing.lg },
    // Cerrada: el contenido sigue montado (los campos del formulario siguen registrados) pero no se ve.
    oculto: { display: 'none' },
  });
