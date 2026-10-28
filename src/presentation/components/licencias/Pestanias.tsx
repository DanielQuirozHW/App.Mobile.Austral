import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
   * 'segmentado': control segmentado a todo el ancho, sin scroll, para pocas pestañas (hasta 4) de texto corto. Es el
   * estilo de app para el nivel de arriba (docs/DECISION-UI-MOBILE.md).
   */
  estilo?: 'chips' | 'subrayado' | 'segmentado';
}

/** Pestañas (TabList del portal), en forma de chips con scroll, subrayadas o como control segmentado. */
export function Pestanias<T extends string>({ items, activa, onCambiar, estilo = 'chips' }: PestaniasProps<T>) {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const subrayado = estilo === 'subrayado';

  if (estilo === 'segmentado') {
    return (
      <View style={styles.segmentos} accessibilityRole="tablist">
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
              style={[styles.segmento, seleccionada && styles.segmentoActivo]}
            >
              <AppText
                variant="label"
                locked
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                style={{ color: seleccionada ? globalColors.accentPrimary : globalColors.textSecondary }}
              >
                {texto}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    );
  }

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
    // Control segmentado: fondo gris suave, la pestaña activa es una "píldora" blanca con sombra leve.
    segmentos: {
      flexDirection: 'row',
      padding: spacing.xs,
      gap: spacing.xs,
      borderRadius: borderRadius.xl,
      backgroundColor: c.surfaceSecondary,
    },
    segmento: {
      flex: 1,
      minHeight: platformSpecific.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
      borderRadius: borderRadius.lg,
    },
    segmentoActivo: { backgroundColor: c.card, ...platformSpecific.shadow(2) },
  });
