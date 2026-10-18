// Port de Portal-Austral-Dev -> licencias/_components/licencias/Componentes/ModalSolicitud.tsx
// (mismos campos, textos, reglas de certificado, días y domicilio por mudanza).
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { solicitarLicencia } from '../../../application/licencias/licenciasService';
import { diasInclusivos } from '../../../domain/licencias/fechasCrm';
import { esLicenciaPorMudanza } from '../../../domain/licencias/mudanza';
import { ayudaDiasSolicitados, limitesDeTipo } from '../../../domain/licencias/tiposDeLicencia';
import {
  DOMICILIO_VACIO,
  MSG_ARCHIVO_MUY_PESADO,
  hayArchivoQueSupera,
  validarSolicitudLicencia,
  type Errores,
  type ValoresDomicilio,
} from '../../../domain/licencias/validaciones';
import type { ArchivoElegido } from '../../../infrastructure/archivos/seleccionArchivos';
import { useLicenciasStore } from '../../stores/licenciasStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AppButton } from '../AppButton';
import { AppModal } from '../AppModal';
import { AppText } from '../AppText';
import { AppTextField } from '../AppTextField';
import { InfoAlert } from '../InfoAlert';
import { DateField } from '../form/DateField';
import { SelectField, type OpcionDeSelect } from '../form/SelectField';
import { FormularioDomicilio } from './FormularioDomicilio';
import { SelectorArchivos } from './SelectorArchivos';

interface ModalSolicitarLicenciaProps {
  visible: boolean;
  onClose: () => void;
}

const CERT_OBLIGATORIO = 1;
const CERT_DIFERIDO = 2;

