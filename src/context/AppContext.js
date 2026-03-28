import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState, useRef, useCallback } from 'react';
import { Alert, View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { api, getSocket } from '../api/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState('LOJA');
  const [userFilial, setUserFilial] = useState('');
  const [filialAtiva, setFilialAtiva] = useState('Todas');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [latencia, setLatencia] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [somAtivoState, setSomAtivoState] = useState(true);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const CUSTO_KWH_REAIS = 0.72; 
  const FATOR_EMISSAO_CO2 = 0.25;

  const [nomeLogado, setNomeLogado] = useState('');
  const [papelLogado, setPapelLogado] = useState('');
  const [loginAtivo, setLoginAtivo] = useState('');

  const [equipamentos, setEquipamentos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [chamados, setChamados] = useState([]);
  const [tecnicosDb, setTecnicosDb] = useState([]);
  const [filiaisDb, setFiliaisDb] = useState([]);
  const [setoresDb, setSetoresDb] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const lastAlertIdRef = useRef(-1);
  const soundObject = useRef(new Audio.Sound());

  useEffect(() => { carregarCredenciais(); initAudio(); }, []);

  const initAudio = async () => {
    try { await soundObject.current.loadAsync(require('../../assets/sounds/alert.mp3')); } catch (e) {}
  };

  const tocarAlarme = async () => {
    if (!somAtivoState) return;
    try { await soundObject.current.replayAsync(); } catch (e) {}
  };

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setToast({ show: false, message: '', type: 'success' });
      });
    }, 5000);
  }, [fadeAnim]);

  const alternarSom = () => {
    const novoEstado = !somAtivoState;
    setSomAtivoState(novoEstado);
    showToast(novoEstado ? 'Alarmes sonoros ativados.' : 'Alarmes sonoros silenciados.', 'info');
  };

  const carregarCredenciais = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        setUserRole(await AsyncStorage.getItem('userRole') || 'LOJA');
        setUserFilial(await AsyncStorage.getItem('userFilial') || '');
        setNomeLogado(await AsyncStorage.getItem('nomeLogado') || '');
        setPapelLogado(await AsyncStorage.getItem('papelLogado') || '');
        setLoginAtivo(await AsyncStorage.getItem('loginAtivo') || '');
        if (await AsyncStorage.getItem('theme') === 'dark') setIsDarkMode(true);
        await carregarDadosBasicos();
      }
    } catch (e) {} finally { setLoading(false); }
  };

  const fazerLogin = async (usuario, senha) => {
    try {
      const res = await api.post('/api/login', { usuario, senha });
      setToken(res.data.token); setUserRole(res.data.role); setUserFilial(res.data.filial);
      setFilialAtiva(res.data.role !== 'LOJA' ? 'Todas' : res.data.filial);
      
      let identityName = usuario; let roleTitle = 'Gestor de Loja';
      if (res.data.role === 'ADMIN') { identityName = 'Administrador'; roleTitle = 'Acesso Master'; }
      else if (res.data.role === 'MANUTENCAO') { identityName = res.data.nome_tecnico || 'Técnico'; roleTitle = 'Manutenção Global'; }
      else if (res.data.role === 'LOJA') {
          if (res.data.nome_gerente) { identityName = res.data.nome_gerente; roleTitle = 'Gerente da Loja'; }
          else if (res.data.nome_coordenador) { identityName = res.data.nome_coordenador; roleTitle = 'Coordenador da Loja'; }
      }

      setNomeLogado(identityName); setPapelLogado(roleTitle); setLoginAtivo(usuario);

      await AsyncStorage.setItem('token', res.data.token); await AsyncStorage.setItem('userRole', res.data.role); await AsyncStorage.setItem('userFilial', res.data.filial);
      await AsyncStorage.setItem('nomeLogado', identityName); await AsyncStorage.setItem('papelLogado', roleTitle); await AsyncStorage.setItem('loginAtivo', usuario);
      
      showToast(`Bem-vindo! Acesso: ${identityName}`, 'success');
      await carregarDadosBasicos();
    } catch (error) {
      setIsOffline(!error.response);
      showToast(error.response ? 'Credenciais incorretas.' : 'Gateway Offline.', 'error');
    }
  };

  const carregarDadosBasicos = useCallback(async () => {
    try {
      const [resEq, resNot, resCham, resTec, resFil, resSet] = await Promise.all([
        api.get('/api/equipamentos'), api.get('/api/notificacoes'), api.get('/api/chamados'),
        api.get('/api/tecnicos'), api.get('/api/auxiliares/filiais'), api.get('/api/auxiliares/setores')
      ]);
      setEquipamentos(resEq.data || []); setChamados(resCham.data || []); setTecnicosDb(resTec.data || []);
      setFiliaisDb(resFil.data || []); setSetoresDb(resSet.data || []); setIsOffline(false);

      const notifs = resNot.data || [];
      const idMaisAlto = notifs.length > 0 ? Math.max(...notifs.map(n => n.id)) : 0;
      
      if (lastAlertIdRef.current !== -1 && idMaisAlto > lastAlertIdRef.current) {
        const novos = notifs.filter(n => n.id > lastAlertIdRef.current);
        if (novos.length > 0) {
          const isDegelo = novos[0].tipo_alerta === 'DEGELO';
          
          if (!isDegelo && somAtivoState) tocarAlarme();
          
          // 🔴 APENAS o Toast Visual (removi o Alert.alert que causava a duplicação)
          showToast(`${isDegelo ? '❄️' : '🚨'} ${novos[0].mensagem}`, isDegelo ? 'info' : 'error');
        }
      }
      lastAlertIdRef.current = idMaisAlto; setNotificacoes(notifs);
    } catch (error) { setIsOffline(true); }
  }, [somAtivoState, showToast]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket();
    const pingInterval = setInterval(() => { socket.emit('medir_latencia', Date.now(), (e) => { setLatencia(Date.now() - e); setIsOffline(false); }); }, 2500);
    socket.on('disconnect', () => setIsOffline(true));
    socket.on('atualizacao_dados', () => carregarDadosBasicos());
    socket.on('nova_leitura', (dadosNova) => {
      setEquipamentos(prev => prev.map(eq => String(eq.id) === String(dadosNova.equipamento_id) ? { ...eq, ultima_temp: dadosNova.temperatura, ultima_umidade: dadosNova.umidade, motor_ligado: dadosNova.motor_ligado, em_degelo: dadosNova.em_degelo } : eq));
    });
    return () => { clearInterval(pingInterval); socket.off('nova_leitura'); socket.off('atualizacao_dados'); };
  }, [token, carregarDadosBasicos]);

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc', card: isDarkMode ? '#1e293b' : '#ffffff',
    textMain: isDarkMode ? '#f8fafc' : '#0f172a', textMuted: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0', dangerLight: isDarkMode ? '#450a0a' : '#fee2e2',
    primary: '#059669', success: '#10b981', danger: '#ef4444', warning: '#f59e0b', info: '#38bdf8', alertMech: '#f97316'
  };

  return (
    <AppContext.Provider value={{
      token, userRole, userFilial, filialAtiva, setFilialAtiva, theme, isDarkMode, 
      CUSTO_KWH_REAIS, FATOR_EMISSAO_CO2, nomeLogado, papelLogado, loginAtivo,
      equipamentos, notificacoes, chamados, tecnicosDb, filiaisDb, setoresDb, 
      carregarDadosBasicos, fazerLogin, isOffline, latencia, somAtivoState, alternarSom, showToast,
      toggleTheme: async () => { const val = !isDarkMode; setIsDarkMode(val); await AsyncStorage.setItem('theme', val ? 'dark' : 'light'); },
      logout: async () => { await AsyncStorage.clear(); setToken(null); }
    }}>
      {!loading && children}

      {toast.show && (
        <Animated.View style={[
          styles.toastContainer, 
          { opacity: fadeAnim },
          toast.type === 'error' ? styles.toastError : (toast.type === 'info' ? styles.toastInfo : styles.toastSuccess)
        ]}>
          <MaterialCommunityIcons 
            name={toast.type === 'error' ? 'alert-circle' : (toast.type === 'info' ? 'information' : 'check-circle')} 
            size={24} color="#ffffff" style={{ marginRight: 10 }} 
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </AppContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    maxWidth: '90%',
    zIndex: 99999,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(255,255,255,0.5)'
  },
  toastSuccess: { backgroundColor: '#10b981' },
  toastError: { backgroundColor: '#ef4444' },
  toastInfo: { backgroundColor: '#38bdf8' },
  toastText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold', flexShrink: 1, lineHeight: 20 }
});