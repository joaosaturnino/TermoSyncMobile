import {
  AlertTriangle,
  Clock,
  MapPin,
  MessageSquarePlus,
  PlayCircle,
  Search,
  Settings,
  User,
  Wrench
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView, StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const theme = {
  bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8',
  border: '#1e293b', primary: '#059669', secondary: '#10b981', danger: '#ef4444',
  warning: '#f59e0b', info: '#38bdf8'
};

export default function ChamadosScreen() {
  const [busca, setBusca] = useState('');

  // Simulação de Dados
  const chamadosAtivos = [
    { id: 1, equipamento_nome: 'REF-04 Ilha', filial: 'Loja Norte', urgencia: 'Alta', status: 'Aberto', solicitante_nome: 'João Silva', tecnico_responsavel: null, descricao: 'Motor não arranca, temperatura a subir rápido.', data_abertura: new Date() },
    { id: 2, equipamento_nome: 'CONG-01 Frios', filial: 'Loja Centro', urgencia: 'Baixa', status: 'Em Progresso', solicitante_nome: 'Maria Silva', tecnico_responsavel: 'Carlos Téc.', descricao: 'Borracha da porta rasgada.', data_abertura: new Date() }
  ];

  const getUrgencyColor = (urg) => {
    if (urg === 'Alta') return theme.danger;
    if (urg === 'Média') return theme.warning;
    return theme.info;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CABEÇALHO DO SERVICE DESK */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Service Desk (OS)</Text>
            <Text style={styles.subtitle}>Despacho e Intervenções Técnicas</Text>
          </View>
          <TouchableOpacity style={styles.btnNewOs}>
            <MessageSquarePlus size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBox}>
          <Search size={18} color={theme.textMuted} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Procurar OS, máquina ou técnico..."
            placeholderTextColor={theme.textMuted}
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {/* PAINEL DE KPIs DE SERVICE DESK */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiItem}>
            <View style={[styles.kpiIcon, { backgroundColor: 'rgba(148, 163, 184, 0.1)' }]}><Settings size={18} color={theme.textMain}/></View>
            <View style={styles.kpiData}><Text style={styles.kpiVal}>2</Text><Text style={styles.kpiLbl}>Ativas</Text></View>
          </View>
          <View style={styles.kpiItem}>
            <View style={[styles.kpiIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}><PlayCircle size={18} color={theme.warning}/></View>
            <View style={styles.kpiData}><Text style={styles.kpiVal}>1</Text><Text style={styles.kpiLbl}>Pendentes</Text></View>
          </View>
          <View style={[styles.kpiItem, { borderColor: 'rgba(239, 68, 68, 0.4)' }]}>
            <View style={[styles.kpiIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}><AlertTriangle size={18} color={theme.danger}/></View>
            <View style={styles.kpiData}><Text style={[styles.kpiVal, { color: theme.danger }]}>1</Text><Text style={[styles.kpiLbl, { color: theme.danger }]}>Críticos</Text></View>
          </View>
        </View>

        {/* LISTAGEM DE CARTÕES OS (TICKETS) */}
        {chamadosAtivos.map(c => {
          const urgColor = getUrgencyColor(c.urgencia);

          return (
            <View key={c.id} style={[styles.ticketCard, { borderLeftColor: urgColor }]}>
              
              <View style={styles.ticketHeader}>
                <View>
                  <Text style={styles.ticketEquip}>{c.equipamento_nome}</Text>
                  <View style={styles.locationRow}>
                    <MapPin size={12} color={theme.textMuted} />
                    <Text style={styles.ticketFilial}>{c.filial}</Text>
                  </View>
                </View>
                
                <View style={styles.badgeColumn}>
                  <View style={styles.badgeStatus}><Text style={styles.badgeStatusText}>{c.status}</Text></View>
                  <View style={[styles.badgeUrgency, { borderColor: urgColor }]}><Text style={[styles.badgeUrgencyText, { color: urgColor }]}>{c.urgencia}</Text></View>
                </View>
              </View>

              <View style={styles.ticketBody}>
                <View style={styles.metaBox}>
                  <View style={styles.metaRow}><User size={12} color={theme.textMuted} /><Text style={styles.metaText}>Solicitante: {c.solicitante_nome}</Text></View>
                  <View style={styles.metaRow}><Wrench size={12} color={theme.textMuted} /><Text style={styles.metaText}>Técnico: {c.tecnico_responsavel || 'Aguardando Despacho'}</Text></View>
                  <View style={styles.metaRow}><Clock size={12} color={theme.textMuted} /><Text style={styles.metaText}>Aberto: 14:30</Text></View>
                </View>
                
                <Text style={styles.ticketDesc}><Text style={{ color: theme.textMuted }}>Relato:</Text> {c.descricao}</Text>
              </View>

              <TouchableOpacity style={[styles.btnAction, { backgroundColor: urgColor }]}>
                <Wrench size={16} color="white" />
                <Text style={styles.btnActionText}>Inserir Laudo e Concluir</Text>
              </TouchableOpacity>
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { padding: 15, paddingBottom: 40 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: theme.textMain, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: theme.textMuted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  btnNewOs: { backgroundColor: theme.primary, padding: 12, borderRadius: 14, shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 12 : 10, marginBottom: 20 },
  searchInput: { flex: 1, color: theme.textMain, marginLeft: 10, fontSize: 15 },

  kpiContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  kpiItem: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 10, marginHorizontal: 4 },
  kpiIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  kpiData: { flex: 1 },
  kpiVal: { color: theme.textMain, fontSize: 16, fontWeight: '900' },
  kpiLbl: { color: theme.textMuted, fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },

  ticketCard: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 5, borderRadius: 16, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  ticketEquip: { color: theme.textMain, fontSize: 16, fontWeight: '900', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  ticketFilial: { color: theme.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginLeft: 4 },
  
  badgeColumn: { alignItems: 'flex-end', gap: 6 },
  badgeStatus: { backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeStatusText: { color: theme.warning, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  badgeUrgency: { backgroundColor: theme.bg, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeUrgencyText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },

  ticketBody: { marginBottom: 15 },
  metaBox: { backgroundColor: 'rgba(0,0,0,0.1)', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.border, marginBottom: 10, gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { color: theme.textMain, fontSize: 12, fontWeight: '600', marginLeft: 8 },
  
  ticketDesc: { color: theme.textMain, fontSize: 14, lineHeight: 20, fontWeight: '500' },

  btnAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, marginTop: 5 },
  btnActionText: { color: 'white', fontWeight: '800', fontSize: 13, marginLeft: 8 }
});