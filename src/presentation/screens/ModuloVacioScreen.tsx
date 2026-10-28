// Pantalla "En construcción" (decisión 100). La abren las entradas del menú del portal que no se migran (Promoción,
// Gestión del Desempeño, Indicadores, Funciones SA / VRAA, Referente MATHU) con `EnConstruccion` y sus parámetros
// (título y camino dentro del menú), y cualquier módulo de modulosMenu.ts que no esté en la demostración (`enDemo: false`),
// que la usa con su propia ruta (el título sale de ahí).
import React from 'react';
import { useRoute } from '@react-navigation/native';
import { EnConstruccion } from '../components/EnConstruccion';
import { Screen } from '../components/Screen';
import { tituloDeRuta } from '../navigation/modulosMenu';

interface ParametrosEnConstruccion {
  titulo?: string;
  ubicacion?: string;
}

export const ModuloVacioScreen: React.FC = () => {
  const route = useRoute();
  const params = route.params as ParametrosEnConstruccion | undefined;

  return (
    <Screen>
      <EnConstruccion titulo={params?.titulo ?? tituloDeRuta(route.name)} ubicacion={params?.ubicacion} />
    </Screen>
  );
};
