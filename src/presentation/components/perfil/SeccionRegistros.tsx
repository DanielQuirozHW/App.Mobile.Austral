// Sección de Perfil con listado de registros y acciones Ver / Editar / Eliminar. Equivale a las secciones con grilla
// del portal (Portal-Austral-Dev -> perfil/formacion y perfil/trayectoria): botón de alta, filas con acciones y
// diálogo "Confirmar eliminación".
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { mensajeDeErrorDeBaja } from '../../../config/api/apiError';
import type { Modo } from '../../../domain/perfil/comun';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppButton } from '../AppButton';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
import { InfoAlert } from '../InfoAlert';
import { SeccionCard } from '../SeccionCard';
import { TarjetaSolicitud, type LineaDeTarjeta } from '../licencias/TarjetaSolicitud';

export interface PropsRenderModal<T> {
  modo: Modo;
  item?: T;
  onClose: () => void;
}

interface SeccionRegistrosProps<T> {
  numero: number;
  titulo: string;
  descripcion?: string;
  /** Texto de ayuda (tooltip del portal). */
  ayuda?: string;
  items: T[];
  idDe: (item: T) => string;
  tituloDe: (item: T) => string;
  subtituloDe?: (item: T) => string | undefined;
  estadoDe?: (item: T) => React.ReactNode;
  lineasDe: (item: T) => LineaDeTarjeta[];
  textoAgregar: string;
  /** false oculta el botón de alta (por ejemplo, tope de áreas de expertise). */
  puedeAgregar?: boolean;
  /** true: solo la acción Ver (lista de solo lectura, como los cargos de gestión académica). */
  soloLectura?: boolean;
  textoVacio: string;
  /** Para el diálogo: "¿Está seguro de que desea eliminar {sustantivo}?". */
  sustantivoEliminar?: string;
  mensajes?: { eliminando: string; eliminado: string; errorEliminar: string };
  onEliminar?: (item: T) => Promise<void>;
  renderModal: (p: PropsRenderModal<T>) => React.ReactNode;
}

export function SeccionRegistros<T>({
  numero,
  titulo,
  descripcion,
  ayuda,
  items,
  idDe,
  tituloDe,
  subtituloDe,
  estadoDe,
  lineasDe,
  textoAgregar,
  puedeAgregar = true,
  soloLectura = false,
  textoVacio,
  sustantivoEliminar = 'este registro',
  mensajes,
  onEliminar,
  renderModal,
}: SeccionRegistrosProps<T>): React.ReactElement {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const [modal, setModal] = useState<{ modo: Modo; item?: T } | null>(null);
  const [aEliminar, setAEliminar] = useState<T | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const confirmarEliminacion = async () => {
    if (aEliminar === null || !onEliminar || !mensajes) return;
    setEliminando(true);
    const idToast = toast.loading(mensajes.eliminando);
    try {
      await onEliminar(aEliminar);
      toast.dismiss(idToast);
      toast.success(mensajes.eliminado);
      setAEliminar(null);
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorDeBaja(error, mensajes.errorEliminar));
    } finally {
      setEliminando(false);
    }
  };

  return (
    <SeccionCard numero={numero} titulo={titulo} descripcion={descripcion}>
      {ayuda ? <InfoAlert tipo="info">{ayuda}</InfoAlert> : null}

      {puedeAgregar && !soloLectura ? (
        <AppButton title={textoAgregar} icon="add-circle-outline" onPress={() => setModal({ modo: 'nuevo' })} />
      ) : null}

      {items.length === 0 ? (
        <View style={styles.vacio}>
          <AppIcon name="folder-open-outline" size={iconSizes.xl} color={globalColors.textTertiary} />
          <AppText variant="body2" tone="secondary" style={styles.textoVacio}>
            {textoVacio}
          </AppText>
        </View>
      ) : (
        <View style={styles.lista}>
          {items.map((item) => (
            <TarjetaSolicitud
              key={idDe(item)}
              titulo={tituloDe(item)}
              subtitulo={subtituloDe?.(item)}
              estado={estadoDe?.(item)}
              lineas={lineasDe(item)}
              acciones={
                <>
                  <AccionIcono icono="eye-outline" etiqueta="Ver" onPress={() => setModal({ modo: 'ver', item })} />
                  {soloLectura ? null : (
                    <>
                      <AccionIcono
                        icono="create-outline"
                        etiqueta="Editar"
                        onPress={() => setModal({ modo: 'editar', item })}
                      />
                      <AccionIcono
                        icono="trash-outline"
                        etiqueta="Eliminar"
                        peligro
                        onPress={() => setAEliminar(item)}
                      />
                    </>
                  )}
                </>
              }
            />
          ))}
        </View>
      )}

      {modal ? renderModal({ modo: modal.modo, item: modal.item, onClose: () => setModal(null) }) : null}

      {soloLectura ? null : (
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
          {`¿Está seguro de que desea eliminar ${sustantivoEliminar}? Esta acción no se puede deshacer.`}
        </ConfirmDialog>
      )}
    </SeccionCard>
  );
}

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    lista: { gap: spacing.md },
    vacio: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: c.border,
    },
    textoVacio: { textAlign: 'center' },
  });
