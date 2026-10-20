// Pestaña "Autor/es" del modal de producción científica. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/resultados-impacto-i+d/produccion-cientifica/modales/ModalProduccionCientifica.tsx
// (grilla de autores) y columns/investigacion/columnsAutoresProduccionCientifica.tsx.
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { eliminarAutor } from '../../../application/perfil/resultadosService';
import { mensajeDeErrorDeBaja } from '../../../config/api/apiError';
import {
  PARTICIPANTE_APROBADO,
  PARTICIPANTE_RECHAZADO,
  type Autor,
  type Produccion,
} from '../../../domain/perfil/produccionCientifica';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
import { InfoAlert } from '../InfoAlert';
import { EstadoChip } from '../licencias/EstadoChip';
import { TarjetaSolicitud } from '../licencias/TarjetaSolicitud';
import { ModalAutor } from './ModalAutor';

interface Props {
  produccion: Produccion;
  autores: Autor[];
  cargando: boolean;
  error: boolean;
  /** Se puede dar de alta un autor. */
  puedeAgregar: boolean;
  /** El empleado administra los autores (creador de la producción, sin restricciones del estado de su participación). */
  esCreador: boolean;
  /** Participación inactiva o rechazada: solo se puede ver. */
  soloLectura: boolean;
  mensajeError: string;
  onRecargar: () => void;
}

type ModalAbierto = { modo: 'nuevo' | 'editar' | 'ver'; autor?: Autor } | null;

export const AutoresDeProduccion: React.FC<Props> = ({
  produccion,
  autores,
  cargando,
  error,
  puedeAgregar,
  esCreador,
  soloLectura,
  mensajeError,
  onRecargar,
}) => {
  const [modal, setModal] = useState<ModalAbierto>(null);
  const [aEliminar, setAEliminar] = useState<Autor | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const confirmarEliminacion = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await eliminarAutor(aEliminar.id);
      toast.dismiss(idToast);
      toast.success('Autor eliminado con éxito.');
      setAEliminar(null);
      onRecargar();
    } catch (e) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorDeBaja(e, 'Error al eliminar el Autor.'));
    } finally {
      setEliminando(false);
    }
  };

  return (
    <View style={styles.contenido}>
      {error ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">{mensajeError}</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={onRecargar} loading={cargando} />
        </View>
      ) : null}

      {puedeAgregar ? (
        <AppButton title="Agregar autor" icon="add-circle-outline" onPress={() => setModal({ modo: 'nuevo' })} />
      ) : null}

      {cargando && autores.length === 0 ? (
        <View style={styles.vacio}>
          <ActivityIndicator />
        </View>
      ) : autores.length === 0 ? (
        <View style={styles.vacio}>
          <AppText variant="body2" tone="secondary">
            Todavía no hay autores cargados.
          </AppText>
        </View>
      ) : (
        <View style={styles.lista}>
          {autores.map((a) => {
            const editable = esCreador && !soloLectura && (a.statuscode === PARTICIPANTE_APROBADO || a.statuscode === PARTICIPANTE_RECHAZADO);
            const eliminable = esCreador && !soloLectura;
            return (
              <TarjetaSolicitud
                key={a.id}
                titulo={a.nombreYApellido || a.colaboradorNombre || '—'}
                estado={a.estadoTexto ? <EstadoChip texto={a.estadoTexto} /> : undefined}
                lineas={[
                  { label: 'Lugar de Trabajo', valor: a.lugarTrabajo?.label ?? '' },
                  { label: 'Orden de Autor', valor: a.orden },
                ]}
                acciones={
                  <>
                    <AccionIcono icono="eye-outline" etiqueta="Ver" onPress={() => setModal({ modo: 'ver', autor: a })} />
                    {editable ? (
                      <AccionIcono
                        icono="create-outline"
                        etiqueta="Editar"
                        onPress={() => setModal({ modo: 'editar', autor: a })}
                      />
                    ) : null}
                    {eliminable ? (
                      <AccionIcono icono="trash-outline" etiqueta="Eliminar" peligro onPress={() => setAEliminar(a)} />
                    ) : null}
                  </>
                }
              />
            );
          })}
        </View>
      )}

      {modal ? (
        <ModalAutor
          modo={modal.modo}
          produccion={produccion}
          autor={modal.autor}
          esCreador={esCreador}
          onClose={() => setModal(null)}
          onGuardado={onRecargar}
        />
      ) : null}

      <ConfirmDialog
        visible={aEliminar !== null}
        titulo="Eliminar Autor/es"
        textoConfirmar="Eliminar"
        textoConfirmando="Eliminando..."
        confirmando={eliminando}
        peligroso
        onCancelar={() => setAEliminar(null)}
        onConfirmar={() => void confirmarEliminacion()}
      >
        ¿Está seguro que desea eliminar este autor de la producción?
      </ConfirmDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  contenido: { gap: spacing.md },
  aviso: { gap: spacing.sm },
  lista: { gap: spacing.md },
  vacio: { alignItems: 'center', paddingVertical: spacing.lg },
});
