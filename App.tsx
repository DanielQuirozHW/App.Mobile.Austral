import React from 'react';
import { AppProviders } from './src/presentation/providers/AppProviders';
import { AppNavigation } from './src/presentation/navigation/AppNavigation';

// Proveedores (zona segura, teclado, tema, caché de consultas) + navegación raíz.
function App(): React.JSX.Element {
  return (
    <AppProviders>
      <AppNavigation />
    </AppProviders>
  );
}

export default App;
