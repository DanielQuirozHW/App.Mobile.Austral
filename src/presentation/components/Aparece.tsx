// Entrada animada: el contenido aparece con un fundido y un leve desplazamiento hacia arriba. Se usa en Inicio y en las
// pantallas de subopciones, con una demora creciente, para que las secciones y las tarjetas entren en cascada
// (docs/DECISION-UI-MOBILE.md). Se anima una sola vez, al montarse la pantalla: al volver atrás no se repite.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

interface ApareceProps {
  /** Milisegundos de espera antes de empezar. */
  demora?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Aparece: React.FC<ApareceProps> = ({ demora = 0, style, children }) => {
  const progreso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progreso, {
      toValue: 1,
      duration: 380,
      delay: demora,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progreso, demora]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progreso,
          transform: [{ translateY: progreso.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
