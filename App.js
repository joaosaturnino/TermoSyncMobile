import {
  Activity,
  Archive,
  Bell,
  Building2,
  Cpu,
  History,
  Info,
  Leaf,
  LogOut,
  Map as MapIcon,
  Menu,
  MessageSquare,
  PieChart,
  Server,
  Sliders // <-- Terminal adicionado aqui!
  ,


  Store,
  Target,
  Terminal,
  Thermometer,
  Users,
  Wrench,
  X
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// --- IMPORTAÇÃO DE TODAS AS TELAS ---
import ChamadosScreen from './src/screens/ChamadosScreen';
import ChatScreen from './src/screens/ChatScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import EquipamentosScreen from './src/screens/EquipamentosScreen';
import GestaoEmpresasScreen from './src/screens/GestaoEmpresasScreen';
import HistoricoChamadosScreen from './src/screens/HistoricoChamadosScreen';
import HistoricoScreen from './src/screens/HistoricoScreen';
import LoginScreen from './src/screens/LoginScreen';
import LojasScreen from './src/screens/LojasScreen';
import MapaCalorScreen from './src/screens/MapaCalorScreen';
import MetrologiaScreen from './src/screens/MetrologiaScreen';
import PainelDesenvolvedor from './src/screens/PainelDesenvolvedor';
import ParametrosGlobaisScreen from './src/screens/ParametrosGlobaisScreen';
import RelatoriosScreen from './src/screens/RelatoriosScreen';
import SensoresScreen from './src/screens/SensoresScreen';
import SimuladorScreen from './src/screens/SimuladorScreen';
import UsuariosScreen from './src/screens/UsuariosScreen';

const API_URL = 'http://192.168.56.1:3000/api';
const SOCKET_URL = 'http://192.168.56.1:3000';

export default function App() {
  // Estados Globais
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('LOJA');
  const [nomeLogado, setNomeLogado] = useState('');
  const [papelLogado, setPapelLogado] = useState('');

  const [socketInstance, setSocketInstance] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);

  // Configuração Simulada (Igual ao useSystemCore da Web)
  const sysConfig = {
    planos: {},
    regras: { GLOBAL: { features: { enableAudioAlerts: true, telemetryStream: true, enableChat: true } } }
  };

  // ARRAY DE NAVEGAÇÃO ESPELHADO DA WEB
  const NAVIGATION = [
    { id: 'dev_panel', label: 'Plano de Controle (NOC)', icon: Terminal, roles: ['DEV'], group: 'Desenvolvedor' },
    { id: 'bi', label: 'Analytics (BI)', icon: PieChart, roles: ['DEV'], group: 'Desenvolvedor' },
    { id: 'simulador', label: 'Motor de Caos', icon: Cpu, roles: ['DEV'], group: 'Desenvolvedor' },
    { id: 'empresas', label: 'Gestão de Tenants', icon: Building2, roles: ['DEV'], group: 'Desenvolvedor' },

    { id: 'dashboard', label: 'Dashboard', icon: Activity, roles: ['ADMIN', 'LOJA', 'MANUTENCAO', 'DEV'], group: 'Operações' },
    { id: 'mapa', label: 'Planta Digital', icon: MapIcon, roles: ['ADMIN', 'LOJA', 'DEV'], group: 'Operações' },
    { id: 'sensores', label: 'Sensores Térmicos', icon: Thermometer, roles: ['ADMIN', 'LOJA', 'MANUTENCAO', 'DEV'], group: 'Operações' },

    { id: 'chamados', label: 'Chamados (OS)', icon: Wrench, roles: ['ADMIN', 'LOJA', 'MANUTENCAO', 'DEV'], group: 'Serviços' },
    { id: 'historico_chamados', label: 'Arquivo de OS', icon: Archive, roles: ['ADMIN', 'MANUTENCAO', 'DEV'], group: 'Serviços' },
    { id: 'equipamentos', label: 'Equipamentos', icon: Server, roles: ['ADMIN', 'MANUTENCAO', 'DEV'], group: 'Serviços' },
    { id: 'metrologia', label: 'Controle Metrológico', icon: Target, roles: ['ADMIN', 'MANUTENCAO', 'DEV'], group: 'Serviços' },
    { id: 'parametros', label: 'Parâmetros Core', icon: Sliders, roles: ['ADMIN', 'DEV'], group: 'Serviços' },

    { id: 'chat', label: 'Chat Tático', icon: MessageSquare, roles: ['ADMIN', 'LOJA', 'MANUTENCAO', 'DEV'], group: 'Comunicação' },

    { id: 'relatorios', label: 'Relatórios ESG', icon: Leaf, roles: ['ADMIN', 'LOJA', 'DEV'], group: 'Auditoria' },
    { id: 'historico', label: 'Histórico de Logs', icon: History, roles: ['ADMIN', 'LOJA', 'DEV'], group: 'Auditoria' },

    { id: 'lojas', label: 'Rede de Lojas', icon: Store, roles: ['ADMIN', 'DEV'], group: 'Sistema' },
    { id: 'usuarios', label: 'Identidades (AD)', icon: Users, roles: ['ADMIN', 'DEV'], group: 'Sistema' },
    { id: 'sobre', label: 'Perfil e Arquitetura', icon: Info, roles: ['ADMIN', 'LOJA', 'MANUTENCAO', 'DEV'], group: 'Sistema' },
  ];

  const menuVisivel = NAVIGATION.filter(nav => nav.roles.includes(userRole));

  // Agrupando o menu para o Drawer
  const gruposDeMenu = ['Desenvolvedor', 'Operações', 'Serviços', 'Comunicação', 'Auditoria', 'Sistema'];

  if (!token) {
    // Tela de Login Nativa agora injetando as props necessárias para o App.js global
    return <LoginScreen setToken={setToken} setUserId={setUserId} setNomeLogado={setNomeLogado} setUserRole={setUserRole} setPapelLogado={setPapelLogado} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      {/* HEADER FIXO MOBILE */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuAberto(true)} style={styles.headerBtn}>
          <Menu size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {NAVIGATION.find(n => n.id === abaAtiva)?.label || 'TermoSync'}
        </Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Bell size={22} color="#ffffff" />
          {notificacoes.length > 0 && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      {/* ÁREA DE CONTEÚDO (Mapeamento de TODAS as rotas) */}
      <View style={styles.workspace}>
        {abaAtiva === 'dashboard' && <DashboardScreen route={{ params: { token, socket: socketInstance } }} />}
        {abaAtiva === 'mapa' && <MapaCalorScreen route={{ params: { token } }} />}
        {abaAtiva === 'sensores' && <SensoresScreen route={{ params: { token, socket: socketInstance } }} />}

        {abaAtiva === 'chamados' && <ChamadosScreen route={{ params: { token, userRole } }} />}
        {abaAtiva === 'historico_chamados' && <HistoricoChamadosScreen route={{ params: { token } }} />}
        {abaAtiva === 'equipamentos' && <EquipamentosScreen route={{ params: { token } }} />}
        {abaAtiva === 'metrologia' && <MetrologiaScreen route={{ params: { token } }} />}
        {abaAtiva === 'parametros' && <ParametrosGlobaisScreen route={{ params: { token } }} />}

        {abaAtiva === 'chat' && <ChatScreen route={{ params: { token, socket: socketInstance, userId, nomeLogado } }} />}

        {abaAtiva === 'relatorios' && <RelatoriosScreen route={{ params: { token } }} />}
        {abaAtiva === 'historico' && <HistoricoScreen route={{ params: { token } }} />}

        {abaAtiva === 'lojas' && <LojasScreen route={{ params: { token } }} />}
        {abaAtiva === 'usuarios' && <UsuariosScreen route={{ params: { token } }} />}


        {/* Rotas DEV */}
        {abaAtiva === 'empresas' && <GestaoEmpresasScreen route={{ params: { token } }} />}
        {abaAtiva === 'simulador' && <SimuladorScreen route={{ params: { token } }} />}
        {(abaAtiva === 'dev_panel' || abaAtiva === 'bi') && <PainelDesenvolvedor abaAtiva={abaAtiva} />}
      </View>

      {/* BARRA DE NAVEGAÇÃO INFERIOR TÁTICA (BOTTOM TAB) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setAbaAtiva('dashboard')}>
          <Activity size={22} color={abaAtiva === 'dashboard' ? '#10b981' : '#94a3b8'} />
          <Text style={[styles.navText, abaAtiva === 'dashboard' && styles.navTextActive]}>Radar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setAbaAtiva('sensores')}>
          <Thermometer size={22} color={abaAtiva === 'sensores' ? '#38bdf8' : '#94a3b8'} />
          <Text style={[styles.navText, abaAtiva === 'sensores' && styles.navTextActive]}>Sensores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setAbaAtiva('chat')}>
          <MessageSquare size={22} color={abaAtiva === 'chat' ? '#a855f7' : '#94a3b8'} />
          <Text style={[styles.navText, abaAtiva === 'chat' && styles.navTextActive]}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setMenuAberto(true)}>
          <Menu size={22} color="#94a3b8" />
          <Text style={styles.navText}>Menu</Text>
        </TouchableOpacity>
      </View>

      {/* MENU LATERAL COMPLETO (DRAWER) */}
      <Modal visible={menuAberto} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerTitle}>{nomeLogado}</Text>
                <Text style={styles.drawerSubtitle}>{papelLogado}</Text>
              </View>
              <TouchableOpacity onPress={() => setMenuAberto(false)}>
                <X size={26} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {gruposDeMenu.map(grupo => {
                const itensDoGrupo = menuVisivel.filter(i => i.group === grupo);
                if (itensDoGrupo.length === 0) return null;
                return (
                  <View key={grupo} style={{ marginBottom: 15 }}>
                    <Text style={styles.groupTitle}>{grupo}</Text>
                    {itensDoGrupo.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.drawerItem, abaAtiva === item.id && styles.drawerItemActive]}
                        onPress={() => { setAbaAtiva(item.id); setMenuAberto(false); }}
                      >
                        <item.icon size={20} color={abaAtiva === item.id ? '#10b981' : '#cbd5e1'} />
                        <Text style={[styles.drawerItemText, abaAtiva === item.id && { color: '#10b981', fontWeight: 'bold' }]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}

              <TouchableOpacity style={[styles.drawerItem, { marginTop: 20, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 20 }]} onPress={() => { setToken(''); setMenuAberto(false); }}>
                <LogOut size={20} color="#ef4444" />
                <Text style={[styles.drawerItemText, { color: '#ef4444', fontWeight: 'bold' }]}>Encerrar Sessão</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setMenuAberto(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { height: 60, backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
  headerTitle: { color: '#ffffff', fontSize: 17, fontWeight: '900' },
  headerBtn: { padding: 5 },
  badge: { position: 'absolute', top: 2, right: 2, width: 10, height: 10, backgroundColor: '#ef4444', borderRadius: 5, borderWidth: 2, borderColor: '#1e293b' },
  workspace: { flex: 1, paddingBottom: Platform.OS === 'ios' ? 70 : 65 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 85 : 65, backgroundColor: '#1e293b', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#334155', paddingBottom: Platform.OS === 'ios' ? 20 : 5 },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navText: { color: '#94a3b8', fontSize: 10, marginTop: 4, fontWeight: '700' },
  navTextActive: { color: '#ffffff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row' },
  drawer: { width: '80%', backgroundColor: '#0f172a', height: '100%', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  drawerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  drawerSubtitle: { color: '#10b981', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  groupTitle: { color: '#64748b', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, marginTop: 10 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8 },
  drawerItemActive: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  drawerItemText: { color: '#cbd5e1', fontSize: 15, marginLeft: 15, fontWeight: '500' }
});