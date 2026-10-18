// Port de Portal-Austral-Dev -> ModalVerVacacion.tsx ("Vacación solicitada", "Solo lectura").
// Sirve para la vacación propia y para la del equipo: ambas se normalizan a DetalleVacacion.
import React from 'react';
import { StyleSheet } from 'react-native';
import type { SolicitudDeEquipo, VacacionPropia } from '../../../domain/licencias/tipos';
import { spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppModal } from '../AppModal';
import { FilaDato } from '../legajo/FilaDato';

export interface DetalleVacacion {
  tipo: string;
  fechaSolicitud: string;
  fechaDesde: string;
  fechaHasta: string;
  dias: number;
  motivoRechazo: string;
  comentarios: string;
}

export const detalleDeVacacionPropia = (v: VacacionPropia): DetalleVacacion => ({
  tipo: 'VACACIONES',
  fechaSolicitud: v.fechaSolicitud,
  fechaDesde: v.fechaDesde,
  fechaHasta: v.fechaHasta,
  dias: v.diasSolicitados,
  motivoRechazo: v.motivoRechazo,
  comentarios: '',
});

export const detalleDeSolicitud = (s: SolicitudDeEquipo): DetalleVacacion => ({
  tipo: s.tipoDeLicencia.label || 'VACACIONES',
  fechaSolicitud: s.fechaSolicitud,
  fechaDesde: s.fechaDesde,
  fechaHasta: s.fechaHasta,
  dias: s.diasSolicitados,
  motivoRechazo: s.motivoRechazo,
  comentarios: s.comentarios,
});

interface ModalVerVacacionProps {
  visible: boolean;
  detalle: DetalleVacacion | null;
  onClose: () => void;
}

export const ModalVerVacacion: React.FC<ModalVerVacacionProps> = ({ visible, detalle, onClose }) => (
  <AppModal
    visible={visible && detalle !== null}
    onClose={onClose}
    titulo="Vacación solicitada"
    subtitulo="Solo lectura"
    pie={<AppButton title="Cerrar" variant="secondary" onPress={onClose} />}
  >
    {detalle ? (
      <>
        <FilaDato label="Tipo de Licencia" valor={detalle.tipo} />
        <FilaDato label="Fecha de solicitud" valor={detalle.fechaSolicitud} />
        <FilaDato label="Fecha desde" valor={detalle.fechaDesde} />
        <FilaDato label="Fecha hasta" valor={detalle.fechaHasta} />
        <FilaDato label="Dias solicitados" valor={String(detalle.dias)} />
        {detalle.comentarios ? <FilaDato label="Comentarios" valor={detalle.comentarios} /> : null}
        {detalle.motivoRechazo ? <FilaDato label="Motivo de rechazo" valor={detalle.motivoRechazo} /> : null}
      </>
    ) : null}
  </AppModal>
);

export const estilosModalVerVacacion = StyleSheet.create({ separacion: { gap: spacing.lg } });
