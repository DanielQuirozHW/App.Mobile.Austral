// Inicio de la app mobile (docs/DECISION-UI-MOBILE.md). De arriba hacia abajo:
//  - barra con el nombre de la institución, la campana de notificaciones y el avatar (que abre el menú del usuario);
//  - tarjeta de bienvenida con saludo según la hora, el nombre, la fecha y el puesto;
//  - aviso de notificaciones pendientes (solo si hay), que lleva a Notificaciones;
//  - los módulos en tarjetas de dos columnas, con las MISMAS reglas de visibilidad del menú del portal
//    (navigation/modulosMenu.ts: puesto elegido y funciones de gestión). Notificaciones y Ajustes NO van acá: ya se
//    abren desde la campana y desde el avatar;
//  - "Para hoy": frase del mes, cumpleaños y feriados del tablero del portal (decisión 89).
// Un módulo con subopciones abre una pantalla de subopciones (screens/SubmenuScreen.tsx); los que todavía no tienen
// contenido figuran con la etiqueta "Próximamente". Tirar para actualizar vuelve a leer las notificaciones (decisión 98).
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { fraseDelMesActual, nombreParaBienvenida, periodoDelMes } from '../../domain/inicio/tablero';
import { AppIcon } from '../components/AppIcon';
import { AppText } from '../components/AppText';
import { CumpleaniosCard } from '../components/inicio/CumpleaniosCard';
import { FraseDelMes } from '../components/inicio/FraseDelMes';
import { ModuloTile } from '../components/inicio/ModuloTile';
import { ProximosFeriadosCard } from '../components/inicio/ProximosFeriadosCard';
import { AccionesDeEncabezado } from '../components/menu/AccionesDeEncabezado';
import { PildoraPuesto } from '../components/menu/PildoraPuesto';
import { Screen } from '../components/Screen';
import { useNotificaciones } from '../hooks/useNotificaciones';
import { useTablero } from '../hooks/useTablero';
import { abrirNodo, esProximamente } from '../navigation/grilla';
import { filtrarNodos, SECCIONES_DE_MENU, type NodoDeMenu } from '../navigation/modulosMenu';
import { irAModulo } from '../navigation/navigationRef';
import { useAuthStore } from '../stores/authStore';
import { useRolStore } from '../stores/rolStore';
import { ColorTokens } from '../theme/colors';
import { colorDeModulo } from '../theme/coloresModulos';
import { useThemeColors } from '../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../utils/responsive';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const saludoSegunHora = (fecha: Date): string => {
  const hora = fecha.getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 20) return 'Buenas tardes';
  return 'Buenas noches';
};

/** "Miércoles 28 de octubre". */
const fechaLarga = (fecha: Date): string => {
  const dia = DIAS[fecha.getDay()];
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
};

// Qué hay adentro de un módulo, para la línea de la tarjeta. Los grupos listan sus primeras subopciones (salen del propio
// árbol, así que siempre son las que ve este usuario); las hojas usan este texto.
const DESCRIPCION_DE_HOJAS: Record<string, string> = {
  licencias: 'Solicitudes y calendario',
  'plan-de-trabajo': 'Plan de trabajo anual',
};

const descripcionDe = (nodo: NodoDeMenu, visibles: NodoDeMenu[]): string => {
  if (nodo.hijos) {
    const titulos = visibles.map((hijo) => hijo.titulo);
    if (titulos.length === 0) return '';
    if (titulos.length === 1) return titulos[0];
    if (titulos.length === 2) return `${titulos[0]} y ${titulos[1].toLowerCase()}`;
    return `${titulos[0]}, ${titulos[1].toLowerCase()} y más`;
  }
  return DESCRIPCION_DE_HOJAS[nodo.id] ?? '';
};

