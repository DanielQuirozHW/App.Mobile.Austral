// Vista de solo lectura de un registro que carga el back office (categorización, nombramiento, promoción).
// Port de los modales ver-only de Portal-Austral-Dev -> perfil/_components/docencia/*.
import React from 'react';
import { View } from 'react-native';
import { FilaDato } from '../legajo/FilaDato';
import { ModalPerfil } from './ModalPerfil';

export interface FilaDeLectura {
  label: string;
  valor: string;
}

interface Props {
  titulo: string;
  subtitulo: string;
  filas: FilaDeLectura[];
  onClose: () => void;
}

export const ModalLectura: React.FC<Props> = ({ titulo, subtitulo, filas, onClose }) => (
  <ModalPerfil modo="ver" titulo={titulo} subtituloNuevo={subtitulo} subtituloEditar={subtitulo} onClose={onClose}>
    <View style={{ gap: 8 }}>
      {filas.map((f) => (
        <FilaDato key={f.label} label={f.label} valor={f.valor} />
      ))}
    </View>
  </ModalPerfil>
);
