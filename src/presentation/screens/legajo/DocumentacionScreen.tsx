// Legajo > Documentación. Port de Portal-Austral-Dev -> src/app/(dashboard)/legajo/documentacion/page.tsx:
// cabecera compacta del legajo, aviso informativo y la lista de documentos requeridos del empleado con sus
// acciones "Ver adjuntos" y "Cargar archivo".
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { cargarDocumentacion, subirAdjuntosDeEmpleado } from '../../../application/documentacion/documentacionService';
import { obtenerAdjuntosDeDocumentoEmpleado } from '../../../application/documentacion/documentacionService';
import type { DocumentoEmpleado } from '../../../domain/documentacion/documentos';
import { AppText } from '../../components/AppText';
import { InfoAlert } from '../../components/InfoAlert';
import { Screen } from '../../components/Screen';
import { ModalCargarDocumento } from '../../components/legajo/ModalCargarDocumento';
import { ModalVerAdjuntos } from '../../components/legajo/ModalVerAdjuntos';
import { PerfilLegajoBanner } from '../../components/legajo/PerfilLegajoBanner';
import { TarjetaDocumento } from '../../components/legajo/TarjetaDocumento';
import { useDocumentacionStore } from '../../stores/documentacionStore';
import { useThemeColors } from '../../theme/theme';
import { spacing } from '../../utils/responsive';

export const DocumentacionScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const documentos = useDocumentacionStore((s) => s.documentos);
  const cargando = useDocumentacionStore((s) => s.cargando);
  const marcasTemporales = useDocumentacionStore((s) => s.marcasTemporales);
  const [verAdjuntos, setVerAdjuntos] = useState<DocumentoEmpleado | null>(null);
  const [cargarArchivo, setCargarArchivo] = useState<DocumentoEmpleado | null>(null);

  useEffect(() => {
    void cargarDocumentacion();
  }, []);

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      <PerfilLegajoBanner compacto />

      <InfoAlert tipo="info">Aquí deberás cargar los documentos asociados a tu legajo.</InfoAlert>

      {cargando && documentos.length === 0 ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={globalColors.accentPrimary} />
        </View>
      ) : documentos.length === 0 ? (
        <View style={styles.centro}>
          <AppText variant="body2" tone="secondary">
            Sin registros
          </AppText>
        </View>
      ) : (
        <View style={styles.lista}>
          {documentos.map((documento) => (
            <TarjetaDocumento
              key={documento.id}
              documento={documento}
              marcaTemporal={marcasTemporales[documento.id]}
              onVerAdjuntos={() => setVerAdjuntos(documento)}
              onCargarArchivo={() => setCargarArchivo(documento)}
            />
          ))}
        </View>
      )}

      {verAdjuntos ? (
        <ModalVerAdjuntos
          documento={{ id: verAdjuntos.documentoId, nombre: verAdjuntos.nombre }}
          obtener={obtenerAdjuntosDeDocumentoEmpleado}
          onClose={() => setVerAdjuntos(null)}
        />
      ) : null}

      {cargarArchivo ? (
        <ModalCargarDocumento
          documento={{ id: cargarArchivo.id, nombre: cargarArchivo.titulo || cargarArchivo.nombre }}
          subir={subirAdjuntosDeEmpleado}
          onClose={() => setCargarArchivo(null)}
        />
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  contenido: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  centro: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  lista: { gap: spacing.md },
});
