import React from 'react';
import { AppButton } from './AppButton';
import { AppModal } from './AppModal';

interface ConfirmDialogProps {
  visible: boolean;
  titulo: string;
  /** Contenido del mensaje (puede llevar negritas). */
  children: React.ReactNode;
  textoCancelar?: string;
  textoConfirmar: string;
  /** Texto del botón confirmar mientras `confirmando` es true. */
  textoConfirmando?: string;
  confirmando?: boolean;
  /** true: el botón confirmar va en rojo (acciones que no se pueden deshacer). */
  peligroso?: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}

/** Diálogo de confirmación (Dialog con Cancelar / acción del portal). */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  titulo,
  children,
  textoCancelar = 'Cancelar',
  textoConfirmar,
  textoConfirmando,
  confirmando = false,
  peligroso = false,
  onCancelar,
  onConfirmar,
}) => (
  <AppModal
    visible={visible}
    onClose={onCancelar}
    titulo={titulo}
    variante="centrado"
    cerrable={!confirmando}
    pie={
      <>
        <AppButton title={textoCancelar} variant="secondary" onPress={onCancelar} disabled={confirmando} />
        <AppButton
          title={confirmando && textoConfirmando ? textoConfirmando : textoConfirmar}
          variant={peligroso ? 'danger' : 'primary'}
          onPress={onConfirmar}
          loading={confirmando}
        />
      </>
    }
  >
    {children}
  </AppModal>
);
