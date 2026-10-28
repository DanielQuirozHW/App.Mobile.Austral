// Inicio de la app mobile (docs/DECISION-UI-MOBILE.md). De arriba hacia abajo:
//  - barra con el nombre de la institución, la campana de notificaciones y el avatar (que abre el menú del usuario);
//  - tarjeta de saludo con la hora, el nombre y la fecha, y dos pastillas: el puesto y, si hay, las notificaciones
//    pendientes (que llevan a Notificaciones). Sus colores salen de los tokens `hero*`: azul de la marca en claro, verde
//    azulado profundo con borde cian en oscuro (un bloque cian pleno encandila sobre fondo oscuro);
//  - los módulos en tarjetas de dos columnas, con las MISMAS reglas de visibilidad del menú del portal
//    (navigation/modulosMenu.ts: puesto elegido y funciones de gestión). Notificaciones y Ajustes NO van acá: ya se
//    abren desde la campana y desde el avatar. Los colores de cada módulo tienen variante para modo oscuro;
//  - "Para hoy": frase del mes, cumpleaños y feriados del tablero del portal (decisión 89).
// Un módulo con subopciones abre una pantalla de subopciones (screens/SubmenuScreen.tsx); los que todavía no tienen
// contenido figuran con la etiqueta "Próximamente". Las secciones y las tarjetas entran en cascada (Aparece).
// Tirar para actualizar vuelve a leer las notificaciones (decisión 98).
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { fraseDelMesActual, nombreParaBienvenida, periodoDelMes } from '../../domain/inicio/tablero';
import { Aparece } from '../components/Aparece';
import { AppIcon } from '../components/AppIcon';
import { AppText } from '../components/AppText';
import { CumpleaniosCard } from '../components/inicio/CumpleaniosCard';
import { FraseDelMes } from '../components/inicio/FraseDelMes';
import { ModuloTile } from '../components/inicio/ModuloTile';
import { ProximosFeriadosCard } from '../components/inicio/ProximosFeriadosCard';
import { AccionesDeEncabezado } from '../components/menu/AccionesDeEncabezado';
import { Screen } from '../components/Screen';
import { useNotificaciones } from '../hooks/useNotificaciones';
import { useTablero } from '../hooks/useTablero';
import { abrirNodo, descripcionDeNodo, esProximamente } from '../navigation/grilla';
import { filtrarNodos, SECCIONES_DE_MENU } from '../navigation/modulosMenu';
import { irAModulo } from '../navigation/navigationRef';
import { useAuthStore } from '../stores/authStore';
import { metaDeRol, useRolStore } from '../stores/rolStore';
import { ColorTokens } from '../theme/colors';
import { colorDeModulo } from '../theme/coloresModulos';
import { useThemeColors } from '../theme/theme';
import { borderRadius, iconSizes, scale, spacing } from '../utils/responsive';

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

export const InicioScreen: React.FC = () => {
  const { globalColors, isDark } = useThemeColors();
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
  const textoPuesto = role ? `Portal ${metaDeRol(role).label}` : '';

  // Los módulos que ve este usuario con este puesto, sin Inicio, Notificaciones ni Ajustes (esos van en el encabezado).
  const modulos = useMemo(() => {
    const contexto = { puesto: role, user };
    return SECCIONES_DE_MENU.flatMap((seccion) => filtrarNodos(seccion.nodos, contexto))
      .filter((nodo) => nodo.id !== 'inicio' && nodo.id !== 'app-notificaciones' && nodo.id !== 'app-ajustes')
      .map((nodo) => ({
        nodo,
        descripcion: descripcionDeNodo(nodo, nodo.hijos ? filtrarNodos(nodo.hijos, contexto) : []),
      }));
  }, [role, user]);

  const cantidadPendientes = pendientes.length;
  const textoPendientes = cantidadPendientes === 1 ? '1 pendiente' : `${cantidadPendientes} pendientes`;

  return (
    <Screen scroll onRefresh={() => refrescar()} contentContainerStyle={styles.contenido}>
      <View style={styles.barra}>
        <AppText variant="subtitle1" tone="primary">
          Universidad Austral
        </AppText>
        <AccionesDeEncabezado />
      </View>

      <Aparece>
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

          <View style={styles.pastillas}>
            {textoPuesto ? (
              <View style={styles.pastilla}>
                <AppIcon name="briefcase-outline" size={iconSizes.sm} color={globalColors.heroText} />
                <AppText variant="caption" style={styles.pastillaTexto}>
                  {textoPuesto}
                </AppText>
              </View>
            ) : null}
            {cantidadPendientes > 0 ? (
              <Pressable
                onPress={() => irAModulo('Notificaciones')}
                accessibilityRole="button"
                accessibilityLabel={`${textoPendientes} notificaciones. Abrir notificaciones`}
                style={({ pressed }) => [styles.pastilla, styles.pastillaAccion, pressed && styles.pastillaPresionada]}
              >
                <AppIcon name="notifications" size={iconSizes.sm} color={globalColors.heroText} />
                <AppText variant="caption" style={styles.pastillaTexto}>
                  {textoPendientes}
                </AppText>
                <AppIcon name="chevron-forward" size={iconSizes.sm} color={globalColors.heroText} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </Aparece>

      <View style={styles.seccion}>
        <Aparece demora={100}>
          <AppText variant="h5">Mis módulos</AppText>
        </Aparece>
        <View style={styles.grilla}>
          {modulos.map(({ nodo, descripcion }, indice) => {
            const color = colorDeModulo(nodo.id, indice, isDark);
            return (
              <ModuloTile
                key={nodo.id}
                titulo={nodo.titulo}
                icono={nodo.icono}
                color={color}
                descripcion={descripcion}
                proximamente={esProximamente(nodo)}
                demora={140 + indice * 70}
                onPress={() => abrirNodo(nodo, { color })}
              />
            );
          })}
        </View>
      </View>

      <Aparece demora={140 + modulos.length * 70}>
        <View style={styles.seccion}>
          <AppText variant="h5">Para hoy</AppText>
          <FraseDelMes frase={frase.texto} autor={frase.autor} fuente={`${frase.libro}, ${frase.numero}`} periodo={periodo} />
          <CumpleaniosCard fechaLabel={fechaDeHoy} cumpleanios={cumpleaniosHoy} />
          <ProximosFeriadosCard feriados={proximosFeriados} cargando={cargandoFeriados} />
        </View>
      </Aparece>
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
      backgroundColor: c.heroBackground,
      borderWidth: 1,
      borderColor: c.heroBorder,
    },
    circuloGrande: {
      position: 'absolute',
      top: -scale(50),
      right: -scale(40),
      width: scale(180),
      height: scale(180),
      borderRadius: scale(90),
      backgroundColor: c.heroCircle,
    },
    circuloChico: {
      position: 'absolute',
      bottom: -scale(30),
      right: scale(60),
      width: scale(90),
      height: scale(90),
      borderRadius: scale(45),
      backgroundColor: c.heroCircle,
    },
    heroTitulo: { color: c.heroText },
    heroSecundario: { color: c.heroTextMuted },
    pastillas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
    pastilla: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.round,
      backgroundColor: c.heroChip,
    },
    pastillaAccion: { backgroundColor: c.heroChipAction },
    pastillaPresionada: { opacity: 0.8 },
    pastillaTexto: { color: c.heroText, fontWeight: '600' },
    seccion: { gap: spacing.md },
    grilla: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  });
