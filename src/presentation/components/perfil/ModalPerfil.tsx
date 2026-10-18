// Marco común de los modales de Perfil (alta, edición y vista). Port del patrón de los modales del portal:
// el fondo no cierra con cambios sin guardar (se pide confirmación), pie Cancelar / GUARDAR y, en la vista, solo "Cerrar".
import React, { useState } from 'react';
import { AppButton } from '../AppButton';
import { AppModal } from '../AppModal';
import { ConfirmDialog } from '../ConfirmDialog';
import type { Modo } from '../../../domain/perfil/comun';

interface ModalPerfilProps {
  modo: Modo;
  titulo: string;
  subtituloNuevo: string;
  subtituloEditar: string;
  onClose: () => void;
  /** El formulario tiene cambios sin guardar. */
  hayCambios?: boolean;
  guardando?: boolean;
  onGuardar?: () => void;
  textoGuardar?: string;
  children: React.ReactNode;
}

export const ModalPerfil: React.FC<ModalPerfilProps> = ({
  modo,
  titulo,
  subtituloNuevo,
  subtituloEditar,
  onClose,
  hayCambios = false,
  guardando = false,
  onGuardar,
  textoGuardar = 'GUARDAR',
  children,
}) => {
  const [confirmandoCierre, setConfirmandoCierre] = useState(false);

  if (modo === 'ver') {
    return (
      <AppModal
        visible
        onClose={onClose}
        titulo={titulo}
        subtitulo="Solo lectura · podés editar para modificar"
        pie={<AppButton title="Cerrar" variant="secondary" onPress={onClose} />}
      >
        {children}
      </AppModal>
    );
  }

  const pedirCierre = () => {
    if (guardando) return;
    if (hayCambios) setConfirmandoCierre(true);
    else onClose();
  };

  return (
    <>
      <AppModal
        visible
        onClose={pedirCierre}
        titulo={titulo}
        subtitulo={modo === 'nuevo' ? subtituloNuevo : subtituloEditar}
        cerrable={!guardando}
        altaCompleta
        pie={
          <>
            <AppButton title="Cancelar" variant="secondary" onPress={pedirCierre} disabled={guardando} />
            <AppButton title={textoGuardar} onPress={() => onGuardar?.()} loading={guardando} />
          </>
        }
      >
        {children}
      </AppModal>
      <ConfirmDialog
        visible={confirmandoCierre}
        titulo="¿Descartar los cambios?"
        textoCancelar="Seguir editando"
        textoConfirmar="Descartar"
        peligroso
        onCancelar={() => setConfirmandoCierre(false)}
        onConfirmar={() => {
          setConfirmandoCierre(false);
          onClose();
        }}
      >
        Tenés cambios sin guardar. Si cerrás ahora, se van a perder.
      </ConfirmDialog>
    </>
  );
};
