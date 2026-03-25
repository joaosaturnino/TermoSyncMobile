import { AppContext } from './src/context/AppContext';

export default function App() {
  // Os tokens de design (cores) idênticos ao CSS da Web
  const theme = {
    primary: '#059669',
    secondary: '#10b981',
    bg: '#f8fafc',
    card: '#ffffff',
    textMain: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#38bdf8'
  };

  return (
    // O Provider TEM de envolver toda a aplicação e passar o theme
    <AppContext.Provider value={{ 
      theme, 
      filialAtiva: 'Todas', 
      userRole: 'ADMIN', 
      userFilial: '' 
    }}>
      {/* O seu LoginScreen ou Navegador entra aqui */}
    </AppContext.Provider>
  );
}