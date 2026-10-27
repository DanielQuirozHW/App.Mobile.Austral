import React, { createContext, useCallback, useContext, useState } from 'react';
import { RefreshControl, StyleProp, View, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { spacing } from '../utils/responsive';

/**
 * true cuando la pantalla se muestra debajo del encabezado nativo de la navegación: el encabezado ya ocupa la zona
 * segura de arriba, así que `Screen` no la suma otra vez. Lo provee `RootNavigator` (conEncabezado).
 */
export const EncabezadoVisibleContext = createContext(false);

interface ScreenProps {
  children: React.ReactNode;
  /** true: el contenido hace scroll y sube con el teclado. */
  scroll?: boolean;
  /** Margen interno de la pantalla. Por defecto sí. */
  padded?: boolean;
  /**
   * Solo con `scroll`: habilita "tirar para actualizar". Debe devolver una promesa que se resuelva cuando termina la
   * recarga (el indicador se oculta en ese momento).
   */
  onRefresh?: () => Promise<unknown> | void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Contenedor base de pantalla: fondo del tema y márgenes de zona segura.
 * Usa useSafeAreaInsets (no SafeAreaView combinado con paddingTop).
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = false,
  padded = true,
  onRefresh,
  style,
  contentContainerStyle,
}) => {
  const { globalColors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const bajoEncabezado = useContext(EncabezadoVisibleContext);
  const [refrescando, setRefrescando] = useState(false);
  const margen = padded ? spacing.lg : 0;

  const refrescar = useCallback(async () => {
    if (!onRefresh) return;
    setRefrescando(true);
    try {
      await onRefresh();
    } catch {
      // Cada pantalla informa sus propios errores de lectura; acá solo se oculta el indicador.
    } finally {
      setRefrescando(false);
    }
  }, [onRefresh]);

  const zonaSegura: ViewStyle = {
    paddingTop: (bajoEncabezado ? 0 : insets.top) + margen,
    paddingBottom: insets.bottom + margen,
    paddingHorizontal: margen,
  };

  if (scroll) {
    return (
      <KeyboardAwareScrollView
        style={[{ flex: 1, backgroundColor: globalColors.background }, style]}
        contentContainerStyle={[zonaSegura, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refrescando}
              onRefresh={refrescar}
              tintColor={globalColors.accentPrimary}
              colors={[globalColors.accentPrimary]}
              progressBackgroundColor={globalColors.card}
            />
          ) : undefined
        }
      >
        {children}
      </KeyboardAwareScrollView>
    );
  }

  return (
    <View style={[{ flex: 1, backgroundColor: globalColors.background }, zonaSegura, style]}>
      {children}
    </View>
  );
};
