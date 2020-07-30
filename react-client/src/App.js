import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';

// Custom themes
import theme from './styles/theme'
// Custom Components
import Dashboard from './components/Dashboard';
// Custon context providers
import { AppStoreProvider } from './context/appStore';



const App = () => {

  return (
    <ThemeProvider theme={theme}>
      <AppStoreProvider>
          <Dashboard />
      </AppStoreProvider>
    </ThemeProvider>
  );
}

export default App;
