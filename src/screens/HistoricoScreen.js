import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../api/api';
import { AppContext } from '../context/AppContext';

export default function HistoricoScreen() {
  const { filialAtiva, userRole, theme } = useContext(AppContext);
  const [historico, setHistorico] = useState([]);

  useEffect(() => { api.get('/api/notificacoes/historico').then(res => setHistorico(res.data)).catch(()=>{}); }, [filialAtiva]);

  const dadosFiltrados = useMemo(() => filialAtiva === 'Todas' ? historico : historico.filter(x => x.filial === filialAtiva), [historico, filialAtiva]);

  const gerarExportacao = async (tipo) => {
    if (dadosFiltrados.length === 0) return Alert.alert("Aviso", "Sem dados de histórico.");
    if (tipo === 'pdf') {
      let html = `<html><body style="font-family:sans-serif;"><h2>Auditoria de Ocorrências (RDC)</h2><p>Âmbito: ${filialAtiva}</p><table border="1" style="width:100%; border-collapse:collapse;"><tr><th>Data</th><th>Equipamento</th><th>Ocorrência</th><th>Relatório / Resolução</th></tr>`;
      dadosFiltrados.forEach(r => html += `<tr><td>${new Date(r.data_hora).toLocaleString()}</td><td>${r.filial} - ${r.equipamento_nome}</td><td>${r.mensagem}</td><td>${r.nota_resolucao}</td></tr>`);
      html += `</table><br><p>Assinatura do Auditor - (${userRole})</p></body></html>`;
      const { uri } = await Print.printToFileAsync({ html }); await Sharing.shareAsync(uri);
    } else {
      let csv = "\uFEFFData,Equipamento,Setor,Ocorrencia,Tecnico_Relatorio\n";
      dadosFiltrados.forEach(r => csv += `"${new Date(r.data_hora).toLocaleString()}","${r.equipamento_nome}","${r.setor}","${r.mensagem}","${r.nota_resolucao}"\n`);
      const uri = FileSystem.cacheDirectory + `Auditoria_RDC_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(uri, csv); await Sharing.shareAsync(uri);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.actionGroup}>
        <TouchableOpacity style={styles.btnCsv} onPress={() => gerarExportacao('csv')}><MaterialCommunityIcons name="download" size={20} color={theme.textMuted} /></TouchableOpacity>
        <TouchableOpacity style={styles.btnPdf} onPress={() => gerarExportacao('pdf')}><MaterialCommunityIcons name="file-pdf-box" size={20} color="#fff" /><Text style={styles.btnPdfText}>Exportar Log Auditável</Text></TouchableOpacity>
      </View>
      {dadosFiltrados.length === 0 ? (
         <View style={{alignItems:'center', marginTop:50}}><MaterialCommunityIcons name="history" size={50} color={theme.textMuted} /><Text style={{color: theme.textMuted, marginTop:10}}>O histórico de auditoria está vazio.</Text></View>
      ) : (
        <FlatList data={dadosFiltrados} keyExtractor={i => i.id.toString()} renderItem={({ item }) => (
            <View style={styles.timelineItem}>
              <View style={styles.linhaVertical} />
              <View style={styles.bolinha} />
              <View style={[styles.card, {backgroundColor: theme.card}]}>
                <View style={styles.header}><Text style={styles.data}><MaterialCommunityIcons name="calendar-clock" size={12}/> {new Date(item.data_hora).toLocaleString()}</Text><Text style={[styles.badge, {backgroundColor: theme.bg, color: theme.textMuted}]}>{item.filial}</Text></View>
                <Text style={[styles.nomeEq, {color: theme.textMain}]}>{item.equipamento_nome}</Text>
                <Text style={styles.mensagem}><MaterialCommunityIcons name="alert" size={14} color={theme.danger}/> {item.mensagem}</Text>
                <View style={styles.resBox}><Text style={styles.resTitulo}>Relatório Assinado:</Text><Text style={[styles.resTexto, {color: theme.primary}]}>{item.nota_resolucao}</Text></View>
              </View>
            </View>
        )} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  actionGroup: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20, gap: 10 },
  btnCsv: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff' },
  btnPdf: { flex: 1, backgroundColor: '#ef4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8 },
  btnPdfText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  timelineItem: { flexDirection: 'row', marginBottom: 15 },
  linhaVertical: { position: 'absolute', left: 15, top: 20, bottom: -20, width: 2, backgroundColor: '#cbd5e1' },
  bolinha: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#059669', marginTop: 15, marginLeft: 10, marginRight: 10, zIndex: 1 },
  card: { flex: 1, padding: 15, borderRadius: 10, elevation: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  data: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
  badge: { fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold' },
  nomeEq: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  mensagem: { fontSize: 14, color: '#ef4444', marginBottom: 10 },
  resBox: { backgroundColor: 'rgba(5, 150, 105, 0.05)', padding: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#059669' },
  resTitulo: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginBottom: 2 },
  resTexto: { fontSize: 13, fontWeight: 'bold' }
});