export const ModalSolicitarLicencia: React.FC<ModalSolicitarLicenciaProps> = ({ visible, onClose }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const tipos = useLicenciasStore((s) => s.tipos.datos.disponibles);
  const cargandoTipos = useLicenciasStore((s) => s.tipos.cargando);

  const [tipoOpcion, setTipoOpcion] = useState<OpcionDeSelect | null>(null);
  const [desde, setDesde] = useState<Date | null>(null);
  const [hasta, setHasta] = useState<Date | null>(null);
  const [domicilio, setDomicilio] = useState<ValoresDomicilio>(DOMICILIO_VACIO);
  const [archivos, setArchivos] = useState<ArchivoElegido[]>([]);
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Cada vez que se abre, el formulario arranca vacío.
  useEffect(() => {
    if (!visible) return;
    setTipoOpcion(null);
    setDesde(null);
    setHasta(null);
    setDomicilio(DOMICILIO_VACIO);
    setArchivos([]);
    setIntento(false);
    setEnviando(false);
  }, [visible]);

  const tipo = useMemo(() => tipos.find((t) => t.value === tipoOpcion?.value) ?? null, [tipos, tipoOpcion]);
  const mudanza = esLicenciaPorMudanza(tipo);
  const opciones = useMemo<OpcionDeSelect[]>(() => tipos.map((t) => ({ value: t.value, label: t.label })), [tipos]);

  const errores: Errores = useMemo(
    () => validarSolicitudLicencia({ tipo: tipoOpcion, desde, hasta, domicilio }, tipo, archivos.length),
    [tipoOpcion, desde, hasta, domicilio, tipo, archivos.length],
  );
  // Antes del primer intento solo se avisan los errores que el portal muestra al instante (días y certificado).
  const visibles: Errores = intento ? errores : { ...(errores.dias ? { dias: errores.dias } : {}), ...(errores.certificado ? { certificado: errores.certificado } : {}) };

  const dias = diasInclusivos(desde, hasta);
  const limites = limitesDeTipo(tipo);
  const bloqueado = enviando || tipos.length === 0 || Boolean(errores.certificado) || Boolean(errores.dias);

  const enviar = async () => {
    setIntento(true);
    if (hayArchivoQueSupera(archivos)) {
      toast.error(MSG_ARCHIVO_MUY_PESADO);
      setArchivos([]);
      return;
    }
    if (!tipo || Object.keys(errores).length > 0) return;
    setEnviando(true);
    const ok = await solicitarLicencia(
      { tipoId: tipo.value, desde, hasta, domicilio: mudanza ? domicilio : null },
      tipo,
      archivos,
    );
    setEnviando(false);
    if (ok) onClose();
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      titulo="Solicitar nueva licencia"
      subtitulo="Completá el formulario para enviar tu solicitud"
      cerrable={!enviando}
      altaCompleta
      pie={
        <>
          <AppButton title="Cancelar" variant="secondary" onPress={onClose} disabled={enviando} />
          <AppButton
            title={enviando ? 'Enviando...' : 'Enviar Solicitud'}
            onPress={enviar}
            loading={enviando}
            disabled={bloqueado}
          />
        </>
      }
    >
      {!cargandoTipos && tipos.length === 0 ? (
        <InfoAlert tipo="advertencia">
          Usted no posee licencias disponibles para cargar, por favor, valide con Dirección de Personas.
        </InfoAlert>
      ) : null}

      <SelectField
        label="Tipo de licencia"
        required
        options={opciones}
        value={tipoOpcion}
        onChange={setTipoOpcion}
        placeholder={cargandoTipos ? 'Cargando…' : 'Seleccionar'}
        error={visibles.tipo}
        disabled={enviando || tipos.length === 0}
        buscable
      />

      {tipo ? (
        <View style={styles.dias}>
          <AppText variant="subtitle2">Días</AppText>
          <View style={styles.cajas}>
            <View style={styles.caja}>
              <AppText variant="caption" tone="secondary">
                {tipo.tieneLimiteAnual === false ? 'Sin límite anual preestablecido' : 'Días disponibles'}
              </AppText>
              {tipo.tieneLimiteAnual === false ? null : (
                <AppText variant="h6">{String(limites.diasDisponibles)}</AppText>
              )}
            </View>
            <View style={styles.caja}>
              <AppText variant="caption" tone="secondary">
                Máximo de días corridos
              </AppText>
              <AppText variant="h6">{String(limites.maxCorridos)}</AppText>
            </View>
          </View>
        </View>
      ) : null}

      <DateField
        label="Fecha de inicio de licencia:"
        required
        value={desde}
        onChange={setDesde}
        error={visibles.desde}
        disabled={enviando}
      />
      <DateField
        label="Fecha fin de licencia:"
        required
        value={hasta}
        onChange={setHasta}
        minimumDate={desde ?? undefined}
        error={visibles.hasta}
        disabled={enviando}
      />
      <AppTextField
        label="Días Solicitados"
        value={dias === null ? '' : String(dias)}
        editable={false}
        error={visibles.dias}
        helperText={ayudaDiasSolicitados(tipo)}
      />

      {mudanza ? (
        <FormularioDomicilio valores={domicilio} errores={visibles} onChange={setDomicilio} disabled={enviando} />
      ) : null}

      {tipo?.certificadoObligatorio === CERT_OBLIGATORIO ? (
        <InfoAlert tipo="advertencia">
          Este tipo de licencia requiere certificado obligatorio. Adjunte un archivo antes de enviar la solicitud.
        </InfoAlert>
      ) : null}
      {tipo?.certificadoObligatorio === CERT_DIFERIDO ? (
        <InfoAlert tipo="info">
          Este tipo de licencia requiere certificado, pero puede adjuntarse posteriormente. La aprobación quedará
          bloqueada hasta que se cargue.
        </InfoAlert>
      ) : null}
      {tipo?.certificadoObligatorio ? (
        <SelectorArchivos archivos={archivos} onChange={setArchivos} disabled={enviando} />
      ) : null}
    </AppModal>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    dias: { gap: spacing.sm },
    cajas: { flexDirection: 'row', gap: spacing.md },
    caja: {
      flex: 1,
      gap: spacing.xs,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: borderRadius.card,
      backgroundColor: c.accentPrimaryMuted,
    },
  });
