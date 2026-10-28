// Port de Portal-Austral-Dev -> ModalAprobarVacacion.tsx ("Aprobación" / "Revisá y gestioná la vacación del equipo").
// Los botones solo aparecen si el usuario es a quien reporta la solicitud (reportaA).
import React from 'react';
import { responderVacacion } from '../../../application/licencias/licenciasService';
import type { SolicitudDeEquipo } from '../../../domain/licencias/tipos';
import {
  MAX_MOTIVO_VACACION,
  validarMotivoRechazoVacacion,
} from '../../../domain/licencias/validaciones';
import { useAuthStore } from '../../stores/authStore';
import { AppButton } from '../AppButton';
import { AppModal } from '../AppModal';
import { FilaDato } from '../legajo/FilaDato';
import { RespuestaLider } from './RespuestaLider';

interface ModalAprobarVacacionProps {
  visible: boolean;
  solicitud: SolicitudDeEquipo | null;
  onClose: () => void;
}

const Contenido: React.FC<{ solicitud: SolicitudDeEquipo; onClose: () => void }> = ({ solicitud, onClose }) => {
  const empleadoId = useAuthStore((s) => s.user?.empleadoid);
  const puedeResponder = Boolean(empleadoId) && solicitud.reportaA === empleadoId;
  return (
    <>
      <FilaDato label="Tipo de Licencia" valor={solicitud.tipoDeLicencia.label || 'VACACIONES'} />
      <FilaDato label="Fecha de solicitud" valor={solicitud.fechaSolicitud} />
      <FilaDato label="Fecha desde" valor={solicitud.fechaDesde} />
      <FilaDato label="Fecha hasta" valor={solicitud.fechaHasta} />
      <FilaDato label="Días solicitados" valor={String(solicitud.diasSolicitados)} />
      {solicitud.comentarios ? <FilaDato label="Comentarios" valor={solicitud.comentarios} /> : null}
      <RespuestaLider
        puedeResponder={puedeResponder}
        maxMotivo={MAX_MOTIVO_VACACION}
        motivoInicial={solicitud.motivoRechazo}
        validarMotivo={validarMotivoRechazoVacacion}
        mostrarContador
        onResponder={(aprobar, motivo) => responderVacacion(solicitud, aprobar, motivo)}
        onTerminado={onClose}
      />
    </>
  );
};

export const ModalAprobarVacacion: React.FC<ModalAprobarVacacionProps> = ({ visible, solicitud, onClose }) => (
  <AppModal
    visible={visible && solicitud !== null}
    onClose={onClose}
    titulo="Aprobación"
    subtitulo="Revisá y gestioná la vacación del equipo"
    altaCompleta
    pie={<AppButton title="Cancelar" variant="secondary" onPress={onClose} />}
  >
    {solicitud ? <Contenido key={solicitud.id} solicitud={solicitud} onClose={onClose} /> : null}
  </AppModal>
);
