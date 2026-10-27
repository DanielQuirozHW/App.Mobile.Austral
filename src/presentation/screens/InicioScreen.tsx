// Inicio. Port de Portal-Austral-Dev -> src/app/(dashboard)/page.tsx: bienvenida, mensaje del mes, cumpleaños del día y
// próximos feriados (decisión 89). Arriba hay una barra con la campana de notificaciones (con la cantidad de
// pendientes, como la campana del encabezado del portal) y el menú lateral (en el portal el menú es la barra lateral,
// que en el celular no existe). Debajo van los accesos a los módulos de la demostración (navigation/modulosMenu.ts:
// Mi perfil y Licencias y vacaciones); el cierre de sesión está en el menú y en Ajustes.
// Tirar para actualizar vuelve a leer las notificaciones (decisión 98).
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  fraseDelMesActual,
  nombreParaBienvenida,
  periodoDelMes,
} from '../../domain/inicio/tablero';
import { AppButton } from '../components/AppButton';
import { AppIcon } from '../components/AppIcon';
import { AppText } from '../components/AppText';
import { CumpleaniosCard } from '../components/inicio/CumpleaniosCard';
import { FraseDelMes } from '../components/inicio/FraseDelMes';
import { ProximosFeriadosCard } from '../components/inicio/ProximosFeriadosCard';
import { SaludoInicio } from '../components/inicio/SaludoInicio';
import { BotonMenu } from '../components/menu/BotonMenu';
import { Screen } from '../components/Screen';
import { useNotificaciones } from '../hooks/useNotificaciones';
import { useTablero } from '../hooks/useTablero';
import { ACCESOS_DE_INICIO } from '../navigation/modulosMenu';
import { irAModulo } from '../navigation/navigationRef';
import { useAuthStore } from '../stores/authStore';
import { useRolStore } from '../stores/rolStore';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { iconSizes, platformSpecific, scale, spacing } from '../utils/responsive';

export const InicioScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const user = useAuthStore((s) => s.user);
  const role = useRolStore((s) => s.role);
  const { proximosFeriados, cargandoFeriados, cumpleaniosHoy, fechaDeHoy } = useTablero();
  const { pendientes, refrescar } = useNotificaciones();
  const cantidadPendientes = pendientes.length;

  const frase = useMemo(() => fraseDelMesActual(new Date()), []);
  const periodo = useMemo(() => periodoDelMes(new Date()), []);
  const accesos = useMemo(() => ACCESOS_DE_INICIO.filter((item) => item.visiblePara(role)), [role]);

  return (
    <Screen scroll onRefresh={() => refrescar()} contentContainerStyle={styles.contenido}>
      <View style={styles.barra}>
        <AppText variant="h6">Inicio</AppText>
        <View style={styles.barraAcciones}>
          <Pressable
            onPress={() => irAModulo('Notificaciones')}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel={
              cantidadPendientes > 0 ? `Notificaciones, ${cantidadPendientes} pendientes` : 'Notificaciones'
            }
            style={styles.botonBarra}
          >
            <AppIcon name="notifications-outline" size={iconSizes.lg} color={globalColors.text} />
            {cantidadPendientes > 0 ? (
              <View style={styles.insignia}>
                <AppText variant="caption" style={styles.insigniaTexto}>
                  {cantidadPendientes > 99 ? '99+' : String(cantidadPendientes)}
                </AppText>
              </View>
            ) : null}
          </Pressable>
          <BotonMenu />
        </View>
      </View>

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

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    contenido: { gap: spacing.xl, paddingBottom: spacing.xxxl },
    barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    barraAcciones: { flexDirection: 'row', alignItems: 'center' },
    botonBarra: {
      minWidth: platformSpecific.minTouchTarget,
      minHeight: platformSpecific.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    insignia: {
      position: 'absolute',
      top: scale(6),
      right: scale(4),
      minWidth: scale(18),
      height: scale(18),
      paddingHorizontal: scale(4),
      borderRadius: scale(9),
      backgroundColor: c.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
    insigniaTexto: { color: c.dangerOn, fontSize: scale(10), lineHeight: scale(12), fontWeight: '700' },
    acciones: { gap: spacing.md },
  });
