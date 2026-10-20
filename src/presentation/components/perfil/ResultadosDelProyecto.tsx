// "Resultados del proyecto" del modal de un proyecto de investigación: las siete listas de resultados vinculados.
// Port de las tablas de ModalProyectosInvestigacion y de columns/investigacion/columnsProyectos.tsx
// (columnasResultadosDelProyecto).
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  cargarMasInfo,
  cargarResultados,
  eliminarResultado,
  type MasInfoResultado,
} from '../../../application/perfil/proyectosService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import type { Modo } from '../../../domain/perfil/comun';
import { puedeVincularResultados, type Participante, type Proyecto } from '../../../domain/perfil/proyectos';
import {
  CONFIG_RESULTADOS,
  puedeModificarVinculacion,
  type ConfigResultado,
  type ResultadoVinculado,
} from '../../../domain/perfil/resultadosProyecto';
import { useAuthStore } from '../../stores/authStore';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
import { InfoAlert } from '../InfoAlert';
import { TarjetaSolicitud } from '../licencias/TarjetaSolicitud';
import { SeccionCard } from '../SeccionCard';
import { ModalMasInfoResultado } from './ModalMasInfoResultado';
import { ModalVincularResultado } from './ModalVincularResultado';

interface PropsSeccion {
  numero: number;
  config: ConfigResultado;
  proyecto: Proyecto;
  participantes: Participante[];
}

const SeccionResultado: React.FC<PropsSeccion> = ({ numero, config, proyecto, participantes }) => {
  const nombreDelUsuario = useAuthStore((s) => s.user?.fullname) ?? '';
  const puedeVincular = puedeVincularResultados(proyecto);
  const [lista, setLista] = useState<ResultadoVinculado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState<{ modo: Modo; item?: ResultadoVinculado } | null>(null);
  const [aEliminar, setAEliminar] = useState<ResultadoVinculado | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [masInfo, setMasInfo] = useState<{ resultado: ResultadoVinculado; datos: MasInfoResultado | null } | null>(null);
  const [masInfoCargando, setMasInfoCargando] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(false);
    try {
      setLista(await cargarResultados(config.tipo, proyecto.id));
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }, [config.tipo, proyecto.id]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const confirmarEliminacion = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await eliminarResultado(config.tipo, aEliminar.id);
      toast.dismiss(idToast);
      toast.success(`Resultado de ${config.nombre} eliminado con éxito`);
      setAEliminar(null);
      void recargar();
    } catch (e) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(e, `Error al eliminar Resultado de ${config.nombre}`));
    } finally {
      setEliminando(false);
    }
  };

  const verMasInfo = async (resultado: ResultadoVinculado) => {
    if (config.visor === null || !resultado.titulo.value) {
      setMasInfo({ resultado, datos: null });
      return;
    }
    setMasInfoCargando(resultado.id);
    try {
      const datos = await cargarMasInfo(config.tipo, resultado.titulo.value);
      if (datos) setMasInfo({ resultado, datos });
      else toast.error('Error al obtener más información');
    } catch {
      toast.error('Error al obtener más información');
    } finally {
      setMasInfoCargando(null);
    }
  };

  return (
    <SeccionCard numero={numero} titulo={config.tituloSeccion}>
      {error ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">No pudimos cargar esta sección. Por favor, volvé a intentar.</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={() => void recargar()} loading={cargando} />
        </View>
      ) : null}

      {puedeVincular ? (
        <AppButton title="Vincular" icon="add-circle-outline" onPress={() => setModal({ modo: 'nuevo' })} />
      ) : null}

      {lista.length === 0 ? (
        <View style={styles.vacio}>
          <AppText variant="body2" tone="secondary">
            {cargando ? 'Cargando...' : 'Todavía no hay resultados vinculados.'}
          </AppText>
        </View>
      ) : (
        <View style={styles.lista}>
          {lista.map((r) => {
            const puedeModificar = puedeModificarVinculacion(puedeVincular, r, nombreDelUsuario);
            return (
              <TarjetaSolicitud
                key={r.id}
                titulo={r.titulo.label || '—'}
                lineas={[
                  { label: 'Vinculado por', valor: r.vinculadoPor },
                  { label: 'Fecha de vinculación', valor: r.fechaVinculacion },
                ]}
                acciones={
                  <>
                    <AccionIcono icono="eye-outline" etiqueta="Ver" onPress={() => setModal({ modo: 'ver', item: r })} />
                    <AccionIcono
                      icono="information-circle-outline"
                      etiqueta="Más info"
                      disabled={masInfoCargando === r.id}
                      onPress={() => void verMasInfo(r)}
                    />
                    {puedeModificar ? (
                      <>
                        <AccionIcono
                          icono="create-outline"
                          etiqueta="Editar"
                          onPress={() => setModal({ modo: 'editar', item: r })}
                        />
                        <AccionIcono icono="trash-outline" etiqueta="Eliminar" peligro onPress={() => setAEliminar(r)} />
                      </>
                    ) : null}
                  </>
                }
              />
            );
          })}
        </View>
      )}

      {modal ? (
        <ModalVincularResultado
          config={config}
          modo={modal.modo}
          item={modal.item}
          proyecto={proyecto}
          participantes={participantes}
          onClose={() => setModal(null)}
          onGuardado={() => void recargar()}
        />
      ) : null}

      {masInfo ? (
        <ModalMasInfoResultado
          config={config}
          resultado={masInfo.resultado}
          datos={masInfo.datos}
          onClose={() => setMasInfo(null)}
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
        {`¿Está seguro de que desea eliminar esta vinculación (${config.nombre})? Esta acción no se puede deshacer.`}
      </ConfirmDialog>
    </SeccionCard>
  );
};

interface Props {
  proyecto: Proyecto;
  participantes: Participante[];
}

export const ResultadosDelProyecto: React.FC<Props> = ({ proyecto, participantes }) => (
  <View style={styles.contenedor}>
    <AppText variant="h6">Resultados del proyecto</AppText>
    {CONFIG_RESULTADOS.map((config, indice) => (
      <SeccionResultado
        key={config.tipo}
        numero={indice + 1}
        config={config}
        proyecto={proyecto}
        participantes={participantes}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  contenedor: { gap: spacing.md },
  aviso: { gap: spacing.sm },
  lista: { gap: spacing.md },
  vacio: { alignItems: 'center', paddingVertical: spacing.lg },
});
