// Inicio. Port de Portal-Austral-Dev -> src/app/(dashboard)/page.tsx: bienvenida, mensaje del mes, cumpleaños del día y
// próximos feriados (decisión 89). Arriba hay una barra con las acciones del encabezado del portal: "Cambiar puesto"
// (solo con más de un puesto), la campana de notificaciones con la cantidad de pendientes y el menú lateral
// (components/menu/AccionesDeEncabezado, las mismas que llevan todas las demás pantallas en su encabezado; en el portal
// el menú es la barra lateral, que en el celular no existe). Debajo va el cartel "Usted se encuentra en el Portal ..."
// (components/menu/PildoraPuesto) y los accesos a los módulos de la demostración (navigation/modulosMenu.ts: Mi perfil y
// Licencias y vacaciones); el cierre de sesión está en el menú y en Ajustes.
// Tirar para actualizar vuelve a leer las notificaciones (decisión 98).
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { AccionesDeEncabezado } from '../components/menu/AccionesDeEncabezado';
import { PildoraPuesto } from '../components/menu/PildoraPuesto';
import { Screen } from '../components/Screen';
import { useNotificaciones } from '../hooks/useNotificaciones';
import { useTablero } from '../hooks/useTablero';
import { ACCESOS_DE_INICIO } from '../navigation/modulosMenu';
import { irAModulo } from '../navigation/navigationRef';
import { useAuthStore } from '../stores/authStore';
import { useRolStore } from '../stores/rolStore';
import { spacing } from '../utils/responsive';

export const InicioScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const role = useRolStore((s) => s.role);
  const { proximosFeriados, cargandoFeriados, cumpleaniosHoy, fechaDeHoy } = useTablero();
  const { refrescar } = useNotificaciones();

  const frase = useMemo(() => fraseDelMesActual(new Date()), []);
  const periodo = useMemo(() => periodoDelMes(new Date()), []);
  const accesos = useMemo(() => ACCESOS_DE_INICIO.filter((item) => item.visiblePara(role)), [role]);

  return (
    <Screen scroll onRefresh={() => refrescar()} contentContainerStyle={styles.contenido}>
      <View style={styles.barra}>
        <AppText variant="h6">Inicio</AppText>
        <AccionesDeEncabezado />
      </View>

      <PildoraPuesto />

      <SaludoInicio nombre={nombreParaBienvenida(user)} subtitulo="Portal SIP – Universidad Austral" />

      <FraseDelMes frase={frase.texto} autor={frase.autor} fuente={`${frase.libro}, ${frase.numero}`} periodo={periodo} />

      <CumpleaniosCard fechaLabel={fechaDeHoy} cumpleanios={cumpleaniosHoy} />
      <ProximosFeriadosCard feriados={proximosFeriados} cargando={cargandoFeriados} />

      {accesos.length > 0 ? (
        <View style={styles.acciones}>
          <AppText variant="overline" tone="secondary">
            Accesos
          </AppText>
          {accesos.map((item) => (
            <AppButton key={item.ruta} title={item.titulo} icon={item.icono} onPress={() => irAModulo(item.ruta)} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  contenido: { gap: spacing.xl, paddingBottom: spacing.xxxl },
  barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  acciones: { gap: spacing.md },
});
