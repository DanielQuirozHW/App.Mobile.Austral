// Inicio. Port de Portal-Austral-Dev -> src/app/(dashboard)/page.tsx: bienvenida, mensaje del mes, cumpleaños del día y
// próximos feriados (decisión 89). Debajo van los accesos a los módulos construidos (en el portal están en el menú
// lateral, que en el celular no existe) y el cierre de sesión. "Notificaciones" lleva la cantidad de pendientes (en el
// portal es la campana del encabezado).
import React, { useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cerrarSesion } from '../../application/auth/authService';
import {
  fraseDelMesActual,
  nombreParaBienvenida,
  periodoDelMes,
} from '../../domain/inicio/tablero';
import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { CumpleaniosCard } from '../components/inicio/CumpleaniosCard';
import { FraseDelMes } from '../components/inicio/FraseDelMes';
import { ProximosFeriadosCard } from '../components/inicio/ProximosFeriadosCard';
import { SaludoInicio } from '../components/inicio/SaludoInicio';
import { Screen } from '../components/Screen';
import { useNotificaciones } from '../hooks/useNotificaciones';
import { useTablero } from '../hooks/useTablero';
import type { RootStackParams } from '../navigation/tipos';
import { useAuthStore } from '../stores/authStore';
import { puedeVerLegajo, useRolStore } from '../stores/rolStore';
import { spacing } from '../utils/responsive';

export const InicioScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const user = useAuthStore((s) => s.user);
  const role = useRolStore((s) => s.role);
  const { proximosFeriados, cargandoFeriados, cumpleaniosHoy, fechaDeHoy } = useTablero();
  const { pendientes } = useNotificaciones();

  const frase = useMemo(() => fraseDelMesActual(new Date()), []);
  const periodo = useMemo(() => periodoDelMes(new Date()), []);

  const salir = async () => {
    try {
      await cerrarSesion();
    } catch {
      Alert.alert('No se pudo cerrar la sesión. Intentá nuevamente.');
    }
  };

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      <SaludoInicio nombre={nombreParaBienvenida(user)} subtitulo="Portal SIP – Universidad Austral" />

      <FraseDelMes frase={frase.texto} autor={frase.autor} fuente={`${frase.libro}, ${frase.numero}`} periodo={periodo} />

      <CumpleaniosCard fechaLabel={fechaDeHoy} cumpleanios={cumpleaniosHoy} />
      <ProximosFeriadosCard feriados={proximosFeriados} cargando={cargandoFeriados} />

      <View style={styles.acciones}>
        <AppText variant="overline" tone="secondary">
          Accesos
        </AppText>
        <AppButton
          title={pendientes.length > 0 ? `Notificaciones (${pendientes.length})` : 'Notificaciones'}
          icon="notifications-outline"
          onPress={() => navigation.navigate('Notificaciones')}
        />
        {puedeVerLegajo(role) ? (
          <AppButton title="Datos personales" icon="person-outline" onPress={() => navigation.navigate('DatosPersonales')} />
        ) : null}
        <AppButton
          title="Licencias y vacaciones"
          icon="calendar-outline"
          onPress={() => navigation.navigate('Licencias')}
        />
        <AppButton title="Formación" icon="school-outline" onPress={() => navigation.navigate('Formacion')} />
        <AppButton
          title="Trayectoria profesional"
          icon="briefcase-outline"
          onPress={() => navigation.navigate('Trayectoria')}
        />
        <AppButton title="Extensión" icon="people-outline" onPress={() => navigation.navigate('Extension')} />
        <AppButton
          title="Gestión académica"
          icon="git-network-outline"
          onPress={() => navigation.navigate('GestionAcademica')}
        />
        <AppButton title="Docencia" icon="book-outline" onPress={() => navigation.navigate('Docencia')} />
        <AppButton title="Investigación" icon="flask-outline" onPress={() => navigation.navigate('Investigacion')} />
        {role === 'docente' ? (
          <AppButton
            title="Plan de trabajo"
            icon="clipboard-outline"
            onPress={() => navigation.navigate('PlanesDeTrabajo')}
          />
        ) : null}
        <AppButton title="Cerrar sesión" variant="secondary" onPress={salir} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  contenido: { gap: spacing.xl, paddingBottom: spacing.xxxl },
  acciones: { gap: spacing.md },
});
