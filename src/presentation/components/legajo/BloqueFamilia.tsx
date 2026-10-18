// Sección Familia: cónyuge, hijos/as y su documentación requerida.
// Port del bloque "Familia" de Portal-Austral-Dev -> legajo/datos-personales/page.tsx y de las columnas
// columnsConyuge / columnsHijos / columnsDocumentosLegajo (acciones Ver, Editar, Eliminar, Ver adjuntos y Cargar archivo).
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { eliminarFamiliarDeLista } from '../../../application/legajo/legajoService';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { COD_A_CARGO_SI } from '../../../domain/legajo/opciones';
import type { DocumentoFamiliar, Familiar } from '../../../domain/legajo/tipos';
import { useFamiliaStore } from '../../stores/familiaStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppButton } from '../AppButton';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
import { Etiqueta } from '../Etiqueta';
import { ModalCargarDocumento } from './ModalCargarDocumento';
import { ModalConyuge } from './ModalConyuge';
import { ModalHijo } from './ModalHijo';
import { ModalVerAdjuntos } from './ModalVerAdjuntos';

interface BloqueFamiliaProps {
  /** Vista del título del cónyuge: la pantalla la usa para llevar el scroll hasta acá. */
  conyugeRef: React.RefObject<View | null>;
  /** Resalta el cónyuge cuando falta cargarlo al intentar guardar. */
  resaltarConyuge: boolean;
  /** El estado civil pide cónyuge o todavía existe el registro en el BO. */
  mostrarCampoConyuge: boolean;
  /** Se está guardando y el cónyuge está por darse de baja por el cambio de estado civil. */
  enTransicionEliminandoConyuge: boolean;
  onAgregarConyuge: () => void;
}

type ModalFamiliar = { modo: 'nuevo' | 'editar' | 'ver'; datos?: Familiar } | null;
type Baja = { tipo: 'conyuge' | 'hijo'; familiar: Familiar } | null;
type DocSeleccionado = { id: string; nombre: string } | null;

