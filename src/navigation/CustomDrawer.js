import {
  Activity,
  Archive,
  Building2, Cpu,
  History,
  Info,
  Leaf,
  LogOut,
  Map as MapIcon, MessageSquare,
  Server,
  Sliders,
  Store,
  Target,
  Terminal,
  Thermometer,
  Users,
  Wrench
} from 'lucide-react-native';
import { useContext } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

const NAVIGATION = [
  { id: 'PainelDev', label: 'Plano de Controlo (NOC)', icon: Terminal, roles: ['DEV'], group: 'Desenvolvedor' },
  { id: 'Simulador', label: 'Motor de Caos', icon: Cpu, roles: ['DEV'], group: 'Desenvolvedor' },
  { id: 'Empresas', label: 'Gestão de Tenants', icon: Building2, roles: ['DEV'], group: 'Desenvolvedor' },
  
  { id: 'Dashboard', label: 'Dashboard', icon: Activity, roles: ['ADMIN', 'LOJA', 'MANUTENCAO', 'DEV'], group: 'Operações' },
  { id: 'Mapa', label: 'Planta Digital', icon: MapIcon, roles: ['ADMIN', 'LOJA', 'DEV'], group: 'Operações' },
  { id: 'Sensores', label: 'Sensores Térmicos', icon: Thermometer, roles: ['ADMIN', 'LOJA', 'MANUTENCAO', 'DEV'], group: 'Operações' },
  
  { id: 'Chamados', label: 'Gestão de Incidentes (OS)', icon: Wrench, roles: ['ADMIN', 'LOJA', 'MANUTENCAO', 'DEV'], group: 'Serviços' },
  { id: 'HistoricoChamados', label: 'Arquivo de OS', icon: Archive, roles: ['ADMIN', 'MANUTENCAO', 'DEV'], group: 'Serviços' },
  { id: 'Equipamentos', label: 'Equipamentos (IoT)', icon: Server, roles: ['ADMIN', 'MANUTENCAO', 'DEV'], group: 'Serviços' },
  { id: 'Metrologia', label: 'Controlo Metrológico', icon: Target, roles: ['ADMIN', 'MANUTENCAO', 'DEV'], group: 'Serviços' },
  { id: 'Parametros', label: 'Parâmetros Core', icon: Sliders, roles: ['ADMIN', 'DEV'], group: 'Serviços' },
  
  { id: 'Chat', label: 'Chat Tático', icon: MessageSquare, roles: ['ADMIN', 'LOJA', 'MANUTENCAO', 'DEV'], group: 'Comunicação' },
  
  { id: 'Relatorios', label: 'Relatórios ESG', icon: Leaf, roles: ['ADMIN', 'LOJA', 'DEV'], group: 'Auditoria' },
  { id: 'Historico', label: 'Histórico de Logs', icon: History, roles: ['ADMIN', 'LOJA', 'DEV'], group: 'Auditoria' },
  
  { id: 'Lojas', label: 'Rede de Lojas', icon: Store, roles: ['ADMIN', 'DEV'], group: 'Sistema' },
  { id: 'Usuarios', label: 'Identidades (AD)', icon: Users, roles: ['ADMIN', 'DEV'], group: 'Sistema' },
  { id: 'Sobre', label: 'Perfil e Arquitetura', icon: Info, roles: ['ADMIN', 'LOJA', 'MANUTENCAO', 'DEV'], group: 'Sistema' },
];

export default function CustomDrawer(props) {
  const { userRole, nomeLogado, papelLogado, logout, theme } = useContext(AppContext);
  const gruposDeMenu = ['Desenvolvedor', 'Operações', 'Serviços', 'Comunicação', 'Auditoria', 'Sistema'];
  
  // Filtra as opções consoante a permissão
  const menuVisivel = NAVIGATION.filter(nav => nav.roles.includes(userRole));
  const rotaAtiva = props.state.routeNames[props.state.index];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.card }}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.title, { color: theme.textMain }]}>{nomeLogado || 'Utilizador'}</Text>
          <Text style={[styles.subtitle, { color: theme.primary }]}>{papelLogado || 'Acesso Restrito'}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 15 }}>
        {gruposDeMenu.map(grupo => {
          const itensDoGrupo = menuVisivel.filter(i => i.group === grupo);
          if (itensDoGrupo.length === 0) return null;
          
          return (
            <View key={grupo} style={{ marginBottom: 20 }}>
              <Text style={[styles.groupTitle, { color: theme.textMuted }]}>{grupo}</Text>
              {itensDoGrupo.map(item => {
                const isActive = rotaAtiva === item.id;
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.drawerItem, isActive && { backgroundColor: `${theme.primary}15` }]} 
                    onPress={() => props.navigation.navigate(item.id)}
                  >
                    <item.icon size={20} color={isActive ? theme.primary : theme.textMuted} />
                    <Text style={[styles.itemText, { color: isActive ? theme.primary : theme.textMain, fontWeight: isActive ? 'bold' : '500' }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        <TouchableOpacity style={[styles.drawerItem, { marginTop: 10, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 20, paddingBottom: 30 }]} onPress={logout}>
          <LogOut size={20} color={theme.danger} />
          <Text style={[styles.itemText, { color: theme.danger, fontWeight: 'bold' }]}>Terminar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, borderBottomWidth: 1, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '900' },
  subtitle: { fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  groupTitle: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, marginLeft: 10 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, marginBottom: 2 },
  itemText: { fontSize: 14, marginLeft: 15 }
});