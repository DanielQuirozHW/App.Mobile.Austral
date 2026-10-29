// Encabezado de cada sección del módulo Licencias y vacaciones. Equivale al HeaderCard del portal
// (Portal-Austral-Dev -> @core/components/header-card/HeaderCard): ícono, título, subtítulo y, a la derecha en el portal,
// el botón de acción. En el celular el botón va debajo, a todo el ancho.
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppIcon, type AppIconName } from '../AppIcon';
import { AppText } from '../AppText';

interface EncabezadoDeSeccionProps {
  icono: AppIconName;
  titulo: string;
  subtitulo: string;
  /** Si se informa junto con `onBoton`, se muestra el botón de acción. */
  textoBoton?: string;
  onBoton?: () => void;
  botonDeshabilitado?: boolean;
  accesibilidadBoton?: string;
}

export const EncabezadoDeSeccion: React.FC<EncabezadoDeSeccionProps> = ({
  icono,
  titulo,
  subtitulo,
  textoBoton,
  onBoton,
  botonDeshabilitado,
  accesibilidadBoton,
}) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  return (
    <View style={styles.card}>
      <View style={styles.fila}>
        <View style={styles.medallon}>
          <AppIcon name={icono} size={iconSizes.xl} color={globalColors.accentPrimary} />
        </View>
        <View style={styles.textos}>
          <AppText variant="h6">{titulo}</AppText>
          <AppText variant="body2" tone="secondary">
            {subtitulo}
          </AppText>
        </View>
      </View>
      {textoBoton && onBoton ? (
        <AppButton
          title={textoBoton}
          icon="add-circle-outline"
          disabled={botonDeshabilitado}
          accessibilityLabel={accesibilidadBoton}
          onPress={onBoton}
        />
      ) : null}
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
      gap: spacing.lg,
      ...platformSpecific.shadow(1),
    },
    fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    medallon: {
      width: scale(52),
      height: scale(52),
      borderRadius: borderRadius.lg,
      backgroundColor: c.accentPrimaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textos: { flex: 1, gap: spacing.xxs },
  });
