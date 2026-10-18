import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, platformSpecific, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

export interface ItemPestania<T extends string> {
  clave: T;
  etiqueta: string;
  /** Si se informa, se muestra entre paréntesis. */
  cantidad?: number;
}

interface PestaniasProps<T extends string> {
  items: ItemPestania<T>[];
  activa: T;
  onCambiar: (clave: T) => void;
}

/** Pestañas en forma de chips con scroll horizontal (TabList de chips del portal). */
export function Pestanias<T extends string>({ items, activa, onCambiar }: PestaniasProps<T>) {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.fila}
      keyboardShouldPersistTaps="handled"
      accessibilityRole="tablist"
    >
      {items.map((item) => {
        const seleccionada = item.clave === activa;
        const texto = item.cantidad !== undefined ? `${item.etiqueta} (${item.cantidad})` : item.etiqueta;
        return (
          <Pressable
            key={item.clave}
            onPress={() => onCambiar(item.clave)}
            accessibilityRole="tab"
            accessibilityState={{ selected: seleccionada }}
            accessibilityLabel={texto}
            android_ripple={{ color: globalColors.hairline }}
            style={[styles.chip, seleccionada && styles.chipActivo]}
          >
            <AppText
              variant="body2"
              locked
              style={{
                fontWeight: '600',
                color: seleccionada ? globalColors.accentPrimaryOn : globalColors.text,
              }}
            >
              {texto}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    fila: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
    chip: {
      minHeight: platformSpecific.minTouchTarget,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.round,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    chipActivo: { backgroundColor: c.accentPrimary, borderColor: c.accentPrimary },
  });
