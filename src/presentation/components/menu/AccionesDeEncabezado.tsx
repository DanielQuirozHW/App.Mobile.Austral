// Acciones del extremo derecho del encabezado, en TODAS las pantallas: campana de notificaciones con contador y avatar
// del usuario (que abre el menú con Cambiar puesto, Ajustes y Cerrar sesión). "Cambiar puesto" pasó al menú del usuario
// (docs/DECISION-UI-MOBILE.md). No están: la ayuda (solo abre PDF de preguntas frecuentes de Licencias) ni el tamaño
// de letra.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BotonMenu } from './BotonMenu';
import { CampanaNotificaciones } from './CampanaNotificaciones';

export const AccionesDeEncabezado: React.FC = () => (
  <View style={styles.fila}>
    <CampanaNotificaciones />
    <BotonMenu />
  </View>
);

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center' },
});
