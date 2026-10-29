// Aviso "Próximamente" de las secciones que todavía no están en la app (decisión 100: las entradas del menú del portal
// que no se migran, más las que están hechas pero todavía no se habilitan). Se usa en pantalla completa
// (ModuloVacioScreen) y, en versión compacta, dentro de una pestaña (Docencia > Promoción y Nombramientos).
// El texto es el de una app mobile (docs/DECISION-UI-MOBILE.md).
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { irAModulo } from '../navigation/navigationRef';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { borderRadius, iconSizes, scale, spacing } from '../utils/responsive';
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
      <AppText variant="h3" style={styles.texto}>
        {titulo}
      </AppText>
      <View style={styles.etiqueta}>
        <AppText variant="subtitle2" tone="primary">
          Próximamente
        </AppText>
      </View>
      <AppText variant="body1" tone="secondary" style={styles.texto}>
        Esta sección todavía se encuentra en construcción.
      </AppText>
      {compacto ? null : (
        <AppButton title="Volver al inicio" icon="home-outline" onPress={() => irAModulo('Inicio')} style={styles.boton} />
      )}
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl },
    centroCompacto: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
    circulo: {
      width: scale(96),
      height: scale(96),
      borderRadius: scale(48),
      backgroundColor: c.accentPrimaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    etiqueta: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.round,
      backgroundColor: c.accentPrimaryMuted,
    },
    texto: { textAlign: 'center' },
    boton: { alignSelf: 'stretch', marginTop: spacing.md },
  });
