// Port de Portal-Austral-Dev -> licencias/_components/vacaciones/components/VacacionesPanel.tsx ("Resumen de Vacaciones").
// Tres tarjetas, igual que el portal (la de "Días a Gozar" está comentada allá): Días Solicitados, Días Pendientes
// (con desglose) y Días Gozados (con desglose), y la barra "Progreso de Vacaciones".
// Adaptaciones al celular: el Popover del desglose y el Tooltip pasan a un diálogo que se abre al tocar la tarjeta;
// el encabezado con el período y los días disponibles lo agrega la app (en el portal el chip del período está comentado).
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { calcularProgreso } from '../../../domain/licencias/vacaciones';
import type { PeriodoVacaciones } from '../../../domain/licencias/tipos';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppIcon, AppIconName } from '../AppIcon';
import { AppModal } from '../AppModal';
import { AppText } from '../AppText';

interface VacacionesPanelProps {
  periodo: PeriodoVacaciones;
  /** Si se informa, se muestra el botón "Solicitar". */
  onSolicitar?: () => void;
}

interface ItemDesglose {
  label: string;
  value: number;
}

interface Tarjeta {
  clave: string;
  titulo: string;
  valor: number;
  descripcion: string;
  icono: AppIconName;
  fondo: string;
  /** Texto de ayuda (el Tooltip del portal). */
  ayuda?: string;
  /** Desglose (el Popover del portal). */
  desglose?: ItemDesglose[];
}

