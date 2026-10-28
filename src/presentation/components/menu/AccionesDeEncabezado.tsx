// Acciones del extremo derecho del encabezado, en TODAS las pantallas (decisión 100): Cambiar puesto (solo con más de un
// puesto), campana de notificaciones con contador y menú lateral. Es el equivalente de la zona derecha del encabezado del
// portal (layouts/components/vertical/AppBarContent.tsx: SwitchUser, ayuda, NotificationDropdown, tamaño de letra y
// menú del usuario). No están: la ayuda (solo abre PDF de preguntas frecuentes de Licencias) ni el tamaño de letra.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BotonCambiarPuesto } from './BotonCambiarPuesto';
import { BotonMenu } from './BotonMenu';
import { CampanaNotificaciones } from './CampanaNotificaciones';

export const AccionesDeEncabezado: React.FC = () => (
  <View style={styles.fila}>
    <BotonCambiarPuesto />
    <CampanaNotificaciones />
    <BotonMenu />
  </View>
);

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center' },
});
