import React, { createContext, useContext } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
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
  style,
  contentContainerStyle,
}) => {
  const { globalColors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const bajoEncabezado = useContext(EncabezadoVisibleContext);
  const margen = padded ? spacing.lg : 0;

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
