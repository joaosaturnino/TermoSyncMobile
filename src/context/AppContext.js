import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const AppContext = createContext();

// 🔴 AVISO: MANTÉM AQUI O TEU IP DA REDE LOCAL
const API_URL = 'http://192.168.56.1:3000/api'; 
const SOCKET_URL = 'http://192.168.56.1:3000';

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userFilial, setUserFilial] = useState(null);
  const [nomeLogado, setNomeLogado] = useState('');
  const [papelLogado, setPapelLogado] = useState('');

  const [equipamentos, setEquipamentos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [filiaisDb, setFiliaisDb] = useState([]);
  const [filialAtiva, setFilialAtiva] = useState('Todas');

  const [socket, setSocket] = useState(null);
  const [contatosDb, setContatosDb] = useState([]);
  const [historicoChat, setHistoricoChat] = useState([]);
  const [naoLidasPorContato, setNaoLidasPorContato] = useState({});
  const [chamadaAtiva, setChamadaAtiva] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [somAtivoState, setSomAtivoState] = useState(true);
  const [latencia, setLatencia] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  const isLoggingOut = useRef(false);

  const theme = {
    primary: '#059669', secondary: '#10b981', background: isDarkMode ? '#0f172a' : '#f8fafc',
    card: isDarkMode ? '#1e293b' : '#ffffff', textMain: isDarkMode ? '#f8fafc' : '#0f172a',
    textMuted: isDarkMode ? '#94a3b8' : '#64748b', border: isDarkMode ? '#334155' : '#e2e8f0',
    danger: '#ef4444', success: '#10b981', warning: '#f59e0b', info: '#38bdf8',
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const alternarSom = () => setSomAtivoState(!somAtivoState);

  // 🔴 1. LOGOUT BLINDADO (Sem Dependências Circulares)
  const logout = useCallback(async () => {
    isLoggingOut.current = true;
    setToken(null); setUserId(null); setUserRole(null); setUserFilial(null); setNomeLogado(''); setPapelLogado('');
    await AsyncStorage.multiRemove(['token', 'userId', 'userRole', 'userFilial', 'nomeLogado', 'papelLogado']);
    
    setSocket(prevSocket => {
      if (prevSocket) prevSocket.disconnect();
      return null;
    });
    
    setTimeout(() => { isLoggingOut.current = false; }, 1000);
  }, []);

  const carregarDadosLocais = async () => {
    try {
      const t = await AsyncStorage.getItem('token');
      const id = await AsyncStorage.getItem('userId');
      const role = await AsyncStorage.getItem('userRole');
      const filial = await AsyncStorage.getItem('userFilial');
      const nome = await AsyncStorage.getItem('nomeLogado');
      const papel = await AsyncStorage.getItem('papelLogado');

      if (t) {
        setToken(t); setUserId(id); setUserRole(role); setUserFilial(filial); setNomeLogado(nome || 'Utilizador'); setPapelLogado(papel || 'Gestor');
      }
    } catch (e) { console.log("Erro ao carregar storage:", e); }
  };

  useEffect(() => { carregarDadosLocais(); }, []);

  // 🔴 2. INTERCEPTOR OTIMIZADO
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          if (!isLoggingOut.current) {
            console.log("🔒 Token expirado/inválido. A redirecionar para o Login...");
            logout();
          }
        }
        return Promise.reject(error);
      }
    );
    return instance;
  }, [token, logout]);

  const carregarDashboard = useCallback(async () => {
    if (!token) return;
    try {
      const [resEq, resNotif, resContatos, resHist, resFiliais] = await Promise.all([
        api.get('/equipamentos').catch(() => ({ data: [] })),
        api.get('/notificacoes').catch(() => ({ data: [] })),
        api.get('/contatos').catch(() => ({ data: [] })),
        api.get('/chat/historico').catch(() => ({ data: [] })),
        api.get('/auxiliares/filiais').catch(() => ({ data: [] }))
      ]);
      setEquipamentos(resEq.data);
      setNotificacoes(resNotif.data);
      setContatosDb(resContatos.data);
      setHistoricoChat(resHist.data);
      if (resFiliais.data && resFiliais.data.length > 0) setFiliaisDb(resFiliais.data);
    } catch (e) {}
  }, [token, api]);

  useEffect(() => {
    if (token) carregarDashboard();
  }, [token, carregarDashboard]);

  // 🔴 3. WEBSOCKET ISOLADO DO CICLO DO DASHBOARD
  useEffect(() => {
    if (!token || !userId) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit('registrar_usuario', userId);

    newSocket.on('nova_leitura', () => carregarDashboard());
    newSocket.on('atualizacao_dados', () => carregarDashboard());

    newSocket.on('nova_mensagem_chat', (msg) => {
      setHistoricoChat(prev => {
        if ((prev || []).some(m => String(m.id) === String(msg.id))) return prev;
        return [...(prev || []), { ...msg, tipo: 'received' }];
      });
      setNaoLidasPorContato(prev => ({
        ...prev,
        [msg.remetenteId]: (prev[msg.remetenteId] || 0) + 1
      }));
    });

    newSocket.on('chamada_recebida', (data) => {
      setChamadaAtiva({ peer: { id: data.remetenteId, nome: data.remetenteNome }, state: 'incoming' });
    });
    newSocket.on('chamada_atendida', () => setChamadaAtiva(prev => prev ? { ...prev, state: 'active' } : null));
    newSocket.on('chamada_recusada', () => setChamadaAtiva(null));
    newSocket.on('chamada_terminada', () => setChamadaAtiva(null));

    const pingInterval = setInterval(() => {
      newSocket.emit('medir_latencia', Date.now(), (timestamp) => {
        setLatencia(Date.now() - timestamp);
      });
    }, 3000);

    return () => {
      clearInterval(pingInterval);
      newSocket.disconnect();
    }
  }, [token, userId, carregarDashboard]);

  return (
    <AppContext.Provider value={{
      token, setToken, userId, setUserId, userRole, setUserRole, userFilial, setUserFilial, nomeLogado, setNomeLogado, papelLogado, setPapelLogado,
      equipamentos, notificacoes, carregarDashboard, api, logout,
      socket, contatosDb, historicoChat, setHistoricoChat, naoLidasPorContato, setNaoLidasPorContato, chamadaAtiva, setChamadaAtiva,
      filialAtiva, setFilialAtiva, filiaisDb,
      isDarkMode, toggleTheme, theme, somAtivoState, alternarSom, latencia, isOffline
    }}>
      {children}
    </AppContext.Provider>
  );
};