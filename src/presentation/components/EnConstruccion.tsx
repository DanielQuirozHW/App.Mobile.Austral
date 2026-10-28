// Aviso "En construcción" de las secciones del menú del portal que no se migran (decisión 100). Se usa en pantalla
// completa (ModuloVacioScreen) y, en versión compacta, dentro de una pestaña (Docencia > Promoción).
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { irAModulo } from '../navigation/navigationRef';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { iconSizes, scale, spacing } from '../utils/responsive';
import { AppButton } from './AppButton';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

interface EnConstruccionProps {
  titulo: string;
  /** Camino dentro del menú, p. ej. "Funciones SA › Promoción docente". */
  ubicacion?: string;
  /** true: sin botón y sin ocupar toda la pantalla (dentro de una pestaña). */
  compacto?: boolean;
}

export const EnConstruccion: React.FC<EnConstruccionProps> = ({ titulo, ubicacion, compacto = false }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  return (
    <View style={compacto ? styles.centroCompacto : styles.centro}>
      <View style={styles.circulo}>
        <AppIcon name="construct-outline" size={iconSizes.xxxl} color={globalColors.accentPrimary} />
      </View>
      {ubicacion ? (
        <AppText variant="caption" tone="secondary" style={styles.texto}>
          {ubicacion}
        </AppText>
      ) : null}
      <AppText variant="h5" style={styles.texto}>
        {titulo}
      </AppText>
      <AppText variant="subtitle1" tone="primary" style={styles.texto}>
        En construcción
      </AppText>
      <AppText variant="body2" tone="secondary" style={styles.texto}>
        Esta sección todavía no está disponible en la app.
      </AppText>
      {compacto ? null : (
        <AppButton title="Volver al inicio" variant="secondary" icon="home-outline" onPress={() => irAModulo('Inicio')} />
      )}
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl },
    centroCompacto: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
    circulo: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      backgroundColor: c.accentPrimaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    texto: { textAlign: 'center' },
  });
