// Sección "Producción científica" de Perfil > Investigación > Resultados / Impacto I+D. Port de Portal-Austral-Dev ->
// perfil/investigacion/resultados-impacto-i+d/produccion-cientifica/page.tsx y columns/investigacion/columnsProduccionCientifica.tsx.
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { eliminarProduccion } from '../../../application/perfil/resultadosService';
import { mensajeDeErrorDeBaja } from '../../../config/api/apiError';
import {
  accionesDeProduccion,
  ESTADO_AUTOR,
  PARTICIPANTE_INACTIVO,
  tituloDeProduccion,
  type ModoProduccion,
  type Produccion,
} from '../../../domain/perfil/produccionCientifica';
import { useResultadosStore } from '../../stores/resultadosStore';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
import { EstadoChip } from '../licencias/EstadoChip';
import { TarjetaSolicitud } from '../licencias/TarjetaSolicitud';
import { SeccionCard } from '../SeccionCard';
import { ModalProduccion } from './ModalProduccion';

const texto = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

const estadoDeParticipacion = (p: Produccion): string => {
  const st = p.participante?.statuscode;
  if (st === PARTICIPANTE_INACTIVO) return 'Inactivo';
  return ESTADO_AUTOR.find((x) => x.value === st)?.label ?? '';
};

export const SeccionProducciones: React.FC = () => {
  const producciones = useResultadosStore((s) => s.producciones);
  const [modal, setModal] = useState<{ modo: ModoProduccion; item?: Produccion } | null>(null);
  const [aEliminar, setAEliminar] = useState<Produccion | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const confirmarEliminacion = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await eliminarProduccion(aEliminar.id);
      toast.dismiss(idToast);
      toast.success('Producción Científica eliminada con éxito.');
      setAEliminar(null);
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorDeBaja(error, 'Error al eliminar Producción Científica.'));
    } finally {
      setEliminando(false);
    }
  };

  return (
    <SeccionCard numero={1} titulo="Producción científica">
      <AppButton title="Agregar producción científica" icon="add-circle-outline" onPress={() => setModal({ modo: 'nuevo' })} />

      {producciones.length === 0 ? (
        <View style={styles.vacio}>
          <AppText variant="body2" tone="secondary">
            Todavía no tenés producciones científicas.
          </AppText>
        </View>
      ) : (
        <View style={styles.lista}>
          {producciones.map((p) => {
            const acciones = accionesDeProduccion(p);
            const estado = texto(p.valores.estadoProduccion?.label);
            return (
              <TarjetaSolicitud
                key={p.id}
                titulo={tituloDeProduccion(p) || '—'}
                subtitulo={texto(p.valores.tipoMaterial?.label) || undefined}
                estado={estado ? <EstadoChip texto={estado} /> : undefined}
                lineas={[
                  { label: 'Título', valor: texto(p.valores.titulo) },
                  { label: 'Tema', valor: texto(p.valores.tema) },
                  { label: 'Nombre de la obra', valor: texto(p.valores.nombreObra) },
                  ...(p.participante ? [{ label: 'Estado participante', valor: estadoDeParticipacion(p) }] : []),
                  { label: 'Creador de la producción', valor: p.participante ? 'No' : 'Si' },
                ]}
                acciones={
                  acciones.responder ? (
                    <AppButton title="Responder" variant="secondary" onPress={() => setModal({ modo: 'responder', item: p })} />
                  ) : (
                    <>
                      {acciones.ver ? (
                        <AccionIcono icono="eye-outline" etiqueta="Ver" onPress={() => setModal({ modo: 'ver', item: p })} />
                      ) : null}
                      {acciones.editar ? (
                        <AccionIcono
                          icono="create-outline"
                          etiqueta="Editar"
                          onPress={() => setModal({ modo: 'editar', item: p })}
                        />
                      ) : null}
                      {acciones.eliminar ? (
                        <AccionIcono icono="trash-outline" etiqueta="Eliminar" peligro onPress={() => setAEliminar(p)} />
                      ) : null}
                    </>
                  )
                }
              />
            );
          })}
        </View>
      )}

      {modal ? <ModalProduccion modo={modal.modo} item={modal.item} onClose={() => setModal(null)} /> : null}

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
        ¿Está seguro de que desea eliminar esta producción científica? Esta acción no se puede deshacer.
      </ConfirmDialog>
    </SeccionCard>
  );
};

const styles = StyleSheet.create({
  lista: { gap: spacing.md },
  vacio: { alignItems: 'center', paddingVertical: spacing.lg },
});
