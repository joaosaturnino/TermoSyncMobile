import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';
import api from '../api/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState('LOJA');
  const [userFilial, setUserFilial] = useState('');
  const [filialAtiva, setFilialAtiva] = useState('Todas');
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [nomeLogado, setNomeLogado] = useState('');
  const [papelLogado, setPapelLogado] = useState('');
  const [loginAtivo, setLoginAtivo] = useState('');

  const [equipamentos, setEquipamentos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [chamados, setChamados] = useState([]);
  const [tecnicosDb, setTecnicosDb] = useState([]);
  const [lojasCadastradas, setLojasCadastradas] = useState([]);
  const [filiaisDb, setFiliaisDb] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarCredenciais();
  }, []);

  const carregarCredenciais = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      const savedRole = await AsyncStorage.getItem('userRole');
      const savedFilial = await AsyncStorage.getItem('userFilial');
      const savedNome = await AsyncStorage.getItem('nomeLogado');
      const savedPapel = await AsyncStorage.getItem('papelLogado');
      const savedLogin = await AsyncStorage.getItem('loginAtivo');
      const mode = await AsyncStorage.getItem('theme');

      if (mode === 'dark') setIsDarkMode(true);

      if (savedToken) {
        setToken(savedToken);
        setUserRole(savedRole || 'LOJA');
        setUserFilial(savedFilial || '');
        setFilialAtiva(savedRole !== 'LOJA' ? 'Todas' : (savedFilial || ''));
        setNomeLogado(savedNome || '');
        setPapelLogado(savedPapel || '');
        setLoginAtivo(savedLogin || '');
        
        api.defaults.headers.Authorization = `Bearer ${savedToken}`;
        await carregarDadosBasicos();
      }
    } catch (e) {
      console.log('Erro ao carregar cache:', e);
    } finally {
      setLoading(false);
    }
  };

  const carregarDadosBasicos = async () => {
    try {
      const [resEq, resNot, resCham, resTec, resLoj, resFil] = await Promise.all([
        api.get('/equipamentos').catch(() => ({ data: [] })),
        api.get('/notificacoes').catch(() => ({ data: [] })),
        api.get('/chamados').catch(() => ({ data: [] })),
        api.get('/tecnicos').catch(() => ({ data: [] })),
        api.get('/lojas').catch(() => ({ data: [] })),
        api.get('/auxiliares/filiais').catch(() => ({ data: [] }))
      ]);
      setEquipamentos(resEq.data || []);
      setNotificacoes(resNot.data || []);
      setChamados(resCham.data || []);
      setTecnicosDb(resTec.data || []);
      setLojasCadastradas(resLoj.data || []);
      setFiliaisDb(resFil.data || []);
    } catch (error) {
      console.log('Erro ao carregar dados da API:', error.message);
    }
  };

  const login = async (usuario, senha) => {
    const res = await api.post('/login', { usuario, senha });
    const data = res.data;
    
    let identityName = usuario;
    let roleTitle = 'Gestor de Loja';

    if (data.role === 'ADMIN') { 
      identityName = 'Administrador'; 
      roleTitle = 'Acesso Master'; 
    } else if (data.role === 'MANUTENCAO') { 
      identityName = data.nome_tecnico || 'Técnico'; 
      roleTitle = 'Manutenção Global'; 
    } else if (data.role === 'LOJA') {
      if (data.nome_gerente) { identityName = data.nome_gerente; roleTitle = 'Gerente da Loja'; }
      else if (data.nome_coordenador) { identityName = data.nome_coordenador; roleTitle = 'Coordenador da Loja'; }
      else { identityName = 'Equipa Geral'; roleTitle = 'Acesso da Loja'; }
    }

    await AsyncStorage.multiSet([
      ['token', data.token],
      ['userRole', data.role],
      ['userFilial', data.filial || ''],
      ['nomeLogado', identityName],
      ['papelLogado', roleTitle],
      ['loginAtivo', usuario]
    ]);

    setToken(data.token);
    setUserRole(data.role);
    setUserFilial(data.filial || '');
    setFilialAtiva(data.role !== 'LOJA' ? 'Todas' : (data.filial || ''));
    setNomeLogado(identityName);
    setPapelLogado(roleTitle);
    setLoginAtivo(usuario);
    
    api.defaults.headers.Authorization = `Bearer ${data.token}`;
    await carregarDadosBasicos();
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setToken(null);
    setUserRole('LOJA');
    setUserFilial('');
    setFilialAtiva('Todas');
    setNomeLogado('');
    setPapelLogado('');
    setLoginAtivo('');
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
    <AppContext.Provider value={{
      token, userRole, userFilial, filialAtiva, setFilialAtiva, isDarkMode, toggleTheme, theme,
      nomeLogado, papelLogado, loginAtivo,
      equipamentos, notificacoes, chamados, tecnicosDb, lojasCadastradas, filiaisDb,
      login, logout, carregarDadosBasicos
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
};