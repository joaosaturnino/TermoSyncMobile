import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity, 
  TextInput, Modal, Dimensions, StatusBar, Alert 
} from 'react-native';
import { io } from 'socket.io-client';
import axios from 'axios';
import { 
  Activity, Thermometer, Map as MapIcon, MessageSquare, Menu, X, 
  Bell, Lock, LogOut, PieChart, ShieldCheck, Server 
} from 'lucide-react-native';

// Telas do App
import Dashboard from './src/screens/Dashboard';
import PainelDesenvolvedor from './src/screens/PainelDesenvolvedor';
import Sobre from './src/screens/Sobre';
import Chat from './src/screens/Chat';

const API_URL = 'http://SEU_IP_LOCAL:3000/api'; // Substitua pelo IP da sua máquina na rede
const SOCKET_URL = 'http://SEU_IP_LOCAL:3000';

export default function App() {
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [socketInstance, setSocketInstance] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  
  // Estados de Autenticação Básica
  const [usuarioInput, setUsuarioInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');

  // Conexão Socket.io
  useEffect(() => {
    if (!token) return;
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    setSocketInstance(socket);

    socket.emit('registrar_usuario', userId);

    socket.on('novo_alerta', (alerta) => {
      setNotificacoes(prev => [alerta, ...prev]);
      // Aqui você pode adicionar notificações Push Nativas (expo-notifications)
    });

    return () => socket.disconnect();
  }, [token, userId]);

  const fazerLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, { usuario: usuarioInput, senha: senhaInput });
      setToken(res.data.token);
      setUserId(res.data.id);
      Alert.alert('Sucesso', `Bem-vindo(a), ${res.data.nome_tecnico || usuarioInput}`);
    } catch (e) {
      Alert.alert('Erro', 'Credenciais inválidas.');
    }
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.loginBox}>
          <ShieldCheck size={64} color="#10b981" style={{ alignSelf: 'center', marginBottom: 20 }} />
          <Text style={styles.loginTitle}>TermoSync NOC</Text>
          <Text style={styles.loginSubtitle}>Acesso Mobile</Text>
          
          <TextInput 
            style={styles.input} 
            placeholder="Usuário" 
            placeholderTextColor="#64748b"
            value={usuarioInput}
            onChangeText={setUsuarioInput}
            autoCapitalize="none"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Senha" 
            placeholderTextColor="#64748b"
            secureTextEntry
            value={senhaInput}
            onChangeText={setSenhaInput}
          />
          
          <TouchableOpacity style={styles.btnPrimary} onPress={fazerLogin}>
            <Text style={styles.btnPrimaryText}>ENTRAR NO SISTEMA</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      {/* HEADER FIXO MOBILE */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuAberto(true)} style={styles.headerBtn}>
          <Menu size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TermoSync</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Bell size={22} color="#ffffff" />
          {notificacoes.length > 0 && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      {/* ÁREA DE CONTEÚDO (SCROLL) */}
      <ScrollView style={styles.workspace} contentContainerStyle={{ paddingBottom: 80 }}>
        {abaAtiva === 'dashboard' && <Dashboard socket={socketInstance} />}
        {abaAtiva === 'bi' && <PainelDesenvolvedor />}
        {abaAtiva === 'chat' && <Chat socket={socketInstance} />}
        {abaAtiva === 'sobre' && <Sobre />}
      </ScrollView>

      {/* BARRA DE NAVEGAÇÃO INFERIOR (BOTTOM TAB) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setAbaAtiva('dashboard')}>
          <Activity size={22} color={abaAtiva === 'dashboard' ? '#10b981' : '#94a3b8'} />
          <Text style={[styles.navText, abaAtiva === 'dashboard' && styles.navTextActive]}>Radar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setAbaAtiva('bi')}>
          <PieChart size={22} color={abaAtiva === 'bi' ? '#a855f7' : '#94a3b8'} />
          <Text style={[styles.navText, abaAtiva === 'bi' && styles.navTextActive]}>BI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setAbaAtiva('chat')}>
          <MessageSquare size={22} color={abaAtiva === 'chat' ? '#38bdf8' : '#94a3b8'} />
          <Text style={[styles.navText, abaAtiva === 'chat' && styles.navTextActive]}>Tático</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setAbaAtiva('sobre')}>
          <ShieldCheck size={22} color={abaAtiva === 'sobre' ? '#f59e0b' : '#94a3b8'} />
          <Text style={[styles.navText, abaAtiva === 'sobre' && styles.navTextActive]}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* MENU LATERAL (DRAWER EM MODAL) */}
      <Modal visible={menuAberto} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu Principal</Text>
              <TouchableOpacity onPress={() => setMenuAberto(false)}>
                <X size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { setToken(''); setMenuAberto(false); }}>
              <LogOut size={20} color="#ef4444" />
              <Text style={[styles.drawerItemText, { color: '#ef4444' }]}>Encerrar Sessão</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setMenuAberto(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  loginContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 20 },
  loginBox: { backgroundColor: '#1e293b', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  loginTitle: { color: '#ffffff', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  loginSubtitle: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#0f172a', color: '#ffffff', padding: 14, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  btnPrimary: { backgroundColor: '#10b981', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnPrimaryText: { color: '#ffffff', fontWeight: '900', fontSize: 14 },
  header: { height: 60, backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  headerBtn: { padding: 5 },
  badge: { position: 'absolute', top: 2, right: 2, width: 10, height: 10, backgroundColor: '#ef4444', borderRadius: 5, borderWidth: 2, borderColor: '#1e293b' },
  workspace: { flex: 1 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 65, backgroundColor: '#1e293b', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#334155', paddingBottom: 5 },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navText: { color: '#94a3b8', fontSize: 10, marginTop: 4, fontWeight: '700' },
  navTextActive: { color: '#ffffff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row' },
  drawer: { width: '75%', backgroundColor: '#1e293b', height: '100%', padding: 20 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  drawerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
  drawerItemText: { color: '#cbd5e1', fontSize: 16, marginLeft: 15, fontWeight: '600' }
});