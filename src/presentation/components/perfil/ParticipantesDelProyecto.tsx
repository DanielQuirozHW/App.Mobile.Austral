// Pestaña "Participantes" del modal de un proyecto de investigación. Port de la tabla de participantes de
// ModalProyectosInvestigacion y de columns/investigacion/columnsParticipantesProyecto.tsx.
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { eliminarParticipante } from '../../../application/perfil/proyectosService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import type { Modo } from '../../../domain/perfil/comun';
import { puedeEliminarParticipante, type Participante } from '../../../domain/perfil/proyectos';
import { useAuthStore } from '../../stores/authStore';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
import { InfoAlert } from '../InfoAlert';
import { EstadoChip } from '../licencias/EstadoChip';
import { TarjetaSolicitud } from '../licencias/TarjetaSolicitud';
import { ModalParticipante, type ProyectoDelParticipante } from './ModalParticipante';

interface Props {
  proyecto: ProyectoDelParticipante;
  participantes: Participante[];
  cargando: boolean;
  error: boolean;
  /** El proyecto está en solo lectura: la lista solo permite ver. */
  deshabilitado: boolean;
  esCreadorDelProyecto: boolean;
  onRecargar: () => void;
}

export const ParticipantesDelProyecto: React.FC<Props> = ({
  proyecto,
  participantes,
  cargando,
  error,
  deshabilitado,
  esCreadorDelProyecto,
  onRecargar,
}) => {
  const empleadoId = useAuthStore((s) => s.user?.empleadoid) ?? '';
  const [modal, setModal] = useState<{ modo: Modo; item?: Participante } | null>(null);
  const [aEliminar, setAEliminar] = useState<Participante | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const confirmarEliminacion = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await eliminarParticipante(aEliminar.id);
      toast.dismiss(idToast);
      toast.success('Participante eliminado con éxito.');
      setAEliminar(null);
      onRecargar();
    } catch (e) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(e, 'Error al eliminar Participante, por favor intente nuevamente.'));
    } finally {
      setEliminando(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      {error ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">No pudimos cargar los participantes. Por favor, volvé a intentar.</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={onRecargar} loading={cargando} />
        </View>
      ) : null}

      {!deshabilitado ? (
        <AppButton title="Agregar participante" icon="add-circle-outline" onPress={() => setModal({ modo: 'nuevo' })} />
      ) : null}

      {participantes.length === 0 ? (
        <View style={styles.vacio}>
          <AppText variant="body2" tone="secondary">
            {cargando ? 'Cargando participantes...' : 'Todavía no hay participantes en este proyecto.'}
          </AppText>
        </View>
      ) : (
        <View style={styles.lista}>
          {participantes.map((p) => (
            <TarjetaSolicitud
              key={p.id}
              titulo={p.nombreApellido.label || '—'}
              estado={<EstadoChip texto={p.estado} />}
              lineas={[
                { label: 'Lugar de trabajo', valor: p.lugarTrabajo.label ?? '' },
                { label: 'Rol', valor: p.rol.label ?? '' },
              ]}
              acciones={
                <>
                  <AccionIcono icono="eye-outline" etiqueta="Ver" onPress={() => setModal({ modo: 'ver', item: p })} />
                  {!deshabilitado ? (
                    <>
                      <AccionIcono
                        icono="create-outline"
                        etiqueta="Editar"
                        onPress={() => setModal({ modo: 'editar', item: p })}
                      />
                      {puedeEliminarParticipante(p, esCreadorDelProyecto, empleadoId) ? (
                        <AccionIcono icono="trash-outline" etiqueta="Eliminar" peligro onPress={() => setAEliminar(p)} />
                      ) : null}
                    </>
                  ) : null}
                </>
              }
            />
          ))}
        </View>
      )}

      {modal ? (
        <ModalParticipante
          modo={modal.modo}
          item={modal.item}
          proyecto={proyecto}
          onClose={() => setModal(null)}
          onGuardado={onRecargar}
        />
      ) : null}

      <ConfirmDialog
        visible={aEliminar !== null}
        titulo="Confirmar eliminación"
        textoConfirmar="Eliminar"
        textoConfirmando="Eliminando..."
        confirmando={eliminando}
        peligroso
        onCancelar={() => setAEliminar(null)}
        onConfirmar={confirmarEliminacion}
      >
        ¿Está seguro de que desea eliminar este participante? Esta acción no se puede deshacer.
      </ConfirmDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { gap: spacing.md },
  aviso: { gap: spacing.sm },
  lista: { gap: spacing.md },
  vacio: { alignItems: 'center', paddingVertical: spacing.lg },
});
