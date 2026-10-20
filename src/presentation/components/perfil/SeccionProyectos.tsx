// Sección "Proyectos de investigación" de Perfil > Investigación > Actividad I+D. Port de Portal-Austral-Dev ->
// perfil/investigacion/actividad-i+d/proyectos-investigacion/page.tsx y columns/investigacion/columnsProyectos.tsx.
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { eliminarProyecto } from '../../../application/perfil/proyectosService';
import { mensajeDeErrorDeBaja } from '../../../config/api/apiError';
import {
  esPendienteDeRespuesta,
  puedeEditarProyecto,
  puedeEliminarProyecto,
  type ModoProyecto,
  type Proyecto,
} from '../../../domain/perfil/proyectos';
import { useProyectosStore } from '../../stores/proyectosStore';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
import { EstadoChip } from '../licencias/EstadoChip';
import { TarjetaSolicitud } from '../licencias/TarjetaSolicitud';
import { SeccionCard } from '../SeccionCard';
import { ModalProyecto } from './ModalProyecto';

export const SeccionProyectos: React.FC = () => {
  const proyectos = useProyectosStore((s) => s.proyectos);
  const [modal, setModal] = useState<{ modo: ModoProyecto; item?: Proyecto } | null>(null);
  const [aEliminar, setAEliminar] = useState<Proyecto | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const confirmarEliminacion = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await eliminarProyecto(aEliminar.id);
      toast.dismiss(idToast);
      toast.success('Proyecto eliminado con éxito.');
      setAEliminar(null);
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorDeBaja(error, 'Error al eliminar Proyecto.'));
    } finally {
      setEliminando(false);
    }
  };

  return (
    <SeccionCard
      numero={1}
      titulo="Proyectos de investigación"
      descripcion="Aquí podrá visualizar la información relacionada a los proyectos de investigación."
    >
      <AppButton title="Agregar proyecto" icon="add-circle-outline" onPress={() => setModal({ modo: 'nuevo' })} />

      {proyectos.length === 0 ? (
        <View style={styles.vacio}>
          <AppText variant="body2" tone="secondary">
            Todavía no tenés proyectos de investigación.
          </AppText>
        </View>
      ) : (
        <View style={styles.lista}>
          {proyectos.map((p) => (
            <TarjetaSolicitud
              key={p.id}
              titulo={p.tituloProyecto || '—'}
              subtitulo={p.areaDisciplinar.label || undefined}
              estado={p.statuscode.label ? <EstadoChip texto={String(p.statuscode.label)} /> : undefined}
              lineas={[
                { label: 'Sede de ejecución principal', valor: p.sedeEjecucionPrincipal.label ?? '' },
                { label: 'Código', valor: p.codigo },
                { label: 'Rol', valor: p.rolParticipante.label ?? '' },
                { label: 'Estado participante', valor: p.estadoParticipacion.label ?? '' },
                { label: 'Creador Proyecto', valor: p.esCreador ? 'Si' : 'No' },
              ]}
              acciones={
                esPendienteDeRespuesta(p) ? (
                  <AppButton title="Responder" variant="secondary" onPress={() => setModal({ modo: 'responder', item: p })} />
                ) : (
                  <>
                    <AccionIcono icono="eye-outline" etiqueta="Ver" onPress={() => setModal({ modo: 'ver', item: p })} />
                    {puedeEditarProyecto(p) ? (
                      <AccionIcono
                        icono="create-outline"
                        etiqueta="Editar"
                        onPress={() => setModal({ modo: 'editar', item: p })}
                      />
                    ) : null}
                    {puedeEliminarProyecto(p) ? (
                      <AccionIcono icono="trash-outline" etiqueta="Eliminar" peligro onPress={() => setAEliminar(p)} />
                    ) : null}
                  </>
                )
              }
            />
          ))}
        </View>
      )}

      {modal ? <ModalProyecto modo={modal.modo} item={modal.item} onClose={() => setModal(null)} /> : null}

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
        ¿Está seguro de que desea eliminar este proyecto de investigación? Esta acción no se puede deshacer.
      </ConfirmDialog>
    </SeccionCard>
  );
};

const styles = StyleSheet.create({
  lista: { gap: spacing.md },
  vacio: { alignItems: 'center', paddingVertical: spacing.lg },
});
