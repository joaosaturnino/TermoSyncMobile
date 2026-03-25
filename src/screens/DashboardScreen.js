import { AlertTriangle } from 'lucide-react-native';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, theme } from '../api/api';
import { AppContext } from '../context/AppContext'; // <-- IMPORTAMOS O CONTEXTO

export default function DashboardScreen() {
  // 1. LER A LOJA SELECIONADA NO MENU LATERAL
  const { filialAtiva } = useContext(AppContext); 

  const [equipamentos, setEquipamentos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resEquip, resNotif] = await Promise.all([
        api.get('/equipamentos'),
        api.get('/notificacoes')
      ]);
      setEquipamentos(resEquip.data);
      setNotificacoes(resNotif.data);
    } catch (e) {
      console.log('Erro ao carregar dashboard', e);
    }
  };

  const resolverNotificacao = async (id) => {
    try {
      await api.put(`/notificacoes/${id}/resolver`, { nota_resolucao: 'Verificado via Mobile' });
      carregarDados();
    } catch (e) {
      console.log(e);
    }
  };

  // 2. APLICAR O FILTRO (Se for 'Todas' mostra tudo, senão filtra pela filial)
  const equipamentosDaFilial = filialAtiva === 'Todas' ? equipamentos : equipamentos.filter(eq => eq.filial === filialAtiva);
  const notificacoesDaFilial = filialAtiva === 'Todas' ? notificacoes : notificacoes.filter(n => n.filial === filialAtiva);

  // 3. RECALCULAR KPIs APENAS PARA A LOJA SELECIONADA
  const qtdDegelo = equipamentosDaFilial.filter(e => e.em_degelo).length;
  const qtdFalha = equipamentosDaFilial.filter(e => !e.motor_ligado && !e.em_degelo).length;
  const qtdOperando = equipamentosDaFilial.length - qtdDegelo - qtdFalha;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      
      {/* KPIs */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}><Text style={styles.kpiTitle}>Parque IoT</Text><Text style={styles.kpiValue}>{equipamentosDaFilial.length}</Text></View>
        <View style={styles.kpiCard}><Text style={styles.kpiTitle}>Operação</Text><Text style={[styles.kpiValue, { color: theme.success }]}>{qtdOperando}</Text></View>
        <View style={styles.kpiCard}><Text style={styles.kpiTitle}>Degelo</Text><Text style={[styles.kpiValue, { color: theme.info }]}>{qtdDegelo}</Text></View>
        <View style={styles.kpiCard}><Text style={styles.kpiTitle}>Anomalias</Text><Text style={[styles.kpiValue, { color: theme.danger }]}>{qtdFalha}</Text></View>
      </View>

      <Text style={styles.sectionTitle}>
        Painel Operacional: {filialAtiva === 'Todas' ? 'Visão Global' : filialAtiva}
      </Text>

      {/* Alertas Filtrados */}
      {notificacoesDaFilial.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: theme.success, fontWeight: 'bold', fontSize: 18 }}>Plataforma Limpa</Text>
          <Text style={{ color: theme.textMuted, textAlign: 'center' }}>Temperatura e rede dentro dos conformes.</Text>
        </View>
      ) : (
        notificacoesDaFilial.map(notif => (
          <View key={notif.id} style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <AlertTriangle color={theme.danger} size={24} />
              <Text style={styles.alertEquip}>{notif.equipamento_nome}</Text>
            </View>
            <Text style={styles.badge}>{notif.filial} | {notif.setor}</Text>
            <Text style={styles.alertMsg}>{notif.mensagem}</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => resolverNotificacao(notif.id)}>
              <Text style={styles.actionBtnText}>Resolver Anomalia</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  kpiContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  kpiCard: { width: '48%', backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  kpiTitle: { fontSize: 12, color: theme.textMuted, fontWeight: 'bold', textTransform: 'uppercase' },
  kpiValue: { fontSize: 32, fontWeight: '900', color: theme.textMain, marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textMain, marginBottom: 15 },
  emptyState: { alignItems: 'center', padding: 30, backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed' },
  alertCard: { backgroundColor: '#fee2e2', borderLeftWidth: 5, borderLeftColor: theme.danger, padding: 15, borderRadius: 8, marginBottom: 15 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  alertEquip: { fontSize: 18, fontWeight: 'bold', color: theme.danger, marginLeft: 10 },
  badge: { backgroundColor: '#fca5a5', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold', color: '#7f1d1d', overflow: 'hidden', marginBottom: 10 },
  alertMsg: { fontSize: 15, color: theme.textMain, marginBottom: 15 },
  actionBtn: { backgroundColor: theme.danger, padding: 12, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: 'white', fontWeight: 'bold' }
});