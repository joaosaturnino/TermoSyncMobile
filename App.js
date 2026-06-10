import {
  Activity,
  Archive,
  Bell,
  Building2,
  History,
  Info,
  Leaf,
  LogOut,
  Map as MapIcon,
  Menu,
  MessageSquare,
  PieChart,
  Server,
  Sliders,
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  // SE NÃO ESTIVER LOGADO -> MOSTRA O LOGIN
  if (!isLoggedIn) {
    // CORREÇÃO AQUI: Injetamos um mock (imitação) do objeto navigation.
    // Assim, quando a LoginScreen fizer "navigation.replace('Drawer')",
    // ela na verdade vai atualizar o estado "isLoggedIn" e entrar na aplicação sem "crashar"!
    return <LoginScreen navigation={{ replace: () => setIsLoggedIn(true) }} />;
  }

  // RENDERIZADOR CUSTOMIZADO DE TELAS
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard': return <DashboardScreen />;
      case 'Equipamentos': return <EquipamentosScreen />;
      case 'Chamados': return <ChamadosScreen />;
      case 'Relatorios': return <RelatoriosScreen />;
      case 'Usuarios': return <UsuariosScreen />;
      case 'MapaCalor': return <MapaCalorScreen />;
      case 'Lojas': return <LojasScreen />;
      case 'HistoricoChamados': return <HistoricoChamadosScreen />;
      case 'Sensores': return <SensoresScreen />;
      case 'Chat': return <ChatScreen />;
      case 'Metrologia': return <MetrologiaScreen />;
      case 'ParametrosGlobais': return <ParametrosGlobaisScreen />;
      case 'Historico': return <HistoricoScreen />;
      case 'GestaoEmpresas': return <GestaoEmpresasScreen />;
      case 'PainelDesenvolvedor': return <PainelDesenvolvedor />;
      case 'Simulador': return <SimuladorScreen />;
      default: return <DashboardScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* CABEÇALHO GLOBAL (APP BAR) */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <Menu color="#10b981" size={24} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Leaf color="#10b981" size={20} />
          <Text style={styles.appTitle}>TERMOSYNC OS</Text>
        </View>
        <TouchableOpacity>
          <Bell color="#94a3b8" size={22} />
        </TouchableOpacity>
      </View>

      {/* ÁREA DA TELA ATUAL */}
      <View style={styles.workspace}>
        {renderScreen()}
      </View>

      {/* MENU LATERAL CUSTOMIZADO (MODAL DRAWER) */}
      <Modal visible={menuOpen} animationType="fade" transparent={true} onRequestClose={() => setMenuOpen(false)}>
        <CustomDrawer 
          currentScreen={currentScreen} 
          navigateTo={(screen) => { setCurrentScreen(screen); setMenuOpen(false); }} 
          closeMenu={() => setMenuOpen(false)}
          onLogout={() => setIsLoggedIn(false)}
        />
      </Modal>

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('Dashboard')}>
          <PieChart color={currentScreen === 'Dashboard' ? '#10b981' : '#64748b'} size={24} />
          <Text style={[styles.navText, currentScreen === 'Dashboard' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('Lojas')}>
          <Store color={currentScreen === 'Lojas' ? '#10b981' : '#64748b'} size={24} />
          <Text style={[styles.navText, currentScreen === 'Lojas' && styles.navTextActive]}>Lojas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('Chamados')}>
          <Wrench color={currentScreen === 'Chamados' ? '#10b981' : '#64748b'} size={24} />
          <Text style={[styles.navText, currentScreen === 'Chamados' && styles.navTextActive]}>OS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('PainelDesenvolvedor')}>
          <Terminal color={currentScreen === 'PainelDesenvolvedor' ? '#10b981' : '#64748b'} size={24} />
          <Text style={[styles.navText, currentScreen === 'PainelDesenvolvedor' && styles.navTextActive]}>NOC</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CustomDrawer = ({ currentScreen, navigateTo, closeMenu, onLogout }) => {
  const menuItems = [
    { id: 'Dashboard', icon: PieChart, label: 'Dashboard' },
    { id: 'Equipamentos', icon: Server, label: 'Edge Computing' },
    { id: 'MapaCalor', icon: MapIcon, label: 'Planta Digital' },
    { id: 'Lojas', icon: Store, label: 'Gestão de Lojas' },
    { id: 'Sensores', icon: Target, label: 'Sensores IoT' },
    { id: 'Chamados', icon: Wrench, label: 'Incidentes (OS)' },
    { id: 'Relatorios', icon: Activity, label: 'BI Analytics' },
    { id: 'Metrologia', icon: Info, label: 'Metrologia' },
    { id: 'Chat', icon: MessageSquare, label: 'Comunicações' },
    { id: 'Usuarios', icon: Users, label: 'IAM / Acessos' },
    { id: 'GestaoEmpresas', icon: Building2, label: 'Tenants SaaS' },
    { id: 'Historico', icon: History, label: 'Auditoria SOC' },
    { id: 'HistoricoChamados', icon: Archive, label: 'Arquivo Morto' },
    { id: 'ParametrosGlobais', icon: Sliders, label: 'Parâmetros Globais' },
    { id: 'Simulador', icon: Thermometer, label: 'Simulador Edge' },
    { id: 'PainelDesenvolvedor', icon: Terminal, label: 'Root (NOC)' }
  ];

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.drawer}>
        <View style={styles.drawerHeader}>
          <View>
            <Text style={styles.drawerTitle}>TermoSync</Text>
            <Text style={styles.drawerSubtitle}>OS Mobile V4</Text>
          </View>
          <TouchableOpacity onPress={closeMenu}><X color="#94a3b8" size={24} /></TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {menuItems.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.drawerItem, currentScreen === item.id && styles.drawerItemActive]}
              onPress={() => navigateTo(item.id)}
            >
              <item.icon color={currentScreen === item.id ? '#10b981' : '#94a3b8'} size={20} />
              <Text style={[styles.drawerItemText, currentScreen === item.id && styles.drawerItemTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={[styles.drawerItem, { marginTop: 20, borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 20 }]} onPress={onLogout}>
            <LogOut color="#ef4444" size={20} />
            <Text style={[styles.drawerItemText, { color: '#ef4444', fontWeight: 'bold' }]}>Desconectar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.drawerOutside} onPress={closeMenu} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60, backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  appTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  workspace: { flex: 1, paddingBottom: Platform.OS === 'ios' ? 70 : 65 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 85 : 65, backgroundColor: '#0f172a', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1e293b', paddingBottom: Platform.OS === 'ios' ? 20 : 5 },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navText: { color: '#64748b', fontSize: 10, marginTop: 4, fontWeight: '700' },
  navTextActive: { color: '#10b981' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.8)', flexDirection: 'row' },
  drawer: { width: '80%', backgroundColor: '#0b1120', height: '100%', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, borderRightWidth: 1, borderRightColor: '#1e293b' },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  drawerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  drawerSubtitle: { color: '#10b981', fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  drawerItemActive: { backgroundColor: 'rgba(16,185,129,0.1)' },
  drawerItemText: { color: '#94a3b8', fontSize: 14, marginLeft: 16, fontWeight: '600' },
  drawerItemTextActive: { color: '#10b981', fontWeight: 'bold' },
  drawerOutside: { flex: 1 }
});