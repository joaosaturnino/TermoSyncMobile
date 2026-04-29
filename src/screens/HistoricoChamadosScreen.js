import {
  Activity,
  Archive,
  CalendarCheck,
  CheckSquare,
  MapPin,
  Search,
  ShieldCheck,
  User,
  Users,
  Wrench
} from 'lucide-react-native';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView, StyleSheet,
  Text, TextInput,
  View
} from 'react-native';

const theme = {
  bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8',
  border: '#1e293b', primary: '#059669', secondary: '#10b981', danger: '#ef4444',
  info: '#38bdf8'
};

export default function HistoricoChamadosScreen() {
  const [busca, setBusca] = useState('');

  // Simulação de Dados
  const chamadosArquivados = [
    { id: 1, equipamento_nome: 'CONG-01 Frios', filial: 'Loja Centro', urgencia: 'Alta', solicitante: 'João S.', tecnico: 'Carlos T.', descricao: 'Motor falhou.', nota_resolucao: 'Motor substituído. Testes OK.', data_conclusao: '14/05/2026 15:30' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Arquivo Técnico</Text>
          <Text style={styles.subtitle}>Laudos técnicos e intervenções RDC.</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBox}>
          <Search size={18} color={theme.textMuted} />
          <TextInput 
            style={styles.searchInput} placeholder="Buscar laudo ou técnico..."
            placeholderTextColor={theme.textMuted} value={busca} onChangeText={setBusca}
          />
        </View>

        {/* KPIS DE AUDITORIA */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: 'rgba(148, 163, 184, 0.1)' }]}><Archive size={18} color={theme.textMain}/></View>
            <View><Text style={styles.kpiVal}>142</Text><Text style={styles.kpiLbl}>Arquivados</Text></View>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}><Users size={18} color={theme.info}/></View>
            <View><Text style={[styles.kpiVal, { color: theme.info }]}>8</Text><Text style={styles.kpiLbl}>Técnicos</Text></View>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}><ShieldCheck size={18} color={theme.success}/></View>
            <View><Text style={[styles.kpiVal, { color: theme.success }]}>100%</Text><Text style={styles.kpiLbl}>Compliance</Text></View>
          </View>
        </View>

        {/* LISTAGEM DE LAUDOS */}
        {chamadosArquivados.map(c => (
          <View key={c.id} style={styles.auditCard}>
            <View style={styles.auditHeader}>
              <View style={styles.equipRow}>
                <Activity size={16} color={theme.textMuted} />
                <Text style={styles.equipName}>{c.equipamento_nome}</Text>
              </View>
              <View style={styles.badgeClosed}><Text style={styles.badgeText}>Fechado</Text></View>
            </View>

            <View style={styles.descBox}>
              <Text style={styles.descText}>"{c.descricao}"</Text>
            </View>

            <View style={styles.metaGrid}>
              <Text style={styles.metaText}><MapPin size={12} color={theme.textMuted}/> {c.filial}</Text>
              <Text style={styles.metaText}><User size={12} color={theme.textMuted}/> {c.solicitante}</Text>
              <Text style={styles.metaText}><Wrench size={12} color={theme.textMuted}/> {c.tecnico}</Text>
            </View>

            <View style={styles.resolutionBox}>
              <View style={styles.resHeader}>
                <CheckSquare size={14} color={theme.success} />
                <Text style={styles.resTitle}>Laudo Registado:</Text>
              </View>
              <Text style={styles.resText}>{c.nota_resolucao}</Text>
              
              <View style={styles.resFooter}>
                <Text style={styles.resDate}><CalendarCheck size={12} /> {c.data_conclusao}</Text>
                <View style={styles.stamp}><Text style={styles.stampText}>VERIFICADO</Text></View>
              </View>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { padding: 15, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { color: theme.textMain, fontSize: 20, fontWeight: '900' },
  subtitle: { color: theme.textMuted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 15 },
  searchInput: { flex: 1, color: theme.textMain, marginLeft: 10, fontSize: 15 },

  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  kpiCard: { flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 10, marginHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 8 },
  kpiIcon: { padding: 6, borderRadius: 8 },
  kpiVal: { color: theme.textMain, fontSize: 14, fontWeight: '900' },
  kpiLbl: { color: theme.textMuted, fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },

  auditCard: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 15, marginBottom: 15 },
  auditHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  equipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  equipName: { color: theme.textMain, fontSize: 15, fontWeight: '800' },
  badgeClosed: { backgroundColor: 'rgba(100, 116, 139, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: theme.textMuted, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  
  descBox: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  descText: { color: theme.textMain, fontStyle: 'italic', fontSize: 13 },
  
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  metaText: { color: theme.textMuted, fontSize: 11, fontWeight: '600' },

  resolutionBox: { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', borderRadius: 10, padding: 12 },
  resHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  resTitle: { color: theme.success, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  resText: { color: theme.textMain, fontSize: 13, lineHeight: 18, marginBottom: 10 },
  resFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: 'rgba(16, 185, 129, 0.2)', paddingTop: 10 },
  resDate: { color: theme.textMuted, fontSize: 10, fontWeight: '600' },
  stamp: { borderWidth: 1.5, borderColor: theme.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, transform: [{ rotate: '-5deg' }] },
  stampText: { color: theme.success, fontSize: 9, fontWeight: '900', letterSpacing: 1 }
});