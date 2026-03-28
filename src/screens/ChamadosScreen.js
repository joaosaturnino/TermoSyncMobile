import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useContext, useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function ChamadosScreen() {
  const { chamados, theme, userRole, nomeLogado, filialAtiva, tecnicosDb } = useContext(AppContext);
  const [filtroTecnico, setFiltroTecnico] = useState('todos');
  const [filtroTempo, setFiltroTempo] = useState('todos');

  const chamadosAtivos = useMemo(() => {
    const trintaDias = new Date(); trintaDias.setDate(trintaDias.getDate() - 30);
    return (chamados || []).filter(c => c.status !== 'Concluído' || new Date(c.data_conclusao) >= trintaDias);
  }, [chamados]);

  // Lógica exata da Web para preparar o PDF
  const listaParaPDF = useMemo(() => {
    let list = chamadosAtivos.filter(c => c.status === 'Concluído');
    if (userRole === 'MANUTENCAO') list = list.filter(c => c.tecnico_responsavel === nomeLogado);
    else if (filtroTecnico !== 'todos') list = list.filter(c => c.tecnico_responsavel === filtroTecnico);
    if (userRole !== 'LOJA' && filialAtiva !== 'Todas') list = list.filter(c => c.filial === filialAtiva);
    
    const hoje = new Date();
    if (filtroTempo === 'dia') list = list.filter(c => new Date(c.data_conclusao).toDateString() === hoje.toDateString());
    else if (filtroTempo === 'semana') list = list.filter(c => new Date(c.data_conclusao) >= new Date(hoje.getTime() - 7*24*60*60*1000));
    else if (filtroTempo === 'mes') list = list.filter(c => new Date(c.data_conclusao) >= new Date(hoje.getTime() - 30*24*60*60*1000));
    return list;
  }, [chamadosAtivos, filtroTecnico, filtroTempo, userRole, filialAtiva, nomeLogado]);

  const imprimirLivroOS = async () => {
    if (listaParaPDF.length === 0) return Alert.alert("Aviso", "Sem Ordens de Serviço concluídas para os filtros atuais.");
    let html = `<html><body style="font-family:sans-serif; padding: 20px;"><h2>LIVRO DE ORDENS DE SERVIÇO (OS)</h2>`;
    listaParaPDF.forEach(c => {
      html += `<div style="border-bottom:2px dashed #333; padding: 20px 0; page-break-inside: avoid;">
        <h3>OS #${c.id} - ${c.filial}</h3>
        <p><b>Equipamento:</b> ${c.equipamento_nome} | <b>Data Conclusão:</b> ${new Date(c.data_conclusao).toLocaleDateString()}</p>
        <p><b>Técnico Responsável:</b> ${c.tecnico_responsavel}</p>
        <p><b>Relatório de Intervenção:</b> ${c.nota_resolucao}</p>
        <br><p>_________________________________<br>Assinatura</p>
      </div>`;
    });
    html += `</body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        {userRole !== 'MANUTENCAO' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, marginBottom: 10 }}>
            <TouchableOpacity style={[styles.pill, filtroTecnico === 'todos' && styles.pillA]} onPress={() => setFiltroTecnico('todos')}><Text style={{ color: filtroTecnico === 'todos' ? '#fff' : '#64748b', fontWeight: 'bold' }}>Todos Técnicos</Text></TouchableOpacity>
            {tecnicosDb?.map(t => (
              <TouchableOpacity key={t.id} style={[styles.pill, filtroTecnico === t.nome_tecnico && styles.pillA]} onPress={() => setFiltroTecnico(t.nome_tecnico)}><Text style={{ color: filtroTecnico === t.nome_tecnico ? '#fff' : '#64748b', fontWeight: 'bold' }}>{t.nome_tecnico}</Text></TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, marginBottom: 15 }}>
            <TouchableOpacity style={[styles.pillT, filtroTempo === 'todos' && styles.pillTA]} onPress={() => setFiltroTempo('todos')}><Text style={{ color: filtroTempo === 'todos' ? '#3b82f6' : '#64748b', fontWeight: 'bold' }}>Sempre</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.pillT, filtroTempo === 'dia' && styles.pillTA]} onPress={() => setFiltroTempo('dia')}><Text style={{ color: filtroTempo === 'dia' ? '#3b82f6' : '#64748b', fontWeight: 'bold' }}>Hoje</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.pillT, filtroTempo === 'semana' && styles.pillTA]} onPress={() => setFiltroTempo('semana')}><Text style={{ color: filtroTempo === 'semana' ? '#3b82f6' : '#64748b', fontWeight: 'bold' }}>7 Dias</Text></TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={styles.btnPdf} onPress={imprimirLivroOS}>
          <MaterialCommunityIcons name="printer" size={20} color="#fff" />
          <Text style={styles.btnText}> Imprimir Livro de OS ({listaParaPDF.length})</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={chamadosAtivos} keyExtractor={i => i.id.toString()} renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.card, borderLeftColor: item.status === 'Concluído' ? theme.success : (item.urgencia === 'Crítica' ? theme.danger : theme.warning) }]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}><Text style={[styles.title, { color: theme.textMain }]}>{item.equipamento_nome}</Text><Text style={styles.badge}>{item.status}</Text></View>
          <Text style={{ color: theme.textMuted, marginTop: 5 }}>{item.filial} | Técnico: {item.tecnico_responsavel || 'Pendente'}</Text>
          <Text style={{ color: theme.textMain, marginVertical: 10, fontStyle: 'italic' }}>"{item.descricao}"</Text>
          {item.status === 'Concluído' && <View style={styles.resBox}><Text style={{ color: theme.success, fontSize: 12, fontWeight: 'bold' }}>RELATÓRIO: {item.nota_resolucao}</Text></View>}
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { marginBottom: 15 },
  pill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 10, justifyContent: 'center' },
  pillA: { backgroundColor: '#0f172a' },
  pillT: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 8 },
  pillTA: { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.05)' },
  btnPdf: { backgroundColor: '#3b82f6', flexDirection: 'row', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  btnText: { color: '#fff', fontWeight: '900', textTransform: 'uppercase', fontSize: 12, marginLeft: 8 },
  card: { padding: 18, borderRadius: 12, marginBottom: 12, borderLeftWidth: 6, elevation: 2 },
  title: { fontSize: 16, fontWeight: '900' },
  badge: { fontSize: 10, fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.05)', padding: 4, borderRadius: 6, color: '#64748b' },
  resBox: { marginTop: 10, padding: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#10b981' }
});