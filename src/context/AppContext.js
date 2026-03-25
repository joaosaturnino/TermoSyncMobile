import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';

// Cores exatas do App.css da Web
export const lightTheme = { primary: '#059669', secondary: '#10b981', bg: '#f8fafc', card: '#ffffff', textMain: '#0f172a', textMuted: '#64748b', danger: '#ef4444', dangerLight: '#fee2e2', success: '#10b981', warning: '#f59e0b', info: '#38bdf8', alertMech: '#f97316', border: '#e2e8f0', shadow: 'rgba(0, 0, 0, 0.05)' };
export const darkTheme = { primary: '#059669', secondary: '#10b981', bg: '#0f172a', card: '#1e293b', textMain: '#f8fafc', textMuted: '#94a3b8', danger: '#ef4444', dangerLight: '#7f1d1d', success: '#10b981', warning: '#f59e0b', info: '#38bdf8', alertMech: '#ea580c', border: '#334155', shadow: 'rgba(0, 0, 0, 0.5)' };

export const AppContext = createContext();

export const AppProvider = ({ children, onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userRole, setUserRole] = useState('LOJA');
  const [userFilial, setUserFilial] = useState('');
  const [filialAtiva, setFilialAtiva] = useState('Todas');
  const [listaFiliais] = useState(['Todas', 'Loja Porto', 'Loja Lisboa', 'Loja Coimbra', 'Loja Faro', 'Loja Braga', 'Loja Aveiro', 'Loja Évora']);
  
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    const role = await AsyncStorage.getItem('userRole');
    const filial = await AsyncStorage.getItem('userFilial');
    const mode = await AsyncStorage.getItem('theme');
    
    if (role) setUserRole(role);
    if (filial) { 
        setUserFilial(filial); 
        setFilialAtiva(role === 'ADMIN' ? 'Todas' : filial); 
    }
    if (mode === 'dark') setIsDarkMode(true);
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const logout = async () => {
    await AsyncStorage.clear();
    onLogout();
  };

  return (
    <AppContext.Provider value={{ theme, isDarkMode, toggleTheme, userRole, userFilial, filialAtiva, setFilialAtiva, listaFiliais, logout }}>
      {children}
    </AppContext.Provider>
  );
};