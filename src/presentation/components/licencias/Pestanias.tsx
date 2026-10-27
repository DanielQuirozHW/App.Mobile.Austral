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
  /**
   * 'chips' (por defecto): píldoras con scroll horizontal.
   * 'subrayado': pestañas con línea inferior y la activa marcada con 2 px del color primario (Tabs del portal,
   * overrides/tabs.ts). Se usa en el nivel de arriba cuando hay dos filas de pestañas, para distinguirlas.
   */
  estilo?: 'chips' | 'subrayado';
}

/** Pestañas con scroll horizontal (TabList del portal), en forma de chips o subrayadas. */
export function Pestanias<T extends string>({ items, activa, onCambiar, estilo = 'chips' }: PestaniasProps<T>) {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const subrayado = estilo === 'subrayado';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={subrayado ? styles.barraSubrayado : undefined}
      contentContainerStyle={subrayado ? styles.filaSubrayado : styles.fila}
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
            style={
              subrayado
                ? [styles.tab, seleccionada && styles.tabActiva]
                : [styles.chip, seleccionada && styles.chipActivo]
            }
          >
            {subrayado ? (
              <AppText
                variant="subtitle1"
                locked
                style={{ color: seleccionada ? globalColors.accentPrimary : globalColors.textSecondary }}
              >
                {texto}
              </AppText>
            ) : (
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
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    fila: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
    // Chip outlined del portal (overrides/chip.ts): borde de 22 % de la tinta, igual que el de los campos.
    chip: {
      minHeight: platformSpecific.minTouchTarget,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.round,
      borderWidth: 1,
      borderColor: c.inputBorder,
      backgroundColor: c.card,
    },
    chipActivo: { backgroundColor: c.accentPrimary, borderColor: c.accentPrimary },
    // Tabs del portal (overrides/tabs.ts): línea divisoria abajo, indicador de 2 px en el color primario.
    barraSubrayado: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: c.border },
    filaSubrayado: { flexDirection: 'row', gap: spacing.xs },
    tab: {
      minHeight: platformSpecific.minTouchTarget,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActiva: { borderBottomColor: c.accentPrimary },
  });
