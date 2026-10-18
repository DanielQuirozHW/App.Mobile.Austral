import React from 'react';
import { AppProviders } from './src/presentation/providers/AppProviders';
import { LoadingScreen } from './src/presentation/components/LoadingScreen';

// Etapa 1: solo la base (providers). La navegación y el estado de sesión
// reemplazan a LoadingScreen en las etapas 3 y 4.
function App(): React.JSX.Element {
  return (
    <AppProviders>
      <LoadingScreen />
    </AppProviders>
  );
}

export default App;
