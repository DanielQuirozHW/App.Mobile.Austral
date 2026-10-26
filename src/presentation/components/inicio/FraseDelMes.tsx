// Mensaje del mes. Port de Portal-Austral-Dev -> src/@core/components/austral/FraseDelMes.tsx.
// Claro: fondo beige (customColors.beigeAcento). Oscuro: el portal usa un degradado de papel a superficie elevada;
// acá un color liso (surfaceElevated). Sin texto cargado (ver domain/inicio/frasesMensuales.ts) no se dibuja.
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, scale, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

interface FraseDelMesProps {
  frase: string;
  autor: string;
  /** "octubre de 2026". */
  periodo?: string;
  /** "SURCO, 489". */
  fuente?: string;
}

export const FraseDelMes: React.FC<FraseDelMesProps> = ({ frase, autor, periodo, fuente }) => {
  const { globalColors, isDark } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors, isDark), [globalColors, isDark]);

  if (!frase.trim()) return null;

  return (
    <View style={styles.card}>
      <AppText variant="h1" style={styles.comillaDecorativa} accessibilityElementsHidden importantForAccessibility="no">
        {'“'}
      </AppText>

      <View style={styles.kicker}>
        <View style={styles.punto} />
        <AppText variant="overline" style={styles.kickerTexto}>
          Mensaje{periodo ? ` · ${periodo}` : ''}
        </AppText>
      </View>

      <AppText variant="h4" style={styles.frase}>
        {`“${frase}”`}
      </AppText>

      <AppText variant="caption" tone="secondary">
        <AppText variant="caption" style={styles.autor}>
          {autor}
        </AppText>
        {fuente ? ` — ${fuente}` : ''}
      </AppText>
    </View>
  );
};

const createStyles = (c: ColorTokens, isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDark ? c.surfaceElevated : c.accentBeige,
      borderRadius: borderRadius.card,
      paddingTop: scale(20),
      paddingBottom: scale(18),
      paddingHorizontal: scale(24),
      overflow: 'hidden',
    },
    comillaDecorativa: {
      position: 'absolute',
      top: -scale(16),
      left: scale(20),
      fontSize: scale(120),
      lineHeight: scale(120),
      color: c.primary,
      opacity: 0.08,
    },
    kicker: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
    punto: { width: scale(5), height: scale(5), borderRadius: scale(3), backgroundColor: c.secondary },
    kickerTexto: { color: c.secondary },
    frase: { lineHeight: scale(26), marginBottom: spacing.md },
    autor: { fontWeight: '600', color: c.text },
  });