export const InicioScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const user = useAuthStore((s) => s.user);
  const role = useRolStore((s) => s.role);
  const { proximosFeriados, cargandoFeriados, cumpleaniosHoy, fechaDeHoy } = useTablero();
  const { pendientes, refrescar } = useNotificaciones();

  const frase = useMemo(() => fraseDelMesActual(new Date()), []);
  const periodo = useMemo(() => periodoDelMes(new Date()), []);
  const ahora = useMemo(() => new Date(), []);
  const saludo = saludoSegunHora(ahora);
  const fecha = fechaLarga(ahora);

  // Los módulos que ve este usuario con este puesto, sin Inicio, Notificaciones ni Ajustes (esos van en el encabezado).
  const modulos = useMemo(() => {
    const contexto = { puesto: role, user };
    return SECCIONES_DE_MENU.flatMap((seccion) => filtrarNodos(seccion.nodos, contexto))
      .filter((nodo) => nodo.id !== 'inicio' && nodo.id !== 'app-notificaciones' && nodo.id !== 'app-ajustes')
      .map((nodo) => ({
        nodo,
        descripcion: descripcionDe(nodo, nodo.hijos ? filtrarNodos(nodo.hijos, contexto) : []),
      }));
  }, [role, user]);

  const cantidadPendientes = pendientes.length;
  const textoPendientes =
    cantidadPendientes === 1 ? 'Tenés 1 notificación pendiente' : `Tenés ${cantidadPendientes} notificaciones pendientes`;

  return (
    <Screen scroll onRefresh={() => refrescar()} contentContainerStyle={styles.contenido}>
      <View style={styles.barra}>
        <AppText variant="subtitle1" tone="primary">
          Universidad Austral
        </AppText>
        <AccionesDeEncabezado />
      </View>

      <View style={styles.hero}>
        <View style={styles.circuloGrande} />
        <View style={styles.circuloChico} />
        <AppText variant="body1" style={styles.heroSecundario}>
          {saludo},
        </AppText>
        <AppText variant="h2" numberOfLines={2} style={styles.heroTitulo}>
          {nombreParaBienvenida(user)}
        </AppText>
        <AppText variant="body2" style={styles.heroSecundario}>
          {fecha}
        </AppText>
        <View style={styles.heroPuesto}>
          <PildoraPuesto />
        </View>
      </View>

      {cantidadPendientes > 0 ? (
        <Pressable
          onPress={() => irAModulo('Notificaciones')}
          accessibilityRole="button"
          accessibilityLabel={`${textoPendientes}. Abrir notificaciones`}
          android_ripple={{ color: globalColors.hairline }}
          style={({ pressed }) => [styles.aviso, pressed && styles.avisoPresionado]}
        >
          <View style={styles.avisoIcono}>
            <AppIcon name="notifications" size={iconSizes.md} color="#FFFFFF" />
          </View>
          <View style={styles.avisoTextos}>
            <AppText variant="subtitle2">{textoPendientes}</AppText>
            <AppText variant="caption" tone="secondary">
              Tocá para verlas
            </AppText>
          </View>
          <AppIcon name="chevron-forward" size={iconSizes.md} color={globalColors.textTertiary} />
        </Pressable>
      ) : null}

      <View style={styles.seccion}>
        <AppText variant="h5">Mis módulos</AppText>
        <View style={styles.grilla}>
          {modulos.map(({ nodo, descripcion }, indice) => {
            const color = colorDeModulo(nodo.id, indice);
            return (
              <ModuloTile
                key={nodo.id}
                titulo={nodo.titulo}
                icono={nodo.icono}
                color={color}
                descripcion={descripcion}
                proximamente={esProximamente(nodo)}
                onPress={() => abrirNodo(nodo, { color })}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.seccion}>
        <AppText variant="h5">Para hoy</AppText>
        <FraseDelMes frase={frase.texto} autor={frase.autor} fuente={`${frase.libro}, ${frase.numero}`} periodo={periodo} />
        <CumpleaniosCard fechaLabel={fechaDeHoy} cumpleanios={cumpleaniosHoy} />
        <ProximosFeriadosCard feriados={proximosFeriados} cargando={cargandoFeriados} />
      </View>
    </Screen>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    contenido: { gap: spacing.xl, paddingBottom: spacing.xxxl },
    barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    hero: {
      overflow: 'hidden',
      gap: spacing.xs,
      padding: spacing.xl,
      borderRadius: borderRadius.xxl,
      backgroundColor: c.accentPrimary,
    },
    circuloGrande: {
      position: 'absolute',
      top: -scale(50),
      right: -scale(40),
      width: scale(180),
      height: scale(180),
      borderRadius: scale(90),
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    circuloChico: {
      position: 'absolute',
      bottom: -scale(30),
      right: scale(60),
      width: scale(90),
      height: scale(90),
      borderRadius: scale(45),
      backgroundColor: 'rgba(255,255,255,0.06)',
    },
    heroTitulo: { color: c.accentPrimaryOn },
    heroSecundario: { color: c.accentPrimaryOn, opacity: 0.85 },
    heroPuesto: { marginTop: spacing.md, alignSelf: 'flex-start' },
    aviso: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      backgroundColor: c.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: c.border,
      ...platformSpecific.shadow(2),
    },
    avisoPresionado: { opacity: 0.85 },
    avisoIcono: {
      width: scale(40),
      height: scale(40),
      borderRadius: borderRadius.md,
      backgroundColor: c.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avisoTextos: { flex: 1, gap: spacing.xxs },
    seccion: { gap: spacing.md },
    grilla: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  });
