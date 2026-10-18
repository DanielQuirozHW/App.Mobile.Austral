import React, { createContext, forwardRef, useCallback, useContext, useImperativeHandle, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

/** Distancia que queda entre el borde superior y el campo al llevarlo a la vista. */
const MARGEN_SUPERIOR = 96;

export interface ScrollFormularioRef {
  /** Lleva una vista (un campo) a la parte visible del scroll. */
  scrollAVista: (vista: View | null) => void;
  scrollAlInicio: () => void;
}

const ScrollFormularioContext = createContext<((vista: View | null) => void) | null>(null);

/** Para que un campo pueda pedir que se lo muestre (por ejemplo, el primero con error al enviar). */
export const useScrollAlCampo = (): ((vista: View | null) => void) | null => useContext(ScrollFormularioContext);

interface ScrollFormularioProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Scroll de formularios que sube con el teclado y permite llevar un campo a la vista.
 * La posición se calcula con measureInWindow del contenedor y del campo más el desplazamiento actual.
 */
export const ScrollFormulario = forwardRef<ScrollFormularioRef, ScrollFormularioProps>(function ScrollFormulario(
  { children, style, contentContainerStyle },
  ref,
) {
  const scrollRef = useRef<ScrollView>(null);
  const contenedorRef = useRef<View>(null);
  const desplazamiento = useRef(0);

  const alDesplazar = (evento: NativeSyntheticEvent<NativeScrollEvent>) => {
    desplazamiento.current = evento.nativeEvent.contentOffset.y;
  };

  const scrollAVista = useCallback((vista: View | null) => {
    if (!vista || !contenedorRef.current) return;
    contenedorRef.current.measureInWindow((_cx, cy) => {
      vista.measureInWindow((_vx, vy) => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, desplazamiento.current + (vy - cy) - MARGEN_SUPERIOR),
          animated: true,
        });
      });
    });
  }, []);

  const scrollAlInicio = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  useImperativeHandle(ref, () => ({ scrollAVista, scrollAlInicio }), [scrollAVista, scrollAlInicio]);

  return (
    <ScrollFormularioContext.Provider value={scrollAVista}>
      <View ref={contenedorRef} collapsable={false} style={[{ flex: 1 }, style]}>
        <KeyboardAwareScrollView
          ref={scrollRef}
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps="handled"
          onScroll={alDesplazar}
          scrollEventThrottle={16}
        >
          {children}
        </KeyboardAwareScrollView>
      </View>
    </ScrollFormularioContext.Provider>
  );
});
