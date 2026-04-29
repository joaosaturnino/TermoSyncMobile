import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Radio,
  Server, ThermometerSnowflake,
  Zap
} from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  RefreshControl, SafeAreaView,
  ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

// Tema Escuro NOC (Padrão)
const theme = {
  bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8',
  border: '#1e293b', primary: '#059669', secondary: '#10b981', danger: '#ef4444',
  warning: '#f59e0b', info: '#38bdf8'
};

export default function DashboardScreen({ navigation }) {
  // Simulando dados (deve substituir pelos dados do seu Context/API)
  const [refreshing, setRefresh] = useState(false);
  const [filtroRisco, setFiltroRisco] = useState('TODOS');
  
  const qtdTotal = 24; const qtdOperando = 22; const qtdDegelo = 1; const qtdFalha = 1;
  const notificacoesAtivas = [
    { id: 1, equipamento_nome: 'CONG-01 Frios', filial: 'Loja Centro', mensagem: 'Temperatura Excedeu Limite (8°C)', tipo_alerta: 'TEMPERATURA', data_hora: new Date() }
  ];

  const onRefresh = useCallback(() => {
    setRefresh(true);
    setTimeout(() => setRefresh(false), 1500);
  }, []);

  const saudeRede = useMemo(() => {
    const score = Math.round((qtdOperando / qtdTotal) * 100) || 100;
    if (score < 80) return { score, status: 'CRÍTICO', color: theme.danger };
    if (score < 95) return { score, status: 'ATENÇÃO', color: theme.warning };
    return { score, status: 'ESTÁVEL', color: theme.success };
  }, [qtdTotal, qtdOperando]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* ÍNDICE DE SAÚDE DA REDE (SLA ADVANCED) */}
        <View style={[styles.healthBanner, { borderTopColor: saudeRede.color }]}>
          <View style={styles.healthHeader}>
            <View style={styles.healthTitleRow}>
              <Zap size={24} color={saudeRede.color} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.healthTitle}>System Health Index</Text>
                <Text style={styles.healthSubtitle}>Estado Operacional: <Text style={{ color: saudeRede.color, fontWeight: 'bold' }}>{saudeRede.status}</Text></Text>
              </View>
            </View>
            <Text style={[styles.healthScore, { color: saudeRede.color }]}>{saudeRede.score}%</Text>
          </View>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${saudeRede.score}%`, backgroundColor: saudeRede.color }]} />
          </View>
          
          <View style={styles.healthFooter}>
            <Text style={styles.healthFooterText}>SLA GARANTIDO: 99.98%</Text>
            <Text style={styles.healthFooterText}>SENSORES ATIVOS: {qtdTotal} NÓS</Text>
          </View>
        </View>

        {/* KPIs GERAIS */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Máquinas na Rede</Text>
              <View style={[styles.kpiIconBg, { backgroundColor: 'rgba(148, 163, 184, 0.1)' }]}><Server size={18} color={theme.textMuted} /></View>
            </View>
            <Text style={styles.kpiValue}>{qtdTotal}</Text>
          </View>
          
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Operação Segura</Text>
              <View style={[styles.kpiIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}><Activity size={18} color={theme.success} /></View>
            </View>
            <Text style={[styles.kpiValue, { color: theme.success }]}>{qtdOperando}</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Ciclos Degelo</Text>
              <View style={[styles.kpiIconBg, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}><ThermometerSnowflake size={18} color={theme.info} /></View>
            </View>
            <Text style={[styles.kpiValue, { color: theme.info }]}>{qtdDegelo}</Text>
          </View>

          <View style={[styles.kpiCard, qtdFalha > 0 && { borderColor: 'rgba(239, 68, 68, 0.5)', borderWidth: 1 }]}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Ocorrências</Text>
              <View style={[styles.kpiIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}><AlertOctagon size={18} color={theme.danger} /></View>
            </View>
            <Text style={[styles.kpiValue, { color: theme.danger }]}>{qtdFalha}</Text>
          </View>
        </View>

        {/* TRIAGEM E OCORRÊNCIAS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monitor de Incidentes</Text>
          <TouchableOpacity style={styles.btnResolveAll}>
            <CheckCircle size={14} color={theme.textMuted} />
            <Text style={styles.btnResolveAllText}>Normalizar</Text>
          </TouchableOpacity>
        </View>

        {notificacoesAtivas.length === 0 ? (
          <View style={styles.emptyState}>
            <Radio size={48} color={theme.success} style={{ opacity: 0.8, marginBottom: 15 }} />
            <Text style={styles.emptyTitle}>Radar Limpo</Text>
            <Text style={styles.emptySub}>A infraestrutura encontra-se operável e dentro das métricas. Nenhuma anomalia detetada.</Text>
          </View>
        ) : (
          notificacoesAtivas.map(notif => (
            <View key={notif.id} style={styles.alertCard}>
              <View style={styles.alertTop}>
                <View style={styles.alertIconBox}>
                  <AlertTriangle size={20} color={theme.danger} />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertEquip}>{notif.equipamento_nome}</Text>
                  <Text style={styles.alertFilial}>{notif.filial}</Text>
                </View>
              </View>
              <Text style={styles.alertMsg}>{notif.mensagem}</Text>
              <View style={styles.alertFooter}>
                <View style={styles.timeRow}>
                  <Clock size={12} color={theme.textMuted} />
                  <Text style={styles.timeText}>{new Date().toLocaleTimeString().slice(0,5)}</Text>
                </View>
                <TouchableOpacity style={styles.btnActionAlert}>
                  <Text style={styles.btnActionText}>Verificar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { padding: 15, paddingBottom: 40 },
  
  healthBanner: {
    backgroundColor: theme.card, borderRadius: 16, padding: 15,
    borderWidth: 1, borderColor: theme.border, borderTopWidth: 4,
    marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  healthTitleRow: { flexDirection: 'row', alignItems: 'center' },
  healthTitle: { color: theme.textMain, fontSize: 16, fontWeight: '800' },
  healthSubtitle: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  healthScore: { fontSize: 28, fontWeight: '900', fontFamily: 'monospace' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  healthFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  healthFooterText: { color: theme.textMuted, fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  kpiCard: {
    width: (width - 40) / 2, backgroundColor: theme.card, borderRadius: 16, padding: 15,
    borderWidth: 1, borderColor: theme.border, marginBottom: 10
  },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  kpiTitle: { color: theme.textMuted, fontSize: 12, fontWeight: '700', flex: 1 },
  kpiIconBg: { padding: 6, borderRadius: 8 },
  kpiValue: { color: theme.textMain, fontSize: 24, fontWeight: '900' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: theme.textMain, fontSize: 18, fontWeight: '800' },
  btnResolveAll: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: theme.border },
  btnResolveAllText: { color: theme.textMuted, fontSize: 12, fontWeight: 'bold', marginLeft: 6 },

  alertCard: { backgroundColor: theme.card, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 4, borderLeftColor: theme.danger, marginBottom: 15 },
  alertTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  alertIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  alertEquip: { color: theme.textMain, fontSize: 16, fontWeight: '800' },
  alertFilial: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
  alertMsg: { color: theme.textMain, fontSize: 14, marginBottom: 15, lineHeight: 20 },
  alertFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { color: theme.textMuted, fontSize: 12, marginLeft: 6, fontWeight: '600' },
  btnActionAlert: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  btnActionText: { color: theme.danger, fontWeight: 'bold', fontSize: 12 },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border },
  emptyTitle: { color: theme.textMain, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptySub: { color: theme.textMuted, textAlign: 'center', paddingHorizontal: 20, fontSize: 13, lineHeight: 20 }
});