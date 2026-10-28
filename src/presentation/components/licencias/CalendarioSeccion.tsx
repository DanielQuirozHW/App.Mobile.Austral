// Calendario de licencias y vacaciones. Port de Portal-Austral-Dev -> CalendarioWrapper (react-big-calendar):
// en el celular es una grilla mensual con puntos de color por persona, lista del día y detalle al tocar.
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  NOMBRES_DIAS_SEMANA,
  armarEventos,
  colorDePersona,
  construirMes,
  eventosDelDia,
  mesSiguiente,
  tituloDeMes,
  type EventoCalendario,
} from '../../../domain/licencias/calendario';
import { diaAVisible, hoyCrm } from '../../../domain/licencias/fechasCrm';
import { useLicenciasStore } from '../../stores/licenciasStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, platformSpecific, spacing } from '../../utils/responsive';
import { AccionIcono } from '../AccionIcono';
import { AppText } from '../AppText';
import { InfoAlert } from '../InfoAlert';
import { MSG_ERROR_DE_LECTURA } from './ListaPaginada';
import { ModalDetalleCalendario } from './ModalDetalleCalendario';

const MAX_PUNTOS = 3;

/** Los feriados se dibujan en ámbar (#ff9800), como en Calendar.tsx del portal. */
const COLOR_FERIADO = '#ff9800';

export const CalendarioSeccion: React.FC = () => {
  const { globalColors, isDark } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const calendario = useLicenciasStore((s) => s.calendario);
  const feriados = useLicenciasStore((s) => s.feriados);
  const hoy = hoyCrm();

  const [mes, setMes] = useState(() => new Date());
  const [diaElegido, setDiaElegido] = useState<string>(hoy);
  const [detalle, setDetalle] = useState<EventoCalendario | null>(null);

  const eventos = useMemo(() => armarEventos(calendario.datos, feriados.datos), [calendario.datos, feriados.datos]);
  const semanas = useMemo(() => construirMes(mes), [mes]);

  const colorDe = (e: EventoCalendario): string =>
    e.tipo === 'feriado' ? COLOR_FERIADO : colorDePersona(e.empleadoName, isDark);

  // Personas con algo en el mes visible (referencias de color).
  const personasDelMes = useMemo(() => {
    const primero = semanas[0][0].dia;
    const ultimo = semanas[semanas.length - 1][6].dia;
    const nombres = new Set<string>();
    eventos.forEach((e) => {
      if (e.tipo !== 'feriado' && e.desde <= ultimo && e.hasta >= primero) nombres.add(e.empleadoName);
    });
    return Array.from(nombres).sort();
  }, [eventos, semanas]);

  const delDia = useMemo(() => eventosDelDia(eventos, diaElegido), [eventos, diaElegido]);

  return (
    <View style={styles.seccion}>
      {calendario.error && calendario.datos.length === 0 ? <InfoAlert tipo="error">{MSG_ERROR_DE_LECTURA}</InfoAlert> : null}

      <View style={styles.card}>
        <View style={styles.navegacion}>
          <AccionIcono icono="chevron-back" etiqueta="Mes anterior" onPress={() => setMes((m) => mesSiguiente(m, -1))} />
          <AppText variant="subtitle2">{tituloDeMes(mes)}</AppText>
          <AccionIcono icono="chevron-forward" etiqueta="Mes siguiente" onPress={() => setMes((m) => mesSiguiente(m, 1))} />
        </View>

        <View style={styles.fila}>
          {NOMBRES_DIAS_SEMANA.map((n) => (
            <View key={n} style={styles.celdaEncabezado}>
              <AppText variant="caption" tone="secondary">
                {n}
              </AppText>
            </View>
          ))}
        </View>

        {semanas.map((semana) => (
          <View key={semana[0].dia} style={styles.fila}>
            {semana.map((celda) => {
              const delaCelda = eventosDelDia(eventos, celda.dia);
              const elegido = celda.dia === diaElegido;
              const esHoy = celda.dia === hoy;
              return (
                <Pressable
                  key={celda.dia}
                  onPress={() => setDiaElegido(celda.dia)}
                  accessibilityRole="button"
                  accessibilityLabel={`${diaAVisible(celda.dia)}, ${delaCelda.length} eventos`}
                  accessibilityState={{ selected: elegido }}
                  style={[styles.celda, elegido && styles.celdaElegida, esHoy && styles.celdaHoy]}
                >
                  <AppText variant="body2" tone={celda.delMes ? 'default' : 'tertiary'} locked>
                    {String(Number(celda.dia.slice(8, 10)))}
                  </AppText>
                  <View style={styles.puntos}>
                    {delaCelda.slice(0, MAX_PUNTOS).map((e) => (
                      <View key={e.id} style={[styles.punto, { backgroundColor: colorDe(e) }]} />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <AppText variant="subtitle2">{diaAVisible(diaElegido)}</AppText>
        {delDia.length === 0 ? (
          <AppText variant="body2" tone="secondary">
            Sin eventos
          </AppText>
        ) : (
          delDia.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => setDetalle(e)}
              accessibilityRole="button"
              accessibilityLabel={e.titulo}
              style={styles.evento}
            >
              <View style={[styles.barra, { backgroundColor: colorDe(e) }]} />
              <View style={styles.eventoTextos}>
                <AppText variant="body2">{e.titulo}</AppText>
                <AppText variant="caption" tone="secondary">
                  {e.desde === e.hasta ? diaAVisible(e.desde) : `${diaAVisible(e.desde)} al ${diaAVisible(e.hasta)}`}
                </AppText>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {personasDelMes.length > 0 || eventos.some((e) => e.tipo === 'feriado') ? (
        <View style={styles.card}>
          <AppText variant="subtitle2">Referencias</AppText>
          <View style={styles.referencias}>
            <View style={styles.referencia}>
              <View style={[styles.punto, { backgroundColor: COLOR_FERIADO }]} />
              <AppText variant="caption">Feriado</AppText>
            </View>
            {personasDelMes.map((nombre) => (
              <View key={nombre} style={styles.referencia}>
                <View style={[styles.punto, { backgroundColor: colorDePersona(nombre, isDark) }]} />
                <AppText variant="caption">{nombre}</AppText>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <ModalDetalleCalendario visible={detalle !== null} evento={detalle} onClose={() => setDetalle(null)} />
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    seccion: { gap: spacing.lg },
    card: {
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.md,
      gap: spacing.sm,
      ...platformSpecific.shadow(1),
    },
    navegacion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    fila: { flexDirection: 'row' },
    celdaEncabezado: { flex: 1, alignItems: 'center', paddingVertical: spacing.xs },
    celda: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xxs,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    celdaElegida: { backgroundColor: c.accentPrimaryMuted },
    celdaHoy: { borderColor: c.accentPrimary },
    puntos: { flexDirection: 'row', gap: 2, minHeight: 6 },
    punto: { width: 6, height: 6, borderRadius: borderRadius.round },
    evento: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.md, paddingVertical: spacing.xs },
    barra: { width: 4, borderRadius: borderRadius.round },
    eventoTextos: { flex: 1, gap: spacing.xxs },
    referencias: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    referencia: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  });
