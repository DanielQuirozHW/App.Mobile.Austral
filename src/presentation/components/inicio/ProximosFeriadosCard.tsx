// Próximos feriados. Port de Portal-Austral-Dev -> src/@core/components/austral/ProximosFeriadosCard.tsx.
// El primero de la lista se destaca ("PRÓXIMO"). Diferencias de la app mobile (docs/DECISION-UI-MOBILE.md): el nombre
// del feriado puede ocupar dos líneas (en una se cortaba: "Día de la Soberan...") y los demás no repiten el mes debajo de
// "en N días" (ya está en el cuadro de la fecha).
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { FeriadoProximo } from '../../../domain/inicio/tablero';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, scale, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';
import { TarjetaTablero } from './TarjetaTablero';

interface ProximosFeriadosCardProps {
  feriados: FeriadoProximo[];
  cargando?: boolean;
}

const primeraEnMayuscula = (texto: string): string => texto.charAt(0).toUpperCase() + texto.slice(1);

export const ProximosFeriadosCard: React.FC<ProximosFeriadosCardProps> = ({ feriados, cargando }) => {
  const { globalColors, isDark } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors, isDark), [globalColors, isDark]);

  return (
    <TarjetaTablero
      icono="calendar-outline"
      colorIcono={globalColors.text}
      titulo="Próximos feriados"
      derecha={
        <View style={styles.contador}>
          <AppText variant="body2" style={styles.contadorTexto}>
            {feriados.length}
          </AppText>
        </View>
      }
    >
      <View style={styles.lista}>
        {cargando ? (
          <View style={styles.cargando}>
            <ActivityIndicator color={globalColors.accentPrimary} />
          </View>
        ) : (
          <>
            {feriados.length === 0 ? (
              <AppText variant="body2" tone="secondary" style={styles.vacio}>
                No hay feriados próximos
              </AppText>
            ) : null}
            {feriados.map((feriado, indice) => {
              const esProximo = indice === 0;
              return (
                <View
                  key={`${feriado.nombre}-${feriado.dia}-${feriado.mes}`}
                  style={[styles.fila, esProximo && styles.filaProxima]}
                >
                  <View style={[styles.fecha, esProximo && styles.fechaProxima]}>
                    <AppText
                      variant="h6"
                      style={[styles.fechaDia, { color: esProximo ? globalColors.accentPrimaryOn : globalColors.text }]}
                    >
                      {feriado.dia}
                    </AppText>
                    <AppText
                      variant="overline"
                      style={[
                        styles.fechaMes,
                        { color: esProximo ? globalColors.accentPrimaryOn : globalColors.textSecondary },
                      ]}
                    >
                      {feriado.mes}
                    </AppText>
                  </View>

                  <View style={styles.info}>
                    <AppText variant="body2" numberOfLines={2} style={styles.nombre}>
                      {feriado.nombre}
                    </AppText>
                    <AppText variant="caption" tone="secondary">
                      {primeraEnMayuscula(feriado.diaSemana)}
                    </AppText>
                  </View>

                  <View style={styles.restantes}>
                    <AppText variant="caption" tone="primary" style={styles.restantesTexto}>
                      en {feriado.diasRestantes} días
                    </AppText>
                    {esProximo ? (
                      <AppText variant="caption" tone="secondary" style={styles.restantesEtiqueta}>
                        PRÓXIMO
                      </AppText>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </View>
    </TarjetaTablero>
  );
};

const createStyles = (c: ColorTokens, isDark: boolean) =>
  StyleSheet.create({
    // Contador: fondo primario y texto del color del papel (theme.palette.background.paper).
    contador: {
      backgroundColor: c.accentPrimary,
      borderRadius: borderRadius.lg,
      paddingHorizontal: scale(10),
      paddingVertical: spacing.xxs,
      minWidth: scale(24),
      alignItems: 'center',
    },
    contadorTexto: { color: c.accentPrimaryOn, fontWeight: '700', lineHeight: scale(14) },
    lista: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    cargando: { alignItems: 'center', paddingVertical: spacing.xxl },
    vacio: { paddingHorizontal: spacing.sm, paddingVertical: spacing.md },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      padding: spacing.md,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    // Destacado del primero: rgba(79,195,215,…) en oscuro y rgba(46,48,146,…) en claro, como en el portal.
    filaProxima: {
      backgroundColor: isDark ? 'rgba(79, 195, 215, 0.10)' : 'rgba(46, 48, 146, 0.07)',
      borderColor: isDark ? 'rgba(79, 195, 215, 0.25)' : 'rgba(46, 48, 146, 0.15)',
    },
    fecha: {
      width: scale(52),
      height: scale(52),
      borderRadius: borderRadius.card,
      backgroundColor: c.accentPrimaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fechaProxima: { backgroundColor: c.accentPrimary },
    fechaDia: { fontWeight: '800', lineHeight: scale(20) },
    fechaMes: { fontWeight: '700', fontSize: scale(10), lineHeight: scale(12) },
    info: { flex: 1, minWidth: 0 },
    nombre: { fontWeight: '600', marginBottom: spacing.xxs },
    restantes: { minWidth: scale(72), alignItems: 'flex-end' },
    restantesTexto: { fontWeight: '700' },
    restantesEtiqueta: { fontWeight: '600' },
  });
