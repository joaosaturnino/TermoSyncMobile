import * as shape from 'd3-shape';
import {
  ChevronDown, ChevronUp,
  Leaf, List,
  Percent, Zap
} from 'lucide-react-native';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text,
  TouchableOpacity, View
} from 'react-native';
import { AreaChart, Grid, LineChart, YAxis } from 'react-native-svg-charts';
import { api, getSocket } from '../api/api';
import { AppContext } from '../context/AppContext';

const CUSTO_KWH_REAIS = 0.72; 
const FATOR_EMISSAO_CO2 = 0.25; 

export default function SustentabilidadeScreen() {
  const { filialAtiva, theme, userRole, userFilial } = useContext(AppContext);
  const [relatorios, setRelatorios] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mostrarTabelaBruta, setMostrarTabelaBruta] = useState(false);
  const [equipamentoFiltro, setEquipamentoFiltro] = useState('');

  const carregarDados = useCallback(async () => {
    try {
      const [resRel, resEq] = await Promise.all([
        api.get('/relatorios'), 
        api.get('/equipamentos')
      ]);
      setRelatorios(resRel.data);
      setEquipamentos(resEq.data);
    } catch (error) {
      console.error('Erro de sincronização:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();

    const socket = getSocket();

    socket.on('nova_leitura', (dadosNovaLeitura) => {
      if (userRole === 'LOJA' && dadosNovaLeitura.filial !== userFilial) return;

      setRelatorios(prev => {
        const novosDados = [...prev, dadosNovaLeitura];
        if (novosDados.length > 15000) novosDados.shift();
        return novosDados;
      });
    });

    socket.on('atualizacao_dados', () => carregarDados());

    return () => socket.disconnect();
  }, [carregarDados, userRole, userFilial]);

  const stats = useMemo(() => {
    const filtrados = relatorios.filter(r => {
      const matchFilial = filialAtiva === 'Todas' || r.filial === filialAtiva;
      const matchEquip = equipamentoFiltro === '' || r.nome === equipamentoFiltro;
      return matchFilial && matchEquip;
    });
    
    let somaKwh = 0, leiturasNoSLA = 0, somaTemp = 0, tMin = Infinity, tMax = -Infinity;

    filtrados.forEach(d => {
      const temp = parseFloat(d.temperatura);
      somaKwh += parseFloat(d.consumo_kwh || 0);
      somaTemp += temp;
      if (temp < tMin) tMin = temp;
      if (temp > tMax) tMax = temp;
      
      const eqRef = equipamentos.find(e => e.nome === d.nome);
      if (eqRef && temp >= eqRef.temp_min && temp <= eqRef.temp_max) leiturasNoSLA++;
    });

    const total = filtrados.length || 1;
    
    let somaExp = 0;
    filtrados.forEach(d => {
      const t = parseFloat(d.temperatura);
      somaExp += Math.exp(-83.144 / (0.0083144 * (t + 273.15)));
    });
    const mkt = filtrados.length > 0 
      ? ((83.144 / 0.0083144) / (-Math.log(somaExp / filtrados.length)) - 273.15).toFixed(2)
      : '--';

    // DOWNSAMPLING PARA O GRÁFICO (Otimização fundamental de memória)
    const arrGrafico = filtrados.map(f => parseFloat(f.temperatura));
    const arrEnergia = filtrados.map(f => parseFloat(f.consumo_kwh || 0));

    const dadosGraficoFiltrados = arrGrafico.length <= 200 
      ? arrGrafico 
      : arrGrafico.filter((_, idx) => idx % Math.ceil(arrGrafico.length / 200) === 0);

    const dadosEnergiaFiltrados = arrEnergia.length <= 200 
      ? arrEnergia 
      : arrEnergia.filter((_, idx) => idx % Math.ceil(arrEnergia.length / 200) === 0);

    return {
      totalEnergia: somaKwh,
      pegadaCarbono: (somaKwh * FATOR_EMISSAO_CO2).toFixed(1),
      custoEstimado: (somaKwh * CUSTO_KWH_REAIS).toFixed(2),
      slaCompliance: ((leiturasNoSLA / total) * 100).toFixed(1),
      mediaTemp: (somaTemp / total).toFixed(2),
      minTemp: tMin === Infinity ? '--' : tMin.toFixed(1),
      maxTemp: tMax === -Infinity ? '--' : tMax.toFixed(1),
      mktValue: mkt,
      dadosGrafico: dadosGraficoFiltrados, // ARRAY LEVE
      dadosEnergia: dadosEnergiaFiltrados, // ARRAY LEVE
      dadosBrutos: [...filtrados].reverse().slice(0, 50)
    };
  }, [relatorios, equipamentos, filialAtiva, equipamentoFiltro]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.bg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarDados(); }} colors={['#10b981']} />}
    >
      <View style={styles.header}>
        <Leaf color="#059669" size={24} />
        <Text style={[styles.title, { color: theme.textMain }]}>Inteligência e Sustentabilidade</Text>
      </View>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderLeftColor: '#10b981', backgroundColor: theme.card }]}>
          <Leaf size={16} color="#10b981" />
          <Text style={styles.kpiLabel}>PEGADA DE CARBONO</Text>
          <Text style={[styles.kpiValue, { color: '#10b981' }]}>{stats.pegadaCarbono} <Text style={styles.unit}>kg CO2</Text></Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: '#f59e0b', backgroundColor: theme.card }]}>
          <Zap size={16} color="#f59e0b" />
          <Text style={styles.kpiLabel}>CUSTO ESTIMADO (ESG)</Text>
          <Text style={[styles.kpiValue, { color: '#f59e0b' }]}><Text style={styles.unit}>R$ </Text>{stats.custoEstimado}</Text>
        </View>
      </View>

      <View style={[styles.auditCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.auditHeader}>
          <Percent size={18} color={theme.primary} />
          <Text style={[styles.auditTitle, { color: theme.textMain }]}> Compliance Score (SLA)</Text>
          <Text style={[styles.slaVal, { color: parseFloat(stats.slaCompliance) > 95 ? '#10b981' : '#ef4444' }]}>{stats.slaCompliance}%</Text>
        </View>
        
        <View style={styles.tempGrid}>
          <View style={styles.tempItem}><Text style={styles.tempLabel}>MÍNIMA</Text><Text style={[styles.tempVal, {color:'#10b981'}]}>{stats.minTemp}°C</Text></View>
          <View style={[styles.tempItem, styles.borderX]}><Text style={styles.tempLabel}>MÉDIA</Text><Text style={[styles.tempVal, {color:theme.textMain}]}>{stats.mediaTemp}°C</Text></View>
          <View style={styles.tempItem}><Text style={styles.tempLabel}>MÁXIMA</Text><Text style={[styles.tempVal, {color:'#ef4444'}]}>{stats.maxTemp}°C</Text></View>
        </View>

        <View style={[styles.mktHighlight, { backgroundColor: theme.bg }]}>
          <View>
            <Text style={[styles.mktTitle, { color: theme.primary }]}>TEMP. CINÉTICA MÉDIA (MKT)</Text>
            <Text style={[styles.mktSub, { color: theme.textMuted }]}>Fórmula RDC-ANVISA</Text>
          </View>
          <Text style={[styles.mktBigVal, { color: theme.primary }]}>{stats.mktValue}°C</Text>
        </View>
      </View>

      <View style={[styles.chartWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.chartTitle, { color: theme.textMain }]}>Tendência Térmica vs Consumo</Text>
        <View style={{ height: 180, flexDirection: 'row' }}>
           <YAxis data={stats.dadosGrafico} contentContainerStyle={{ marginBottom: 10 }} svg={{ fontSize: 8, fill: theme.textMuted }} numberOfTicks={5} />
           <View style={{ flex: 1, marginLeft: 5 }}>
              <AreaChart style={{ flex: 1 }} data={stats.dadosGrafico} svg={{ fill: 'rgba(5, 150, 105, 0.1)' }} curve={shape.curveMonotoneX}><Grid /></AreaChart>
              <LineChart style={StyleSheet.absoluteFill} data={stats.dadosEnergia} svg={{ stroke: '#f59e0b', strokeWidth: 1.5 }} curve={shape.curveMonotoneX} />
           </View>
        </View>
      </View>

      <View style={styles.filterBox}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <TouchableOpacity onPress={() => setEquipamentoFiltro('')} style={[styles.chip, { borderColor: theme.border, backgroundColor: equipamentoFiltro === '' ? '#38bdf8' : 'transparent' }]}><Text style={{ color: equipamentoFiltro === '' ? '#fff' : theme.textMuted, fontSize: 11, fontWeight: '700' }}>Geral</Text></TouchableOpacity>
          {equipamentos.filter(e => filialAtiva === 'Todas' || e.filial === filialAtiva).map(eq => (
            <TouchableOpacity key={eq.id} onPress={() => setEquipamentoFiltro(eq.nome)} style={[styles.chip, { borderColor: theme.border, backgroundColor: equipamentoFiltro === eq.nome ? '#38bdf8' : 'transparent' }]}><Text style={{ color: equipamentoFiltro === eq.nome ? '#fff' : theme.textMuted, fontSize: 11, fontWeight: '700' }}>{eq.nome}</Text></TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={[styles.btnTable, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setMostrarTabelaBruta(!mostrarTabelaBruta)}>
        <List size={18} color={theme.primary} /><Text style={[styles.btnTableText, { color: theme.textMain }]}> Matriz de Dados p/ Auditores</Text>
        {mostrarTabelaBruta ? <ChevronUp size={18} color={theme.textMuted} /> : <ChevronDown size={18} color={theme.textMuted} />}
      </TouchableOpacity>

      {mostrarTabelaBruta && (
        <View style={[styles.table, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.thRow}><Text style={styles.th}>DATA</Text><Text style={styles.th}>MÁQUINA</Text><Text style={styles.th}>T°C</Text><Text style={styles.th}>kWh</Text></View>
          {stats.dadosBrutos.map((item, idx) => (
            <View key={idx} style={[styles.tr, { borderBottomColor: theme.border }]}>
              <Text style={[styles.td, { color: theme.textMuted }]}>{new Date(item.data_hora).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
              <Text style={[styles.td, { fontWeight: '700' }]} numberOfLines={1}>{item.nome}</Text>
              <Text style={[styles.td, { fontWeight: '800', color: theme.primary }]}>{parseFloat(item.temperatura).toFixed(1)}°</Text>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}><Text style={{ fontWeight: '800', color: '#f59e0b', fontSize: 10 }}>{item.consumo_kwh} </Text><Zap size={10} color="#f59e0b" fill="#f59e0b" /></View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 16, fontWeight: '800', marginLeft: 8 },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kpiCard: { flex: 0.48, padding: 12, borderRadius: 12, borderLeftWidth: 5, elevation: 2 },
  kpiLabel: { fontSize: 6.5, fontWeight: '900', color: '#64748b', marginTop: 5, letterSpacing: 0.5 },
  kpiValue: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  unit: { fontSize: 8, fontWeight: '700' },
  auditCard: { padding: 15, borderRadius: 15, borderWidth: 1, marginBottom: 12 },
  auditHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  auditTitle: { fontSize: 12, fontWeight: '800', flex: 1 },
  slaVal: { fontSize: 18, fontWeight: '900' },
  tempGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)', paddingBottom: 10 },
  tempItem: { flex: 1, alignItems: 'center' },
  borderX: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  tempLabel: { fontSize: 7, fontWeight: '800', color: '#64748b' },
  tempVal: { fontSize: 14, fontWeight: '800' },
  mktHighlight: { padding: 10, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mktTitle: { fontSize: 7, fontWeight: '900' },
  mktBigVal: { fontSize: 18, fontWeight: '900' },
  chartWrapper: { padding: 12, borderRadius: 15, borderWidth: 1, marginBottom: 12 },
  chartTitle: { fontSize: 10, fontWeight: '800', marginBottom: 10 },
  filterBox: { marginBottom: 10 },
  chipRow: { flexDirection: 'row' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, marginRight: 6 },
  btnTable: { padding: 15, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  btnTableText: { flex: 1, fontWeight: '800', fontSize: 12 },
  table: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  thRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.03)', padding: 10 },
  th: { flex: 1, fontSize: 8, fontWeight: '900', color: '#64748b' },
  tr: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, alignItems: 'center' },
  td: { flex: 1, fontSize: 9 }
});