export const VacacionesPanel: React.FC<VacacionesPanelProps> = ({ periodo, onSolicitar }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const progreso = useMemo(() => calcularProgreso(periodo), [periodo]);
  const [detalle, setDetalle] = useState<Tarjeta | null>(null);

  const tarjetas: Tarjeta[] = [
    {
      clave: 'solicitados',
      titulo: 'Días Solicitados',
      valor: periodo.diasSolicitados,
      descripcion: 'Días en proceso de solicitud / Días aprobados',
      icono: 'time-outline',
      fondo: globalColors.accentPrimaryMuted,
      ayuda: 'Se muestra la sumatoria total entre los días aprobados y los días en proceso de solicitud.',
    },
    {
      clave: 'pendientes',
      titulo: 'Días Pendientes',
      valor: periodo.diasPendientes,
      descripcion: 'Días pendientes de ser solicitados',
      icono: 'hourglass-outline',
      fondo: globalColors.warningLight,
      desglose: [
        { label: 'Días correspondientes', value: periodo.diasCorrespondientes },
        { label: 'Días adicionales', value: periodo.diasAdicionales },
        { label: 'Días del período anterior', value: periodo.diasPendientesDelPeriodoAnterior },
      ],
    },
    {
      clave: 'gozados',
      titulo: 'Días Gozados',
      valor: periodo.diasGozados,
      descripcion: 'Días ya utilizados',
      icono: 'checkmark-circle-outline',
      fondo: globalColors.successLight,
      desglose: [{ label: 'Gozados', value: periodo.diasGozados }],
    },
  ];

  // Colores de la barra: los del portal (success.main, primary.main y primary.light).
  const referencias = [
    { clave: 'gozados', texto: 'Gozados', valor: progreso.gozados, color: globalColors.success },
    { clave: 'solicitados', texto: 'Solicitados', valor: progreso.solicitados, color: globalColors.primary },
    { clave: 'pendientes', texto: 'Pendientes', valor: progreso.pendientes, color: globalColors.primaryMid },
  ];

  const totalDesglose = detalle?.desglose
    ? detalle.desglose.reduce((suma, item) => suma + (Number(item.value) || 0), 0)
    : 0;

  return (
    <View style={styles.card}>
      <View style={styles.encabezado}>
        <View style={styles.titulos}>
          <AppText variant="subtitle2">{`Período ${periodo.periodo}`}</AppText>
          <AppText variant="caption" tone="secondary">
            {`Para gozar entre el ${periodo.fechaDesdePeriodo} y el ${periodo.fechaHastaPeriodo}`}
          </AppText>
        </View>
        <View style={styles.disponibles}>
          <AppText variant="h6">{String(periodo.diasPendientesTotales)}</AppText>
          <AppText variant="caption" tone="secondary">
            Disponibles
          </AppText>
        </View>
      </View>

      <AppText variant="label">Resumen de Vacaciones</AppText>
      <View style={styles.tarjetas}>
        {tarjetas.map((t) => {
          const tieneInfo = Boolean(t.ayuda) || Boolean(t.desglose && t.desglose.length > 0);
          return (
            <Pressable
              key={t.clave}
              disabled={!tieneInfo}
              onPress={() => setDetalle(t)}
              accessibilityRole={tieneInfo ? 'button' : undefined}
              accessibilityLabel={tieneInfo ? `${t.titulo}: ${t.valor}. Ver detalle` : `${t.titulo}: ${t.valor}`}
              style={[styles.tarjeta, { backgroundColor: t.fondo }]}
            >
              <View style={styles.iconos}>
                <AppIcon name={t.icono} size={iconSizes.xl} color={globalColors.primary} />
                {tieneInfo ? (
                  <AppIcon name="information-circle-outline" size={iconSizes.sm} color={globalColors.primary} />
                ) : null}
              </View>
              <AppText variant="h6" style={styles.valor}>
                {String(t.valor ?? 0)}
              </AppText>
              <AppText variant="subtitle2" style={styles.centrado}>
                {t.titulo}
              </AppText>
              <AppText variant="caption" tone="secondary" style={styles.centrado}>
                {t.descripcion}
              </AppText>
              {t.desglose && t.desglose.length > 0 ? (
                <AppText variant="caption" tone="secondary" style={styles.pista}>
                  Tocá para ver desglose
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <AppText variant="label">Progreso de Vacaciones</AppText>
      <View
        style={styles.barra}
        accessibilityRole="progressbar"
        accessibilityLabel={`Gozados ${progreso.gozados}, solicitados ${progreso.solicitados}, pendientes ${progreso.pendientes}`}
      >
        {progreso.hayTotal ? (
          <>
            <View style={{ width: `${progreso.porcentajeGozados}%`, backgroundColor: globalColors.success }} />
            <View style={{ width: `${progreso.porcentajeSolicitados}%`, backgroundColor: globalColors.primary }} />
            <View style={{ width: `${progreso.porcentajePendientes}%`, backgroundColor: globalColors.primaryMid }} />
          </>
        ) : null}
      </View>
      <View style={styles.referencias}>
        {referencias.map((r) => (
          <View key={r.clave} style={styles.referencia}>
            <View style={[styles.punto, { backgroundColor: r.color }]} />
            <AppText variant="caption">{`${r.texto}: ${r.valor}`}</AppText>
          </View>
        ))}
      </View>

      {onSolicitar ? <AppButton title="Solicitar" icon="add-circle-outline" onPress={onSolicitar} /> : null}

      <AppModal
        visible={detalle !== null}
        onClose={() => setDetalle(null)}
        variante="centrado"
        titulo={detalle?.desglose ? 'Desglose de días' : detalle?.titulo}
        subtitulo={detalle?.desglose ? detalle.titulo : undefined}
        pie={<AppButton title="Cerrar" variant="secondary" onPress={() => setDetalle(null)} />}
      >
        {detalle?.desglose ? (
          <>
            {detalle.desglose.map((item) => (
              <View key={item.label} style={styles.filaDesglose}>
                <AppText variant="caption" tone="secondary">
                  {item.label}
                </AppText>
                <AppText variant="subtitle2">{`${item.value ?? 0} días`}</AppText>
              </View>
            ))}
            <AppText variant="caption" tone="secondary">{`Total: ${totalDesglose} días`}</AppText>
          </>
        ) : null}
        {detalle?.ayuda ? <AppText variant="caption">{detalle.ayuda}</AppText> : null}
      </AppModal>
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
      gap: spacing.md,
      ...platformSpecific.shadow(1),
    },
    encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
    titulos: { flex: 1, gap: spacing.xxs },
    disponibles: { alignItems: 'center' },
    tarjetas: { gap: spacing.md },
    tarjeta: {
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      borderWidth: 1.5,
      borderColor: c.borderLight,
    },
    iconos: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    valor: { color: c.primary },
    centrado: { textAlign: 'center' },
    pista: { textAlign: 'center', fontStyle: 'italic' },
    barra: {
      flexDirection: 'row',
      height: 10,
      borderRadius: borderRadius.round,
      overflow: 'hidden',
      backgroundColor: c.surfaceSecondary,
    },
    referencias: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    referencia: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    punto: { width: 8, height: 8, borderRadius: borderRadius.round },
    filaDesglose: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  });
