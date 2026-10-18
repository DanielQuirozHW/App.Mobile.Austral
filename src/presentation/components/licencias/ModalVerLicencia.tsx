// Port de Portal-Austral-Dev -> ModalLicencias.tsx (vista propia: "Licencia", "Solo lectura"), con pestañas
// Licencia / Adjuntos y envío de certificado cuando el estado lo permite.
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { enviarCertificado } from '../../../application/licencias/licenciasService';
import { ESTADO, puedeAdjuntarCertificado } from '../../../domain/licencias/estados';
import type { Licencia } from '../../../domain/licencias/tipos';
import type { ArchivoElegido } from '../../../infrastructure/archivos/seleccionArchivos';
import { spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppModal } from '../AppModal';
import { FilaDato } from '../legajo/FilaDato';
import { DomicilioDeclarado } from './DomicilioDeclarado';
import { ListaAdjuntosLicencia } from './ListaAdjuntosLicencia';
import { Pestanias } from './Pestanias';
import { SelectorArchivos } from './SelectorArchivos';
import { useAdjuntosDeLicencia } from './useAdjuntosDeLicencia';

interface ModalVerLicenciaProps {
  visible: boolean;
  licencia: Licencia | null;
  onClose: () => void;
}

type Pestania = 'licencia' | 'adjuntos';

const Contenido: React.FC<{ licencia: Licencia; onClose: () => void }> = ({ licencia, onClose }) => {
  const [pestania, setPestania] = useState<Pestania>('licencia');
  const [archivos, setArchivos] = useState<ArchivoElegido[]>([]);
  const [enviando, setEnviando] = useState(false);
  const { adjuntos, cargando, fallo } = useAdjuntosDeLicencia(licencia.id);

  const enviar = async () => {
    setEnviando(true);
    const ok = await enviarCertificado(licencia, archivos);
    setEnviando(false);
    if (ok) onClose();
  };

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
          {licencia.estado === ESTADO.NO_APROBADA ? (
            <FilaDato label="Motivo de rechazo" valor={licencia.motivoRechazo} />
          ) : null}

          {puedeAdjuntarCertificado(licencia.estado) ? (
            <View style={styles.certificado}>
              <SelectorArchivos archivos={archivos} onChange={setArchivos} disabled={enviando} />
              <AppButton
                title={enviando ? 'Enviando...' : 'Enviar certificado'}
                icon="cloud-upload-outline"
                onPress={enviar}
                loading={enviando}
                disabled={enviando || archivos.length === 0}
              />
            </View>
          ) : null}
        </View>
      ) : (
        <ListaAdjuntosLicencia licenciaId={licencia.id} adjuntos={adjuntos} cargando={cargando} fallo={fallo} />
      )}
    </>
  );
};

export const ModalVerLicencia: React.FC<ModalVerLicenciaProps> = ({ visible, licencia, onClose }) => (
  <AppModal
    visible={visible && licencia !== null}
    onClose={onClose}
    titulo="Licencia"
    subtitulo="Solo lectura"
    altaCompleta
    pie={<AppButton title="Cancelar" variant="secondary" onPress={onClose} />}
  >
    {licencia ? <Contenido key={licencia.id} licencia={licencia} onClose={onClose} /> : null}
  </AppModal>
);

const styles = StyleSheet.create({
  campos: { gap: spacing.lg },
  certificado: { gap: spacing.md },
});
