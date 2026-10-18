// Vista de un cargo en gestión académica Austral. En el portal es solo lectura (el modal no tiene acción de guardado).
// Port de Portal-Austral-Dev -> perfil/_components/gestion-academica/modales/ModalCargosGestion.tsx.
import React from 'react';
import { View } from 'react-native';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import type { CargoGestion } from '../../../domain/perfil/gestionAcademica';
import { FilaDato } from '../legajo/FilaDato';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  item?: CargoGestion;
  onClose: () => void;
}

export const ModalCargoGestion: React.FC<Props> = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <ModalPerfil
      modo="ver"
      titulo="Cargos en gestión académica Austral"
      subtituloNuevo="Información del cargo"
      subtituloEditar="Modifica la información del cargo"
      onClose={onClose}
    >
      <View style={{ gap: 8 }}>
        <FilaDato label="Cargo" valor={item.cargo} />
        <FilaDato label="Unidad Académica / Instituto / Área" valor={item.unidadAcademica} />
        <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
        <FilaDato label="Fecha de finalización" valor={aFechaVisible(item.fechaFin)} />
      </View>
    </ModalPerfil>
  );
};
