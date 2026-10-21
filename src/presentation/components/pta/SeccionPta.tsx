// Sección con tarjetas de un registro del Plan de Trabajo (clases, áreas, proyectos...). Equivale a las grillas del
// portal: botón de alta, acciones Ver / Editar / Eliminar y diálogo "Confirmar eliminación".
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { eliminarRegistro } from '../../../application/pta/ptaService';
import { mensajeDeErrorDeBaja } from '../../../config/api/apiError';
import type { Modo } from '../../../domain/perfil/comun';
import { registrosDeSeccion, SECCIONES } from '../../../domain/pta/secciones';
import type { ClaveSeccion, RegistroPta } from '../../../domain/pta/tipos';
import { usePtaStore } from '../../stores/ptaStore';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
import { InfoAlert } from '../InfoAlert';
import { TarjetaSolicitud } from '../licencias/TarjetaSolicitud';
import { CajaPta } from './CajaPta';
import { ModalSeccionPta } from './ModalSeccionPta';

interface Props {
  clave: ClaveSeccion;
  /** Encabezado tal como lo escribe el portal (con su numeración). */
  encabezado: string;
  planId: string;
  /** El PTA no admite cambios (estado no editable, vigente o abierto desde Histórico / Vigente). */
  deshabilitado: boolean;
}

export const SeccionPta: React.FC<Props> = ({ clave, encabezado, planId, deshabilitado }) => {
  const def = SECCIONES[clave];
  const secciones = usePtaStore((s) => s.secciones);
  const items = registrosDeSeccion(def, secciones);
  const [modal, setModal] = useState<{ modo: Modo; item?: RegistroPta } | null>(null);
  const [aEliminar, setAEliminar] = useState<RegistroPta | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const confirmarEliminacion = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    const idToast = toast.loading(def.mensajes.eliminando);
    try {
      await eliminarRegistro(def, planId, aEliminar);
      toast.dismiss(idToast);
      toast.success(def.mensajes.eliminado);
      setAEliminar(null);
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorDeBaja(error, def.mensajes.errorEliminar ?? 'Ha ocurrido un error'));
    } finally {
      setEliminando(false);
    }
  };

  return (
    <CajaPta titulo={encabezado}>
      {def.ayuda ? <InfoAlert tipo="info">{def.ayuda}</InfoAlert> : null}

      {def.puedeAgregar && !deshabilitado ? (
        <AppButton
          title={def.textoAgregar ?? 'Agregar'}
          icon="add-circle-outline"
          onPress={() => setModal({ modo: 'nuevo' })}
        />
      ) : null}

      {items.length === 0 ? (
        <View style={styles.vacio}>
          <AppText variant="body2" tone="secondary">
            {def.textoVacio}
          </AppText>
        </View>
      ) : (
        <View style={styles.lista}>
          {items.map((item) => (
            <TarjetaSolicitud
              key={item.id}
              titulo={def.tituloDe(item) || '—'}
              lineas={def.lineas.map((l) => ({ label: l.label, valor: l.valor(item) }))}
              acciones={
                <>
                  <AccionIcono icono="eye-outline" etiqueta="Ver" onPress={() => setModal({ modo: 'ver', item })} />
                  {deshabilitado ? null : (
                    <AccionIcono
                      icono="create-outline"
                      etiqueta="Editar"
                      onPress={() => setModal({ modo: 'editar', item })}
                    />
                  )}
                  {deshabilitado || !def.puedeEliminar ? null : (
                    <AccionIcono icono="trash-outline" etiqueta="Eliminar" peligro onPress={() => setAEliminar(item)} />
                  )}
                </>
              }
            />
          ))}
        </View>
      )}

      {modal ? (
        <ModalSeccionPta def={def} planId={planId} modo={modal.modo} item={modal.item} onClose={() => setModal(null)} />
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
        {`${def.mensajeEliminar ?? '¿Estás seguro de que deseas eliminar este registro?'} Esta acción no se puede deshacer.`}
      </ConfirmDialog>
    </CajaPta>
  );
};

const styles = StyleSheet.create({
  lista: { gap: spacing.md },
  vacio: { alignItems: 'center', paddingVertical: spacing.lg },
});
