// "Más info" de un resultado vinculado a un proyecto: abre el registro vinculado en su modal de solo lectura.
// Port de Portal-Austral-Dev -> hooks/investigacion-perfil/useGetMasInfoEntidad.ts y del manejo de masInfoTipo en
// ModalProyectosInvestigacion. Los tipos cuyo módulo todavía no está migrado (producción científica, jornadas y
// estancias) muestran los datos de la vinculación.
import React from 'react';
import { View } from 'react-native';
import type { MasInfoResultado } from '../../../application/perfil/proyectosService';
import type { ConfigResultado, ResultadoVinculado } from '../../../domain/perfil/resultadosProyecto';
import { FilaDato } from '../legajo/FilaDato';
import { InfoAlert } from '../InfoAlert';
import { ModalDireccion } from './ModalDireccion';
import { ModalFinanciamientoExterno } from './ModalFinanciamientoExterno';
import { ModalFinanciamientoPropio } from './ModalFinanciamientoPropio';
import { ModalPerfil } from './ModalPerfil';
import { ModalTesista } from './ModalTesista';

interface Props {
  config: ConfigResultado;
  resultado: ResultadoVinculado;
  /** Registro vinculado ya leído; null si ese tipo no tiene visor. */
  datos: MasInfoResultado | null;
  onClose: () => void;
}

export const ModalMasInfoResultado: React.FC<Props> = ({ config, resultado, datos, onClose }) => {
  if (datos) {
    switch (datos.visor) {
      case 'propio':
        return <ModalFinanciamientoPropio modo="ver" item={datos.item} onClose={onClose} />;
      case 'externo':
        return <ModalFinanciamientoExterno modo="ver" item={datos.item} onClose={onClose} />;
      case 'tesistas':
        return <ModalTesista modo="ver" item={datos.item} onClose={onClose} />;
      case 'direccion':
        return <ModalDireccion modo="ver" item={datos.item} onClose={onClose} />;
      default:
        break;
    }
  }

  return (
    <ModalPerfil
      modo="ver"
      titulo={config.nombre}
      subtituloNuevo="Información de la vinculación"
      subtituloEditar="Información de la vinculación"
      onClose={onClose}
    >
      <View style={{ gap: 8 }}>
        <FilaDato label={config.etiquetaTitulo} valor={resultado.titulo.label} />
        <FilaDato label="Vinculado Por" valor={resultado.vinculadoPor} />
        <FilaDato label="Fecha de vinculación" valor={resultado.fechaVinculacion} />
        <InfoAlert tipo="info">Para ver el detalle completo, ingresá a Resultados / Impacto I+D.</InfoAlert>
      </View>
    </ModalPerfil>
  );
};