export const BloqueFamilia: React.FC<BloqueFamiliaProps> = ({
  conyugeRef,
  resaltarConyuge,
  mostrarCampoConyuge,
  enTransicionEliminandoConyuge,
  onAgregarConyuge,
}) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  const conyuge = useFamiliaStore((s) => s.conyuge);
  const hijos = useFamiliaStore((s) => s.hijos);
  const documentosConyuge = useFamiliaStore((s) => s.documentosConyuge);
  const documentosHijos = useFamiliaStore((s) => s.documentosHijos);
  const cargandoDocumentos = useFamiliaStore((s) => s.cargandoDocumentos);
  const checksTemporales = useFamiliaStore((s) => s.checksTemporales);

  const [modalConyuge, setModalConyuge] = useState<ModalFamiliar>(null);
  const [modalHijo, setModalHijo] = useState<ModalFamiliar>(null);
  const [baja, setBaja] = useState<Baja>(null);
  const [eliminando, setEliminando] = useState(false);
  const [docParaCargar, setDocParaCargar] = useState<DocSeleccionado>(null);
  const [docParaVer, setDocParaVer] = useState<DocSeleccionado>(null);

  const confirmarBaja = async () => {
    const familiarId = baja?.familiar.id;
    if (!baja || !familiarId) return;
    const esHijo = baja.tipo === 'hijo';
    const nombre = esHijo ? 'hijo' : 'cónyuge';
    setEliminando(true);
    const idToast = toast.loading(`Eliminando ${nombre}...`);
    try {
      await eliminarFamiliarDeLista(familiarId);
      toast.dismiss(idToast);
      toast.success(esHijo ? 'Hijo eliminado correctamente' : 'Cónyuge eliminado correctamente');
    } catch {
      toast.dismiss(idToast);
      toast.error(`Error al eliminar el ${nombre}`);
    } finally {
      setEliminando(false);
      setBaja(null);
    }
  };

  const importado = (doc: DocumentoFamiliar): boolean => doc.cargoDoc === 'SÍ' || Boolean(checksTemporales[doc.id]);

  const filaDocumento = (doc: DocumentoFamiliar, mostrarFamiliar: boolean) => (
    <View key={doc.id} style={styles.fila}>
      <View style={styles.filaTextos}>
        <AppText variant="subtitle2">{doc.nombre}</AppText>
        {mostrarFamiliar && doc.nombreFamiliar ? (
          <AppText variant="caption" tone="secondary">
            {doc.nombreFamiliar}
          </AppText>
        ) : null}
        <View style={styles.importado}>
          <AppIcon
            name={importado(doc) ? 'checkmark-circle' : 'cloud-offline-outline'}
            size={iconSizes.md}
            color={importado(doc) ? globalColors.success : globalColors.textTertiary}
          />
          <AppText variant="caption" tone={importado(doc) ? 'success' : 'tertiary'}>
            {importado(doc) ? 'Documento importado' : 'Documento sin importar'}
          </AppText>
        </View>
      </View>
      <AccionIcono icono="eye-outline" etiqueta="Ver adjuntos" onPress={() => setDocParaVer({ id: doc.id, nombre: doc.nombre })} />
      <AccionIcono
        icono="cloud-upload-outline"
        etiqueta="Cargar archivo"
        onPress={() => setDocParaCargar({ id: doc.id, nombre: doc.nombre })}
      />
    </View>
  );

  const listaDocumentos = (docs: DocumentoFamiliar[], mostrarFamiliar: boolean) =>
    cargandoDocumentos ? (
      <ActivityIndicator color={globalColors.accentPrimary} style={styles.spinner} />
    ) : docs.length === 0 ? (
      <AppText variant="body2" tone="secondary" style={styles.vacio}>
        Sin registros
      </AppText>
    ) : (
      <View style={styles.lista}>{docs.map((doc) => filaDocumento(doc, mostrarFamiliar))}</View>
    );

  return (
    <View style={styles.contenedor}>
      {enTransicionEliminandoConyuge ? (
        <View style={styles.transicion}>
          <ActivityIndicator size="large" color={globalColors.accentPrimary} />
          <AppText variant="body2" tone="secondary">
            Procesando cambios del estado civil...
          </AppText>
        </View>
      ) : null}

      {mostrarCampoConyuge ? (
        <View style={styles.bloque}>
          <View
            ref={conyugeRef}
            collapsable={false}
            style={[styles.tituloConyuge, resaltarConyuge && { backgroundColor: globalColors.warningLight }]}
          >
            <AppText variant="overline" tone="secondary">
              Cónyuge
            </AppText>
          </View>

          {conyuge.id ? (
            <View style={styles.fila}>
              <View style={styles.filaTextos}>
                <AppText variant="subtitle2">{`${conyuge.apellidoFamiliar} ${conyuge.nombreFamiliar}`.trim()}</AppText>
                <AppText variant="caption" tone="secondary">
                  {`${(conyuge.tipoDocFamiliar as any)?.label ?? ''} ${conyuge.docFamiliar}`.trim()}
                </AppText>
                <AppText variant="caption" tone="secondary">
                  {`Fecha Nac.: ${aFechaVisible(conyuge.fechaNacimiento) || '—'}`}
                </AppText>
              </View>
              <AccionIcono icono="eye-outline" etiqueta="Ver cónyuge" onPress={() => setModalConyuge({ modo: 'ver', datos: conyuge })} />
              <AccionIcono icono="create-outline" etiqueta="Editar cónyuge" onPress={() => setModalConyuge({ modo: 'editar', datos: conyuge })} />
              <AccionIcono icono="trash-outline" etiqueta="Eliminar cónyuge" peligro onPress={() => setBaja({ tipo: 'conyuge', familiar: conyuge })} />
            </View>
          ) : (
            <View style={styles.sinConyuge}>
              <AppText variant="body2" tone="secondary">
                Sin registros
              </AppText>
              <AppButton title="Agregar" icon="add" variant="secondary" onPress={onAgregarConyuge} />
            </View>
          )}

          {conyuge.id ? (
            <View style={styles.cajaDocs}>
              <AppText variant="subtitle2" tone="secondary">
                Documentación del Cónyuge
              </AppText>
              {listaDocumentos(documentosConyuge, false)}
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.separador} />

      <View style={styles.bloque}>
        <AppText variant="overline" tone="secondary">
          Hijo/a/s
        </AppText>
        <View style={styles.encabezadoHijos}>
          <AppText variant="body2" tone="secondary" style={styles.conteo}>
            {`${hijos.length} hijo/as registrados.`}
          </AppText>
          <AppButton title="Agregar" icon="add" onPress={() => setModalHijo({ modo: 'nuevo' })} />
        </View>

        {hijos.length > 0 ? (
          <View style={styles.lista}>
            {hijos.map((hijo) => {
              const aCargo = Number(hijo.aCargo?.value) === COD_A_CARGO_SI;
              const iniciales = [hijo.nombreFamiliar?.[0], hijo.apellidoFamiliar?.[0]].filter(Boolean).join('').toUpperCase();
              return (
                <View key={hijo.id} style={styles.fila}>
                  <View style={styles.avatar}>
                    <AppText variant="caption" tone="primary">
                      {iniciales}
                    </AppText>
                  </View>
                  <View style={styles.filaTextos}>
                    <AppText variant="subtitle2">{`${hijo.nombreFamiliar} ${hijo.apellidoFamiliar}`.trim()}</AppText>
                    {aCargo ? <Etiqueta texto="A cargo" tipo="info" /> : null}
                    <AppText variant="caption" tone="secondary">
                      {`Nacimiento: ${aFechaVisible(hijo.fechaNacimiento) || '—'}`}
                    </AppText>
                    <AppText variant="caption" tone="secondary">
                      {`Documento: ${hijo.docFamiliar || '—'}`}
                    </AppText>
                  </View>
                  <AccionIcono icono="eye-outline" etiqueta="Ver hijo/a" onPress={() => setModalHijo({ modo: 'ver', datos: hijo })} />
                  <AccionIcono icono="create-outline" etiqueta="Editar hijo/a" onPress={() => setModalHijo({ modo: 'editar', datos: hijo })} />
                  <AccionIcono icono="trash-outline" etiqueta="Eliminar hijo/a" peligro onPress={() => setBaja({ tipo: 'hijo', familiar: hijo })} />
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.cajaDocs}>
          <AppText variant="subtitle2" tone="secondary">
            Documentación de hijo/as
          </AppText>
          {listaDocumentos(documentosHijos, true)}
        </View>
      </View>

      {modalConyuge ? (
        <ModalConyuge modo={modalConyuge.modo} datos={modalConyuge.datos} onClose={() => setModalConyuge(null)} />
      ) : null}
      {modalHijo ? (
        <ModalHijo modo={modalHijo.modo} datos={modalHijo.datos} onClose={() => setModalHijo(null)} />
      ) : null}
      {docParaCargar ? <ModalCargarDocumento documento={docParaCargar} onClose={() => setDocParaCargar(null)} /> : null}
      {docParaVer ? <ModalVerAdjuntos documento={docParaVer} onClose={() => setDocParaVer(null)} /> : null}

      <ConfirmDialog
        visible={Boolean(baja)}
        titulo="Confirmar eliminación"
        textoConfirmar="Eliminar"
        textoConfirmando="Eliminando..."
        confirmando={eliminando}
        peligroso
        onCancelar={() => setBaja(null)}
        onConfirmar={confirmarBaja}
      >
        <AppText variant="body1">
          {`¿Desea eliminar el ${baja?.tipo === 'conyuge' ? 'cónyuge' : 'hijo'} seleccionado? Esta acción no se puede deshacer.`}
        </AppText>
      </ConfirmDialog>
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    contenedor: { gap: spacing.lg },
    bloque: { gap: spacing.md },
    transicion: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, minHeight: 100 },
    tituloConyuge: { paddingVertical: spacing.xs, borderRadius: borderRadius.xs },
    sinConyuge: { gap: spacing.md, alignItems: 'flex-start' },
    separador: { height: 1, backgroundColor: c.border },
    encabezadoHijos: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
    conteo: { flex: 1 },
    lista: { gap: spacing.sm },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingLeft: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: borderRadius.md,
      backgroundColor: c.card,
    },
    filaTextos: { flex: 1, gap: spacing.xxs, paddingVertical: spacing.sm },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.round,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.xs,
    },
    importado: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    cajaDocs: {
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: borderRadius.card,
    },
    spinner: { padding: spacing.lg },
    vacio: { textAlign: 'center', padding: spacing.md },
  });
