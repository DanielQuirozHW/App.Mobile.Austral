// Port de Portal-Austral-Dev -> ModalCalendario.tsx: título "{tipo} — {empleado}", chip de estado, chip de días y
// líneas Empleado / Período / Solicitado el. Los feriados muestran su nombre y fecha.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colorDeEstadoCalendario, type EventoCalendario } from '../../../domain/licencias/calendario';
import { diaAVisible, diasInclusivos } from '../../../domain/licencias/fechasCrm';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppModal } from '../AppModal';
import { AppText } from '../AppText';
import { FilaDato } from '../legajo/FilaDato';

interface ModalDetalleCalendarioProps {
  visible: boolean;
  evento: EventoCalendario | null;
  onClose: () => void;
}

const Chip: React.FC<{ texto: string; fondo: string; colorTexto: string }> = ({ texto, fondo, colorTexto }) => (
  <View style={[styles.chip, { backgroundColor: fondo }]}>
    <AppText variant="caption" style={{ color: colorTexto, fontWeight: '600' }}>
      {texto}
    </AppText>
  </View>
);

export const ModalDetalleCalendario: React.FC<ModalDetalleCalendarioProps> = ({ visible, evento, onClose }) => {
  const { globalColors } = useThemeColors();
  const solicitud = evento?.solicitud ?? null;
  const dias = evento ? diasInclusivos(evento.desde, evento.hasta) : null;

  const titulo = !evento
    ? ''
    : evento.tipo === 'feriado'
      ? evento.titulo
      : `${solicitud?.tipoDeLicencia.label || 'VACACIONES'} — ${evento.empleadoName}`;

  return (
    <AppModal
      visible={visible && evento !== null}
      onClose={onClose}
      titulo={titulo}
      variante="centrado"
      pie={<AppButton title="Cerrar" variant="secondary" onPress={onClose} />}
    >
      {evento ? (
        evento.tipo === 'feriado' ? (
          <>
            <View style={styles.chips}>
              <Chip texto="Feriado" fondo={colorDeEstadoCalendario('Feriado')} colorTexto={globalColors.textInverse} />
            </View>
            <FilaDato label="Fecha" valor={diaAVisible(evento.desde)} />
          </>
        ) : (
          <>
            <View style={styles.chips}>
              {solicitud?.estadoName ? (
                <Chip
                  texto={solicitud.estadoName}
                  fondo={colorDeEstadoCalendario(solicitud.estadoName)}
                  colorTexto={globalColors.textInverse}
                />
              ) : null}
              {dias !== null ? (
                <Chip
                  texto={`${dias} ${dias === 1 ? 'día' : 'días'}`}
                  fondo={globalColors.surfaceSecondary}
                  colorTexto={globalColors.text}
                />
              ) : null}
            </View>
            <FilaDato label="Empleado:" valor={evento.empleadoName} />
            <FilaDato label="Período:" valor={`${diaAVisible(evento.desde)} al ${diaAVisible(evento.hasta)}`} />
            <FilaDato label="Solicitado el:" valor={solicitud?.fechaSolicitud} />
          </>
        )
      ) : null}
    </AppModal>
  );
};

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.round },
});
