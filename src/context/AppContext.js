import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children, onLogout }) => {
  const [userRole, setUserRole] = useState('LOJA');
  const [userFilial, setUserFilial] = useState('');
  const [filialAtiva, setFilialAtiva] = useState('Todas');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      const filial = await AsyncStorage.getItem('userFilial');
      const mode = await AsyncStorage.getItem('theme');
      
      if (role) setUserRole(role);
      if (filial) { 
        setUserFilial(filial); 
        // 🔴 CORREÇÃO: Admin e Manutenção têm visão Global
        setFilialAtiva(role !== 'LOJA' ? 'Todas' : filial); 
      }
      if (mode === 'dark') setIsDarkMode(true);
    } catch (e) {
      console.log('Erro ao carregar contexto', e);
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setUserRole('LOJA');
    setUserFilial('');
    setFilialAtiva('Todas');
    if (onLogout) onLogout();
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    card: isDarkMode ? '#1e293b' : '#ffffff',
    textMain: isDarkMode ? '#f8fafc' : '#0f172a',
    textMuted: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    primary: '#059669',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#38bdf8'
  };

  return (
    <AppContext.Provider value={{ userRole, userFilial, filialAtiva, setFilialAtiva, isDarkMode, toggleTheme, theme, logout }}>
      {children}
    </AppContext.Provider>
  );
};