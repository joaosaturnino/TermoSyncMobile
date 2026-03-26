import {
  ActivitySquare,
  AlertTriangle,
  CheckCircle,
  ClipboardCheck,
  DoorOpen,
  Power,
  Snowflake,
  Wifi
} from 'lucide-react-native';
import { useContext, useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { api, getSocket } from '../api/api';
import { AppContext } from '../context/AppContext';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { filialAtiva, theme } = useContext(AppContext);
  const [equipamentos, setEquipamentos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => { 
    carregarDados(); 
    
    const socket = getSocket();
    
    // Atualiza apenas a temperatura/humidade em memória sem fazer nova requisição HTTP!
    socket.on('nova_leitura', (dadosNovaLeitura) => {
      setEquipamentos(prev => prev.map(eq => 
        eq.id === dadosNovaLeitura.equipamento_id 
          ? { ...eq, ultima_temp: dadosNovaLeitura.temperatura, ultima_umidade: dadosNovaLeitura.umidade } 
          : eq
      ));
    });

    // Só recarrega tudo via HTTP se houver um alerta novo, exclusão ou edição de equipamento
    socket.on('atualizacao_dados', () => carregarDados());

    return () => socket.disconnect();
  }, []);

  const carregarDados = async () => {
    try {
      const [resEquip, resNotif] = await Promise.all([
        api.get('/api/equipamentos'), // <-- CORRIGIDO AQUI
        api.get('/api/notificacoes')  // <-- CORRIGIDO AQUI
      ]);
      setEquipamentos(resEquip.data);
      setNotificacoes(resNotif.data);
    } catch (e) {
      console.log('Erro ao carregar dashboard', e);
    }
  };

  const resolverNotificacao = async (id, acaoText) => {
    try {
      await api.put(`/api/notificacoes/${id}/resolver`, { nota_resolucao: `${acaoText} via Mobile` }); // <-- CORRIGIDO AQUI
      carregarDados();
    } catch (e) {
      console.log(e);
    }
  };

  const resolverTodasNotificacoes = () => {
    Alert.alert('Limpeza do Painel', 'Arquivar todos os alarmes pendentes?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: async () => {
          try {
            await api.put('/api/notificacoes/resolver-todas'); // <-- CORRIGIDO AQUI
            carregarDados();
          } catch (e) {
            console.log(e);
          }
        }
      }
    ]);
  };

  const equipamentosDaFilial = filialAtiva === 'Todas' ? equipamentos : equipamentos.filter(eq => eq.filial === filialAtiva);
  const notificacoesDaFilial = filialAtiva === 'Todas' ? notificacoes : notificacoes.filter(n => n.filial === filialAtiva);

  const qtdDegelo = equipamentosDaFilial.filter(e => e.em_degelo).length;
  const qtdFalha = equipamentosDaFilial.filter(e => !e.motor_ligado && !e.em_degelo).length;
  const qtdTotal = equipamentosDaFilial.length;
  const qtdOperando = qtdTotal - qtdDegelo - qtdFalha;

  const dadosDonutStatus = [
    { name: 'Ok', value: qtdOperando, color: theme.success, legendFontColor: theme.textMuted, legendFontSize: 13 },
    { name: 'Degelo', value: qtdDegelo, color: '#38bdf8', legendFontColor: theme.textMuted, legendFontSize: 13 },
    { name: 'Falha', value: qtdFalha, color: theme.danger, legendFontColor: theme.textMuted, legendFontSize: 13 }
  ].filter(d => d.value > 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ padding: 16 }}>
      
      <View style={styles.kpiContainer}>
        <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.kpiTitle}>Parque IoT</Text>
          <Text style={[styles.kpiValue, { color: theme.textMain }]}>{qtdTotal}</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.kpiTitle}>Operação Segura</Text>
          <Text style={[styles.kpiValue, { color: theme.success }]}>{qtdOperando}</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.kpiTitle}>Modo Degelo</Text>
          <Text style={[styles.kpiValue, { color: '#38bdf8' }]}>{qtdDegelo}</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.kpiTitle}>Anomalias Ativas</Text>
          <Text style={[styles.kpiValue, { color: theme.danger }]}>{qtdFalha}</Text>
        </View>
      </View>

      <View style={[styles.donutContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.donutTitle}>Eficiência e Saúde do Frio</Text>
        {dadosDonutStatus.length > 0 ? (
          <PieChart
            data={dadosDonutStatus}
            width={screenWidth - 64}
            height={160}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor={"value"}
            backgroundColor={"transparent"}
            paddingLeft={"0"}
            center={[10, 0]}
            absolute
          />
        ) : (
          <Text style={{ marginTop: 30, color: theme.textMuted }}>Sem dados operacionais</Text>
        )}
      </View>

      <View style={styles.flexHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textMain }]}>Painel Operacional e Triagem</Text>
        {notificacoesDaFilial.length > 0 && (
          <TouchableOpacity style={[styles.btnOutline, { borderColor: theme.danger }]} onPress={resolverTodasNotificacoes}>
            <CheckCircle size={16} color={theme.danger} style={{ marginRight: 5 }} />
            <Text style={[styles.btnOutlineText, { color: theme.danger }]}>Arquivar Todos</Text>
          </TouchableOpacity>
        )}
      </View>

      {notificacoesDaFilial.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <CheckCircle size={56} color={theme.success} style={{ marginBottom: 15 }} />
          <Text style={{ color: theme.textMain, fontWeight: '800', fontSize: 18, marginBottom: 5 }}>Plataforma Limpa</Text>
          <Text style={{ color: theme.textMuted, textAlign: 'center' }}>Temperatura, rede e metrologia dentro dos conformes legais.</Text>
        </View>
      ) : (
        notificacoesDaFilial.map(notif => {
          const isRede = notif.tipo_alerta === 'REDE';
          const isDegelo = notif.tipo_alerta === 'DEGELO';
          const isMecanica = notif.tipo_alerta === 'MECANICA';
          const isPorta = notif.tipo_alerta === 'PORTA';
          const isPreditivo = notif.tipo_alerta === 'PREDITIVO';
          const isMetrologia = notif.tipo_alerta === 'METROLOGIA';

          let IconCmp = AlertTriangle;
          let colorTheme = theme.danger;
          let bgTheme = theme.dangerLight || '#fee2e2';

          if (isRede) { IconCmp = Wifi; colorTheme = theme.warning; bgTheme = 'rgba(245, 158, 11, 0.1)'; } 
          else if (isDegelo) { IconCmp = Snowflake; colorTheme = theme.info; bgTheme = 'rgba(56, 189, 248, 0.1)'; } 
          else if (isMecanica) { IconCmp = Power; colorTheme = theme.alertMech || '#f97316'; bgTheme = 'rgba(249, 115, 22, 0.1)'; }
          else if (isPorta) { IconCmp = DoorOpen; colorTheme = '#e11d48'; bgTheme = 'rgba(225, 29, 72, 0.1)'; }
          else if (isPreditivo) { IconCmp = ActivitySquare; colorTheme = '#8b5cf6'; bgTheme = 'rgba(139, 92, 246, 0.05)'; } 
          else if (isMetrologia) { IconCmp = ClipboardCheck; colorTheme = '#6366f1'; bgTheme = 'rgba(99, 102, 241, 0.05)'; }

          let btnText = 'Resolver Anomalia';
          if (isDegelo) btnText = 'Ocultar Degelo';
          else if (isMecanica) btnText = 'Assinalar Manutenção';
          else if (isPorta) btnText = 'Fechar Porta Física';
          else if (isMetrologia) btnText = 'Arquivar Notificação';

          const tempoFormatado = notif.data_hora ? new Date(notif.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

          return (
            <View key={notif.id} style={[styles.alertCard, { backgroundColor: bgTheme, borderLeftColor: colorTheme }]}>
              <View style={styles.alertHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <IconCmp color={colorTheme} size={22} />
                  <Text style={[styles.alertEquip, { color: colorTheme }]}>{notif.equipamento_nome}</Text>
                </View>
                <View style={[styles.timeBadge, { backgroundColor: isDegelo ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.1)' }]}>
                  <Text style={{ color: colorTheme, fontSize: 11, fontWeight: '700' }}>{tempoFormatado}</Text>
                </View>
              </View>
              
              <Text style={[styles.badgeSetor, { backgroundColor: theme.bg, color: theme.textMuted }]}>{notif.filial} | {notif.setor}</Text>
              <Text style={[styles.alertMsg, { color: theme.textMain }]}>{notif.mensagem}</Text>
              
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: colorTheme }]} 
                onPress={() => resolverNotificacao(notif.id, btnText)}
              >
                <Text style={styles.actionBtnText}>{btnText}</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kpiContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  kpiCard: { width: '48%', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  kpiTitle: { fontSize: 11, color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { fontSize: 32, fontWeight: '900', marginTop: 8, letterSpacing: -1 },
  donutContainer: { padding: 15, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginBottom: 25, elevation: 2 },
  donutTitle: { fontSize: 12, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  flexHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, flexWrap: 'wrap' },
  sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  btnOutline: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  btnOutlineText: { fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', padding: 40, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', marginBottom: 30 },
  alertCard: { borderLeftWidth: 6, padding: 18, borderRadius: 10, marginBottom: 15, elevation: 1 },
  alertHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  alertEquip: { fontSize: 17, fontWeight: '800', marginLeft: 8, flexShrink: 1 },
  timeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeSetor: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: '700', overflow: 'hidden', marginBottom: 12 },
  alertMsg: { fontSize: 14, marginBottom: 15, fontWeight: '500', lineHeight: 20 },
  actionBtn: { padding: 12, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: 'white', fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }
});