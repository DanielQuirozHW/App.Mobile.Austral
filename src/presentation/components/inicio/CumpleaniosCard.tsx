// Cumpleaños del día. Port de Portal-Austral-Dev -> src/@core/components/austral/CumpleaniosCard.tsx.
// El portal también tiene una sección "Aniversarios del mes", pero su página principal le pasa siempre una lista
// vacía, así que no se dibuja.
// Diferencias de la app mobile (docs/DECISION-UI-MOBILE.md): el nombre se muestra con mayúsculas solo al principio de
// cada palabra (el CRM lo guarda en MAYÚSCULAS) y puede ocupar dos líneas en lugar de pisar el ícono de la derecha.
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { PersonaCumpleanios } from '../../../domain/inicio/tablero';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { scale, spacing } from '../../utils/responsive';
import { nombrePropio } from '../../utils/texto';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';
import { TarjetaTablero } from './TarjetaTablero';

interface CumpleaniosCardProps {
  /** "26 OCT". */
  fechaLabel: string;
  cumpleanios: PersonaCumpleanios[];
}

const TAMANIO_AVATAR = scale(36);

export const CumpleaniosCard: React.FC<CumpleaniosCardProps> = ({ fechaLabel, cumpleanios }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  return (
    <TarjetaTablero
      icono="gift-outline"
      colorIcono={globalColors.info}
      titulo="Cumpleaños del día"
      derecha={
        <AppText variant="caption" tone="secondary" style={styles.fecha}>
          {fechaLabel}
        </AppText>
      }
    >
      <View style={styles.lista}>
        {cumpleanios.length === 0 ? (
          <AppText variant="body2" tone="secondary" style={styles.vacio}>
            No hay cumpleaños hoy
          </AppText>
        ) : null}
        {cumpleanios.map((persona, indice) => (
          <View key={`${persona.nombre}-${persona.apellido}-${indice}`} style={styles.fila}>
            <View style={styles.persona}>
              <View style={styles.avatar}>
                <AppText variant="body2" style={styles.iniciales}>
                  {persona.iniciales}
                </AppText>
              </View>
              <View style={styles.datos}>
                <AppText variant="body1" numberOfLines={2} style={styles.nombre}>
                  {nombrePropio(`${persona.nombre} ${persona.apellido}`)}
                </AppText>
                <AppText variant="caption" tone="secondary" numberOfLines={1}>
                  {persona.unidad}
                </AppText>
              </View>
            </View>
            <AppIcon name="sparkles-outline" size={scale(18)} color={globalColors.info} />
          </View>
        ))}
      </View>
    </TarjetaTablero>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    fecha: { fontWeight: '600', letterSpacing: 0.8 },
    lista: { paddingVertical: spacing.sm },
    vacio: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
    },
    // `minWidth: 0` en los dos contenedores: sin eso el texto largo no se corta y pasa por debajo del ícono.
    persona: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, flex: 1, minWidth: 0 },
    // Avatar: customColors.azulLight de fondo y color primario en el texto (CumpleaniosCard del portal).
    avatar: {
      width: TAMANIO_AVATAR,
      height: TAMANIO_AVATAR,
      borderRadius: TAMANIO_AVATAR / 2,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iniciales: { color: c.primary, fontWeight: '700' },
    datos: { flex: 1, minWidth: 0 },
    nombre: { fontWeight: '600' },
  });
