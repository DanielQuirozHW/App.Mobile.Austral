// Bloque "Motivo de rechazo" + Aprobar / Rechazar + confirmación. Port de la lógica común de
// Portal-Austral-Dev -> ModalLicenciasEquipo y ModalAprobarVacacion:
//  - Aprobar vacía el motivo y abre la confirmación.
//  - Rechazar habilita el campo del motivo y exige completarlo antes de abrir la confirmación.
//  - Confirmación: "¿Desea aprobar/rechazar esta licencia?" con Si / No.
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { AppTextField } from '../AppTextField';
import { ConfirmDialog } from '../ConfirmDialog';

interface RespuestaLiderProps {
  /** false: se muestra el motivo en solo lectura y no hay botones. */
  puedeResponder: boolean;
  maxMotivo: number;
  /** Devuelve el mensaje de error o null si el motivo es válido. */
  validarMotivo: (motivo: string) => string | null;
  /** Muestra "N caracter(es) restantes" (así lo hace el modal de vacaciones). */
  mostrarContador?: boolean;
  onResponder: (aprobar: boolean, motivo: string) => Promise<boolean>;
  /** Se llama cuando la respuesta se completó (para cerrar el modal). */
  onTerminado: () => void;
}

type Pendiente = 'aprobar' | 'rechazar' | null;

export const RespuestaLider: React.FC<RespuestaLiderProps> = ({
  puedeResponder,
  maxMotivo,
  validarMotivo,
  mostrarContador = false,
  onResponder,
  onTerminado,
}) => {
  const [motivo, setMotivo] = useState('');
  const [rechazando, setRechazando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState<Pendiente>(null);
  const [enviando, setEnviando] = useState(false);

  const aprobar = () => {
    setMotivo('');
    setRechazando(false);
    setError(null);
    setPendiente('aprobar');
  };

  const rechazar = () => {
    setRechazando(true);
    const mensaje = validarMotivo(motivo);
    setError(mensaje);
    if (!mensaje) setPendiente('rechazar');
  };

  const confirmar = async () => {
    if (!pendiente) return;
    setEnviando(true);
    const ok = await onResponder(pendiente === 'aprobar', motivo);
    setEnviando(false);
    if (ok) {
      setPendiente(null);
      onTerminado();
    }
  };

  return (
    <View style={styles.bloque}>
      <AppTextField
        label="Motivo de rechazo"
        value={motivo}
        onChangeText={(texto) => {
          setMotivo(texto);
          if (error) setError(validarMotivo(texto));
        }}
        multiline
        numberOfLines={3}
        maxLength={maxMotivo}
        editable={puedeResponder && rechazando && !enviando}
        error={error ?? undefined}
        helperText={mostrarContador ? `${maxMotivo - motivo.length} caracter(es) restantes` : undefined}
      />

      {puedeResponder ? (
        <View style={styles.botones}>
          <View style={styles.boton}>
            <AppButton title="Aprobar" icon="checkmark-circle-outline" onPress={aprobar} disabled={enviando} />
          </View>
          <View style={styles.boton}>
            <AppButton title="Rechazar" variant="danger" icon="close-circle-outline" onPress={rechazar} disabled={enviando} />
          </View>
        </View>
      ) : null}

      <ConfirmDialog
        visible={pendiente !== null}
        titulo="Confirmación"
        textoCancelar="No"
        textoConfirmar="Si"
        textoConfirmando="Procesando..."
        confirmando={enviando}
        peligroso={pendiente === 'rechazar'}
        onCancelar={() => setPendiente(null)}
        onConfirmar={confirmar}
      >
        <AppText variant="body1">
          {pendiente === 'aprobar' ? '¿Desea aprobar esta licencia?' : '¿Desea rechazar esta licencia?'}
        </AppText>
      </ConfirmDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  bloque: { gap: spacing.md },
  botones: { flexDirection: 'row', gap: spacing.md },
  boton: { flex: 1 },
});
