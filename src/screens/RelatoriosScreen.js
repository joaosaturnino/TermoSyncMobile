import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../api/api';
import { AppContext } from '../context/AppContext';

const screenWidth = Dimensions.get('window').width;

export default function RelatoriosScreen() {
  const { filialAtiva, theme, CUSTO_KWH_REAIS, FATOR_EMISSAO_CO2, userRole } = useContext(AppContext);
  const [relatorios, setRelatorios] = useState([]);
  const [mostrarTabela, setMostrarTabela] = useState(false);
  const [filtroTempo, setFiltroTempo] = useState(24);

  useEffect(() => {
    const dInicio = new Date(Date.now() - (filtroTempo * 60 * 60 * 1000)).toISOString();
    const dFim = new Date().toISOString();
    api.get(`/api/relatorios?data_inicio=${dInicio}&data_fim=${dFim}`).then(res => setRelatorios(res.data)).catch(() => {});
  }, [filialAtiva, filtroTempo]);

  const dados = useMemo(() => {
    return filialAtiva === 'Todas' ? relatorios : (relatorios || []).filter(r => (r.filial || 'Loja Principal') === filialAtiva);
  }, [relatorios, filialAtiva]);

  const { totalKwh, slaCompliance, kpis, mktCalculado } = useMemo(() => {
    if (!dados || dados.length === 0) return { totalKwh: 0, slaCompliance: '--', kpis: { min: '--', med: '--', max: '--' }, mktCalculado: '--' };
    
    let tKwh = 0; let sTemp = 0; let min = Infinity; let max = -Infinity; let leiturasSLA = 0;
    let somaMKT = 0;

    dados.forEach(d => {
      const t = parseFloat(d.temperatura);
      tKwh += parseFloat(d.consumo_kwh || 0);
      sTemp += t;
      if (t < min) min = t; if (t > max) max = t;
      if (t >= 2 && t <= 8) leiturasSLA++;
      somaMKT += Math.exp(-83.144 / (0.0083144 * (t + 273.15)));
    });

    return {
      totalKwh: tKwh,
      slaCompliance: ((leiturasSLA / dados.length) * 100).toFixed(1),
      kpis: { min: min.toFixed(1), med: (sTemp / dados.length).toFixed(2), max: max.toFixed(1) },
      mktCalculado: ((83.144 / 0.0083144) / (-Math.log(somaMKT / dados.length)) - 273.15).toFixed(2)
    };
  }, [dados]);

  const gerarExportacao = async (tipo) => {
    if (dados.length === 0) return Alert.alert("Aviso", "Sem dados para exportar.");
    if (tipo === 'pdf') {
      let html = `<html><body style="font-family:sans-serif;"><h2>Auditoria ESG - ${filialAtiva}</h2><table border="1" style="width:100%; border-collapse:collapse;"><tr><th>Data</th><th>Eq.</th><th>Temp</th><th>Consumo</th></tr>`;
      dados.slice(0, 150).forEach(r => html += `<tr><td>${new Date(r.data_hora).toLocaleString()}</td><td>${r.nome}</td><td>${r.temperatura}°C</td><td>${r.consumo_kwh}kWh</td></tr>`);
      html += `</table><br><p>Auditor Responsável: ${userRole}</p></body></html>`;
      const { uri } = await Print.printToFileAsync({ html }); await Sharing.shareAsync(uri);
    } else {
      let csv = "\uFEFFData,Filial,Equipamento,Temp,Consumo\n";
      dados.forEach(r => csv += `"${new Date(r.data_hora).toLocaleString()}","${r.filial}","${r.nome}","${r.temperatura}","${r.consumo_kwh}"\n`);
      const uri = FileSystem.cacheDirectory + `Auditoria_ESG.csv`; await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 }); await Sharing.shareAsync(uri);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ padding: 15 }}>
      
      <View style={styles.esgGrid}>
        <View style={[styles.esgCard, { borderLeftColor: theme.success, backgroundColor: theme.card }]}><Text style={styles.esgL}><MaterialCommunityIcons name="leaf" size={12}/> PEGADA CARBONO</Text><Text style={[styles.esgV, { color: theme.success }]}>{(totalKwh * FATOR_EMISSAO_CO2).toFixed(1)}kg</Text></View>
        <View style={[styles.esgCard, { borderLeftColor: theme.warning, backgroundColor: theme.card }]}><Text style={styles.esgL}><MaterialCommunityIcons name="currency-usd" size={12}/> CUSTO ESTIMADO</Text><Text style={[styles.esgV, { color: theme.warning }]}>R$ {(totalKwh * CUSTO_KWH_REAIS).toFixed(2)}</Text></View>
      </View>

      <View style={[styles.esgCard, { width: '100%', marginBottom: 15, borderLeftColor: theme.primary, backgroundColor: theme.card }]}>
        <Text style={styles.esgL}><MaterialCommunityIcons name="thermometer" size={12}/> FATOR TÉRMICO E MKT (SLA: {slaCompliance}%)</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 10, marginBottom: 10 }}>
          <View style={{ alignItems: 'center' }}><Text style={styles.subL}>Mínima</Text><Text style={[styles.subV, { color: theme.success }]}>{kpis.min}°C</Text></View>
          <View style={{ alignItems: 'center' }}><Text style={styles.subL}>Média</Text><Text style={[styles.subV, { color: theme.textMain }]}>{kpis.med}°C</Text></View>
          <View style={{ alignItems: 'center' }}><Text style={styles.subL}>Máxima</Text><Text style={[styles.subV, { color: theme.danger }]}>{kpis.max}°C</Text></View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.primary }}>Temperatura Cinética Média</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: theme.primary, backgroundColor: theme.bg, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 8 }}>{mktCalculado}°C</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {[1, 12, 24].map(h => (
            <TouchableOpacity key={h} style={[styles.btnTime, { borderColor: theme.border, backgroundColor: filtroTempo === h ? theme.textMain : theme.card }]} onPress={() => setFiltroTempo(h)}><Text style={{ color: filtroTempo === h ? theme.bg : theme.textMuted, fontSize: 12, fontWeight: 'bold' }}>{h}h</Text></TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <TouchableOpacity style={[styles.btnE, {backgroundColor: theme.card, borderColor: theme.border}]} onPress={() => gerarExportacao('csv')}><MaterialCommunityIcons name="download" size={18} color={theme.textMuted}/></TouchableOpacity>
          <TouchableOpacity style={[styles.btnE, { backgroundColor: theme.danger, borderColor: theme.danger }]} onPress={() => gerarExportacao('pdf')}><MaterialCommunityIcons name="file-pdf-box" size={18} color="#fff"/></TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={[styles.btnMatriz, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setMostrarTabela(!mostrarTabela)}>
        <Text style={{ color: theme.textMuted, fontWeight: 'bold' }}><MaterialCommunityIcons name="list-status" size={16}/> {mostrarTabela ? 'Esconder Matriz Bruta' : 'Ver Matriz de Dados p/ Auditores'}</Text>
      </TouchableOpacity>

      {mostrarTabela && dados.slice(0, 30).map((r, i) => (
        <View key={i} style={[styles.row, { borderBottomColor: theme.border }]}>
          <View style={{flex: 2}}><Text style={{ color: theme.textMain, fontWeight: 'bold' }}>{r.nome}</Text><Text style={{fontSize: 10, color: theme.textMuted}}>{new Date(r.data_hora).toLocaleTimeString()}</Text></View>
          <Text style={{ flex: 1, color: theme.primary, fontWeight: '900', textAlign: 'center' }}>{parseFloat(r.temperatura).toFixed(1)}°C</Text>
          <Text style={{ flex: 1, color: theme.warning, textAlign: 'right', fontWeight: '900' }}>{parseFloat(r.consumo_kwh).toFixed(2)}kWh</Text>
        </View>
      ))}
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  esgGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  esgCard: { width: '48%', padding: 15, borderRadius: 12, borderLeftWidth: 5, elevation: 3 },
  esgL: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginBottom: 8 },
  esgV: { fontSize: 24, fontWeight: '900' },
  subL: { fontSize: 11, color: '#64748b' },
  subV: { fontSize: 16, fontWeight: '900' },
  btnTime: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  btnE: { padding: 10, borderRadius: 8, borderWidth: 1 },
  btnMatriz: { padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10, borderStyle: 'dashed', borderWidth: 1 },
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, alignItems: 'center' }
});