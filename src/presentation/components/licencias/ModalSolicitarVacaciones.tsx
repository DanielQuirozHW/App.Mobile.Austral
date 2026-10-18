// Port de Portal-Austral-Dev -> ModalSolicitarVacaciones.tsx (mismos textos, notas y reglas).
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { solicitarVacaciones } from '../../../application/licencias/licenciasService';
import { diasInclusivos, hoyCrm } from '../../../domain/licencias/fechasCrm';
import type { PeriodoVacaciones } from '../../../domain/licencias/tipos';
import {
  MAX_COMENTARIOS_VACACIONES,
  validarSolicitudVacaciones,
  type Errores,
} from '../../../domain/licencias/validaciones';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppIcon } from '../AppIcon';
import { AppModal } from '../AppModal';
import { AppText } from '../AppText';
import { AppTextField } from '../AppTextField';
import { DateField } from '../form/DateField';
import { NotaInfo } from './NotaInfo';

interface ModalSolicitarVacacionesProps {
  visible: boolean;
  periodo: PeriodoVacaciones | null;
  onClose: () => void;
}

export const ModalSolicitarVacaciones: React.FC<ModalSolicitarVacacionesProps> = ({ visible, periodo, onClose }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  const [desde, setDesde] = useState<Date | null>(null);
  const [hasta, setHasta] = useState<Date | null>(null);
  const [comentarios, setComentarios] = useState('');
  const [detalle, setDetalle] = useState(false);
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDesde(null);
    setHasta(null);
    setComentarios('');
    setDetalle(false);
    setIntento(false);
    setEnviando(false);
  }, [visible]);

  const errores: Errores = useMemo(
    () => (periodo ? validarSolicitudVacaciones({ desde, hasta, comentarios }, periodo, hoyCrm()) : {}),
    [periodo, desde, hasta, comentarios],
  );
  const visibles: Errores = intento
    ? errores
    : { ...(errores.dias ? { dias: errores.dias } : {}), ...(errores.comentarios ? { comentarios: errores.comentarios } : {}) };

  if (!periodo) return null;
  const dias = diasInclusivos(desde, hasta);

  const enviar = async () => {
    setIntento(true);
    if (Object.keys(errores).length > 0 || !desde || !hasta) return;
    setEnviando(true);
    const ok = await solicitarVacaciones(periodo, { desde, hasta, comentarios });
    setEnviando(false);
    if (ok) onClose();
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      titulo="Solicitar nuevas vacaciones"
      subtitulo="Completá el formulario para enviar tu solicitud"
      cerrable={!enviando}
      altaCompleta
      pie={
        <>
          <AppButton title="Cancelar" variant="secondary" onPress={onClose} disabled={enviando} />
          <AppButton
            title={enviando ? 'Enviando...' : 'Enviar Solicitud'}
            onPress={enviar}
            loading={enviando}
            disabled={enviando || Boolean(errores.dias)}
          />
        </>
      }
    >
      <View style={styles.disponibles}>
        <View style={styles.disponiblesTextos}>
          <AppText variant="h6">{`${periodo.diasPendientesTotales} Días`}</AppText>
          <AppText variant="caption" tone="secondary">
            Disponibles
          </AppText>
        </View>
        <Pressable
          onPress={() => setDetalle((v) => !v)}
          hitSlop={spacing.sm}
          accessibilityRole="button"
          accessibilityLabel="Ver detalle de los días disponibles"
        >
          <AppIcon name="information-circle-outline" size={iconSizes.lg} color={globalColors.info} />
        </Pressable>
      </View>
      {detalle ? (
        <View style={styles.detalle}>
          <View style={styles.detalleFila}>
            <AppText variant="body2">Período Actual: Días correspondientes</AppText>
            <AppText variant="body2" style={styles.negrita}>
              {String(periodo.diasCorrespondientes)}
            </AppText>
          </View>
          <View style={styles.detalleFila}>
            <AppText variant="body2">Período Anterior: Días pendientes</AppText>
            <AppText variant="body2" style={styles.negrita}>
              {String(periodo.diasPendientesDelPeriodoAnterior)}
            </AppText>
          </View>
        </View>
      ) : null}

      <NotaInfo>
        {`Las vacaciones de este período pueden solicitarse para ser gozadas entre el ${periodo.fechaDesdePeriodo} y el ${periodo.fechaHastaPeriodo}. Tenés tiempo para realizar la solicitud hasta el ${periodo.fechaVencimientoPeriodo}.`}
      </NotaInfo>

      <AppTextField label="Tipo de Licencia" value="VACACIONES" editable={false} />

      <NotaInfo>
        Recordá que las vacaciones se inician un día lunes. Si ese lunes es feriado, el comienzo se traslada al
        siguiente día hábil.
      </NotaInfo>
      <NotaInfo>
        Recordá que las vacaciones se gozan de manera continua, incluyendo fines de semana y feriados, y finalizan el
        día previo al regreso a la actividad
      </NotaInfo>

      <DateField
        label="Fecha de inicio de vacaciones"
        required
        value={desde}
        onChange={setDesde}
        minimumDate={new Date()}
        error={visibles.desde}
        disabled={enviando}
      />
      <DateField
        label="Fecha fin de vacaciones"
        required
        value={hasta}
        onChange={setHasta}
        minimumDate={desde ?? new Date()}
        error={visibles.hasta}
        disabled={enviando}
      />
      <AppTextField
        label="Días Solicitados"
        value={dias === null ? '' : String(dias)}
        editable={false}
        error={visibles.dias}
        helperText={`Máximo ${periodo.diasPendientesTotales} días`}
      />
      <AppTextField
        label="Comentarios"
        value={comentarios}
        onChangeText={setComentarios}
        multiline
        numberOfLines={3}
        maxLength={MAX_COMENTARIOS_VACACIONES}
        error={visibles.comentarios}
        helperText={`${comentarios.length}/${MAX_COMENTARIOS_VACACIONES}`}
        editable={!enviando}
      />
    </AppModal>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    disponibles: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: borderRadius.card,
      backgroundColor: c.accentPrimaryMuted,
    },
    disponiblesTextos: { gap: spacing.xxs },
    detalle: {
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: borderRadius.md,
    },
    detalleFila: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
    negrita: { fontWeight: '600' },
  });
