// Inicio de la app mobile. En lugar del menú lateral del portal, el acceso a los módulos es una grilla de íconos
// (docs/DECISION-UI-MOBILE.md): saludo y puesto arriba, la campana de notificaciones y el avatar (que abre el menú del
// usuario: Cambiar puesto, Ajustes, Cerrar sesión), y debajo un mosaico por módulo con las MISMAS reglas de visibilidad
// del menú del portal (navigation/modulosMenu.ts: puesto elegido y funciones de gestión).
// Los módulos que tienen subopciones (Legajo, Perfil, Funciones SA...) abren una pantalla de subopciones
// (screens/SubmenuScreen.tsx); los que todavía no tienen contenido figuran con la etiqueta "Próximamente".
// Debajo de la grilla van los datos del tablero del portal (decisión 89): frase del mes, cumpleaños y feriados.
// Tirar para actualizar vuelve a leer las notificaciones (decisión 98).
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { fraseDelMesActual, nombreParaBienvenida, periodoDelMes } from '../../domain/inicio/tablero';
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
import { filtrarNodos, SECCIONES_DE_MENU } from '../navigation/modulosMenu';
import { useAuthStore } from '../stores/authStore';
import { useRolStore } from '../stores/rolStore';
import { colorDeModulo } from '../theme/coloresModulos';
import { spacing } from '../utils/responsive';

export const InicioScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const role = useRolStore((s) => s.role);
  const { proximosFeriados, cargandoFeriados, cumpleaniosHoy, fechaDeHoy } = useTablero();
  const { pendientes, refrescar } = useNotificaciones();

  const frase = useMemo(() => fraseDelMesActual(new Date()), []);
  const periodo = useMemo(() => periodoDelMes(new Date()), []);

  // Los módulos que ve este usuario con este puesto, sin la propia entrada "Inicio".
  const modulos = useMemo(
    () =>
      SECCIONES_DE_MENU.flatMap((seccion) => filtrarNodos(seccion.nodos, { puesto: role, user })).filter(
        (nodo) => nodo.id !== 'inicio',
      ),
    [role, user],
  );

  return (
    <Screen scroll onRefresh={() => refrescar()} contentContainerStyle={styles.contenido}>
      <View style={styles.cabecera}>
        <View style={styles.saludo}>
          <AppText variant="body2" tone="secondary">
            Hola,
          </AppText>
          <AppText variant="h3" numberOfLines={2}>
            {nombreParaBienvenida(user)}
          </AppText>
          <PildoraPuesto />
        </View>
        <AccionesDeEncabezado />
      </View>

      <View style={styles.grilla}>
        {modulos.map((nodo, indice) => {
          const color = colorDeModulo(nodo.id, indice);
          return (
            <ModuloTile
              key={nodo.id}
              titulo={nodo.titulo}
              icono={nodo.icono}
              color={color}
              proximamente={esProximamente(nodo)}
              insignia={nodo.id === 'app-notificaciones' ? pendientes.length : 0}
              onPress={() => abrirNodo(nodo, { color })}
            />
          );
        })}
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

const styles = StyleSheet.create({
  contenido: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  cabecera: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  saludo: { flex: 1, gap: spacing.xs },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  seccion: { gap: spacing.md },
});
