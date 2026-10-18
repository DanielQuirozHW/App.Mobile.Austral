// Port de Portal-Austral-Dev -> ModalLicenciasEquipo.tsx (vista del aprobador).
// Aprobar / Rechazar solo si el usuario es el aprobador 1, la licencia está en un estado a responder y,
// cuando el certificado es obligatorio diferido (y no requiere validación), ya hay adjuntos cargados.
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { responderLicencia } from '../../../application/licencias/licenciasService';
import { ESTADOS_LICENCIA_A_RESPONDER } from '../../../domain/licencias/estados';
import type { Licencia } from '../../../domain/licencias/tipos';
import { validarMotivoRechazoLicencia } from '../../../domain/licencias/validaciones';
import { useAuthStore } from '../../stores/authStore';
import { spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppModal } from '../AppModal';
import { FilaDato } from '../legajo/FilaDato';
import { DomicilioDeclarado } from './DomicilioDeclarado';
import { ListaAdjuntosLicencia } from './ListaAdjuntosLicencia';
import { Pestanias } from './Pestanias';
import { RespuestaLider } from './RespuestaLider';
import { useAdjuntosDeLicencia } from './useAdjuntosDeLicencia';

interface ModalLicenciaEquipoProps {
  visible: boolean;
  licencia: Licencia | null;
  onClose: () => void;
}

type Pestania = 'licencia' | 'adjuntos';

const CERT_DIFERIDO = 2;
/** requiereValidacion === 100000000 significa "No" requiere validación. */
const NO_REQUIERE_VALIDACION = 100000000;

const Contenido: React.FC<{ licencia: Licencia; onClose: () => void }> = ({ licencia, onClose }) => {
  const empleadoId = useAuthStore((s) => s.user?.empleadoid);
  const [pestania, setPestania] = useState<Pestania>('licencia');
  const { adjuntos, cargando, fallo } = useAdjuntosDeLicencia(licencia.id);

  const tieneAdjuntosRequerido =
    licencia.certificadoObligatorio === CERT_DIFERIDO && licencia.requiereValidacion !== NO_REQUIERE_VALIDACION
      ? adjuntos.length > 0
      : true;
  const puedeResponder =
    Boolean(empleadoId) &&
    licencia.idAprobador1 === empleadoId &&
    tieneAdjuntosRequerido &&
    ESTADOS_LICENCIA_A_RESPONDER.includes(licencia.estado);

  return (
    <>
      <Pestanias
        items={[
          { clave: 'licencia', etiqueta: 'Licencia' },
          { clave: 'adjuntos', etiqueta: 'Adjuntos' },
        ]}
        activa={pestania}
        onCambiar={setPestania}
      />

      {pestania === 'licencia' ? (
        <View style={styles.campos}>
          <FilaDato label="Tipo de licencia" valor={licencia.tipoLicencia} />
          <FilaDato label="Empleado" valor={licencia.empleado} />
          <FilaDato label="Días solicitados" valor={String(licencia.diasSolicitados)} />
          <FilaDato label="Fecha desde" valor={licencia.fechaDesde} />
          <FilaDato label="Fecha hasta" valor={licencia.fechaHasta} />
          {licencia.esMudanza ? <DomicilioDeclarado domicilio={licencia.domicilio} /> : null}
          <RespuestaLider
            puedeResponder={puedeResponder}
            maxMotivo={300}
            validarMotivo={validarMotivoRechazoLicencia}
            onResponder={(aprobar, motivo) => responderLicencia(licencia, aprobar, motivo)}
            onTerminado={onClose}
          />
        </View>
      ) : (
        <ListaAdjuntosLicencia licenciaId={licencia.id} adjuntos={adjuntos} cargando={cargando} fallo={fallo} />
      )}
    </>
  );
};

export const ModalLicenciaEquipo: React.FC<ModalLicenciaEquipoProps> = ({ visible, licencia, onClose }) => {
  const esAprobacion = licencia ? ESTADOS_LICENCIA_A_RESPONDER.includes(licencia.estado) : false;
  return (
    <AppModal
      visible={visible && licencia !== null}
      onClose={onClose}
      titulo={esAprobacion ? 'Aprobación' : (licencia?.tipoLicencia ?? 'Licencia')}
      subtitulo="Revisá y gestioná la licencia del equipo"
      altaCompleta
      pie={<AppButton title="Cancelar" variant="secondary" onPress={onClose} />}
    >
      {licencia ? <Contenido key={licencia.id} licencia={licencia} onClose={onClose} /> : null}
    </AppModal>
  );
};

const styles = StyleSheet.create({
  campos: { gap: spacing.lg },
});
