import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useContext, useEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { api, getSocket } from '../api/api';
import { AppContext } from '../context/AppContext';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { filialAtiva, theme, equipamentos, notificacoes, carregarDadosBasicos, isDarkMode } = useContext(AppContext);

  useEffect(() => { 
    const socket = getSocket();
    socket.on('atualizacao_dados', () => carregarDadosBasicos());
    return () => socket.disconnect();
  }, []);

  const resolverNotificacao = async (id, acaoText) => {
    try { await api.put(`/api/notificacoes/${id}/resolver`, { nota_resolucao: `${acaoText} via Mobile` }); carregarDadosBasicos(); } catch (e) {}
  };

  const resolverTodasNotificacoes = async () => {
    try { await api.put(`/api/notificacoes/resolver-todas`); carregarDadosBasicos(); } catch (e) {}
  };

  const equipamentosDaFilial = (equipamentos || []).filter(eq => filialAtiva === 'Todas' || (eq.filial || 'Loja Principal') === filialAtiva);
  const notificacoesDaFilial = (notificacoes || []).filter(n => filialAtiva === 'Todas' || (n.filial || 'Loja Principal') === filialAtiva);

  const qtdDegelo = equipamentosDaFilial.filter(e => e.em_degelo).length;
  const qtdFalha = equipamentosDaFilial.filter(e => !e.motor_ligado && !e.em_degelo).length;
  const qtdTotal = equipamentosDaFilial.length;
  const qtdOperando = qtdTotal - qtdDegelo - qtdFalha;

  const dadosPie = [
    { name: 'Ok', value: qtdOperando, color: theme.success, legendFontColor: theme.textMuted },
    { name: 'Degelo', value: qtdDegelo, color: theme.info, legendFontColor: theme.textMuted },
    { name: 'Falha', value: qtdFalha, color: theme.danger, legendFontColor: theme.textMuted }
  ].filter(d => d.value > 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ padding: 15 }}>
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={styles.kpiLabel}>PARQUE IOT</Text><Text style={[styles.kpiVal, { color: theme.textMain }]}>{qtdTotal}</Text></View>
        <View style={[styles.kpiCard, { backgroundColor: theme.card, borderLeftColor: theme.success, borderLeftWidth: 4, borderColor: theme.border }]}><Text style={styles.kpiLabel}>OPERAÇÃO SEGURA</Text><Text style={[styles.kpiVal, { color: theme.success }]}>{qtdOperando}</Text></View>
        <View style={[styles.kpiCard, { backgroundColor: theme.card, borderLeftColor: theme.info, borderLeftWidth: 4, borderColor: theme.border }]}><Text style={styles.kpiLabel}>MODO DEGELO</Text><Text style={[styles.kpiVal, { color: theme.info }]}>{qtdDegelo}</Text></View>
        <View style={[styles.kpiCard, { backgroundColor: theme.card, borderLeftColor: theme.danger, borderLeftWidth: 4, borderColor: theme.border }]}><Text style={styles.kpiLabel}>ANOMALIAS</Text><Text style={[styles.kpiVal, { color: theme.danger }]}>{qtdFalha}</Text></View>
      </View>

      <View style={[styles.chartBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.chartTitle}>EFICIÊNCIA E SAÚDE DO FRIO</Text>
        <PieChart data={dadosPie} width={screenWidth - 60} height={160} chartConfig={{ color: () => '#000' }} accessor="value" backgroundColor="transparent" paddingLeft="10" absolute />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <Text style={[styles.sectionTitle, { color: theme.textMain }]}>Painel Operacional</Text>
        {notificacoesDaFilial.length > 0 && (
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.danger, padding: 8, borderRadius: 8 }} onPress={resolverTodasNotificacoes}>
            <MaterialCommunityIcons name="check-all" size={16} color={theme.danger} />
            <Text style={{ color: theme.danger, fontSize: 12, fontWeight: 'bold', marginLeft: 5 }}>Arquivar Todos</Text>
          </TouchableOpacity>
        )}
      </View>

      {notificacoesDaFilial.length === 0 ? (
        <View style={{ alignItems: 'center', padding: 40, borderWidth: 2, borderColor: theme.border, borderStyle: 'dashed', borderRadius: 12, backgroundColor: theme.card }}>
          <MaterialCommunityIcons name="check-circle" size={56} color={theme.success} />
          <Text style={{ color: theme.textMain, fontWeight: 'bold', fontSize: 18, marginTop: 10 }}>Plataforma Limpa</Text>
          <Text style={{ color: theme.textMuted, textAlign: 'center', marginTop: 5 }}>Nenhum alerta ativo no momento.</Text>
        </View>
      ) : (
        notificacoesDaFilial.map(n => {
          let colorTheme = theme.danger; 
          let bgTheme = theme.dangerLight; 
          let iconName = 'alert-circle';
          
          if (n.tipo_alerta === 'REDE') { colorTheme = theme.warning; iconName = 'wifi-off'; bgTheme = isDarkMode ? '#422006' : '#fef3c7'; }
          else if (n.tipo_alerta === 'DEGELO') { colorTheme = theme.info; iconName = 'snowflake'; bgTheme = isDarkMode ? 'rgba(56, 189, 248, 0.1)' : 'rgba(56, 189, 248, 0.1)'; }
          else if (n.tipo_alerta === 'MECANICA') { colorTheme = theme.alertMech; iconName = 'power'; bgTheme = isDarkMode ? '#431407' : '#ffedd5'; }
          else if (n.tipo_alerta === 'PORTA') { colorTheme = '#e11d48'; iconName = 'door-open'; bgTheme = isDarkMode ? '#4c0519' : '#ffe4e6'; }
          else if (n.tipo_alerta === 'PREDITIVO') { colorTheme = '#8b5cf6'; iconName = 'chart-line-variant'; bgTheme = isDarkMode ? '#2e1065' : '#ede9fe'; }
          else if (n.tipo_alerta === 'METROLOGIA') { colorTheme = '#6366f1'; iconName = 'certificate'; bgTheme = isDarkMode ? '#312e81' : '#e0e7ff'; }

          return (
            <View key={n.id} style={[styles.alertCard, { backgroundColor: bgTheme, borderLeftColor: colorTheme }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <MaterialCommunityIcons name={iconName} size={22} color={colorTheme} />
                  <Text style={[styles.alertEq, { color: colorTheme, marginLeft: 8, flexShrink: 1 }]} numberOfLines={2}>{n.equipamento_nome}</Text>
                </View>
                <Text style={{ color: colorTheme, fontSize: 11, fontWeight: 'bold', backgroundColor: `${colorTheme}20`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 10 }}>
                  {new Date(n.data_hora).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: 'bold', marginTop: 8, backgroundColor: theme.bg, alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                {n.filial} | {n.setor || 'Geral'}
              </Text>
              <Text style={{ color: theme.textMain, marginVertical: 12, fontSize: 14, fontWeight: '500' }}>{n.mensagem}</Text>
              
              <TouchableOpacity style={[styles.btnAction, { backgroundColor: colorTheme }]} onPress={() => resolverNotificacao(n.id, 'Resolvido')}>
                <Text style={{ color: '#fff', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {n.tipo_alerta === 'DEGELO' ? 'Ocultar Degelo' : 'Resolver Anomalia'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  kpiCard: { width: '48%', padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 15, elevation: 1 },
  kpiLabel: { fontSize: 10, fontWeight: '900', color: '#64748b' },
  kpiVal: { fontSize: 26, fontWeight: '900', marginTop: 5 },
  chartBox: { padding: 15, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginBottom: 25 },
  chartTitle: { fontSize: 11, fontWeight: '900', marginBottom: 15, color: '#64748b' },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  alertCard: { padding: 18, borderRadius: 12, marginBottom: 15, borderLeftWidth: 6, elevation: 2 },
  alertEq: { fontWeight: '900', fontSize: 17 },
  btnAction: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 }
});