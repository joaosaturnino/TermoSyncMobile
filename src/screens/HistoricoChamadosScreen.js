import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useContext, useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function HistoricoChamadosScreen() {
  const { chamados, theme, userRole, nomeLogado, filialAtiva, tecnicosDb } = useContext(AppContext);
  const [filtroTecnico, setFiltroTecnico] = useState('todos');

  const chamadosHistorico = useMemo(() => {
    const trintaDias = new Date(); trintaDias.setDate(trintaDias.getDate() - 30);
    return (chamados || []).filter(c => c.status === 'Concluído' && new Date(c.data_conclusao) < trintaDias);
  }, [chamados]);

  const listaParaPDF = useMemo(() => {
    let list = chamadosHistorico;
    if (userRole === 'MANUTENCAO') list = list.filter(c => c.tecnico_responsavel === nomeLogado);
    else if (filtroTecnico !== 'todos') list = list.filter(c => c.tecnico_responsavel === filtroTecnico);
    if (userRole !== 'LOJA' && filialAtiva !== 'Todas') list = list.filter(c => c.filial === filialAtiva);
    return list;
  }, [chamadosHistorico, filtroTecnico, userRole, filialAtiva, nomeLogado]);

  const imprimirLivroAntigo = async () => {
    if (listaParaPDF.length === 0) return Alert.alert("Aviso", "Sem Ordens de Serviço históricas.");
    let html = `<html><body style="font-family:sans-serif; padding: 20px;"><h2>LIVRO DE OS (ARQUIVO > 30 DIAS)</h2>`;
    listaParaPDF.forEach(c => {
      html += `<div style="border-bottom:2px dashed #ccc; padding: 20px 0;">
        <h3>OS #${c.id} - ${c.filial}</h3>
        <p><b>Equipamento:</b> ${c.equipamento_nome} | <b>Data:</b> ${new Date(c.data_conclusao).toLocaleDateString()}</p>
        <p><b>Técnico:</b> ${c.tecnico_responsavel}</p>
        <p><b>Relatório:</b> ${c.nota_resolucao}</p><br><p>_________________________________<br>Assinatura</p>
      </div>`;
    });
    html += `</body></html>`;
    const { uri } = await Print.printToFileAsync({ html }); await Sharing.shareAsync(uri);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        {userRole !== 'MANUTENCAO' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, marginBottom: 15 }}>
            <TouchableOpacity style={[styles.pill, filtroTecnico === 'todos' && styles.pillA]} onPress={() => setFiltroTecnico('todos')}><Text style={{ color: filtroTecnico === 'todos' ? '#fff' : '#64748b', fontWeight: 'bold' }}>Todos Técnicos</Text></TouchableOpacity>
            {tecnicosDb?.map(t => (
              <TouchableOpacity key={t.id} style={[styles.pill, filtroTecnico === t.nome_tecnico && styles.pillA]} onPress={() => setFiltroTecnico(t.nome_tecnico)}><Text style={{ color: filtroTecnico === t.nome_tecnico ? '#fff' : '#64748b', fontWeight: 'bold' }}>{t.nome_tecnico}</Text></TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <TouchableOpacity style={styles.btnPdf} onPress={imprimirLivroAntigo}><MaterialCommunityIcons name="printer" size={20} color="#fff" /><Text style={styles.btnText}> Imprimir Arquivo (${listaParaPDF.length})</Text></TouchableOpacity>
      </View>

      {chamadosHistorico.length === 0 ? (
          <View style={{alignItems:'center', marginTop:50}}><MaterialCommunityIcons name="archive" size={50} color={theme.textMuted} /><Text style={{color: theme.textMuted, marginTop:10}}>Não há OS com mais de 30 dias.</Text></View>
      ) : (
        <FlatList data={chamadosHistorico} keyExtractor={i => i.id.toString()} renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderLeftColor: 'gray', opacity: 0.8 }]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}><Text style={[styles.title, { color: theme.textMain }]}>{item.equipamento_nome}</Text><Text style={styles.badge}>Arquivado</Text></View>
            <Text style={{ color: theme.textMuted, marginTop: 5 }}>{item.filial} | Técnico: {item.tecnico_responsavel}</Text>
            <View style={styles.resBox}><Text style={{ color: theme.textMain, fontSize: 12, fontWeight: 'bold' }}>Resolução: {item.nota_resolucao}</Text><Text style={{fontSize: 10, color:'gray', marginTop: 4}}>{new Date(item.data_conclusao).toLocaleDateString()}</Text></View>
          </View>
        )} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { marginBottom: 15 },
  pill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 10, justifyContent: 'center' },
  pillA: { backgroundColor: '#0f172a' },
  btnPdf: { backgroundColor: '#0f172a', flexDirection: 'row', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '900', textTransform: 'uppercase', fontSize: 12, marginLeft: 8 },
  card: { padding: 18, borderRadius: 12, marginBottom: 12, borderLeftWidth: 6, elevation: 2 },
  title: { fontSize: 16, fontWeight: '900' },
  badge: { fontSize: 10, fontWeight: 'bold', backgroundColor: 'gray', color: 'white', padding: 4, borderRadius: 6 },
  resBox: { marginTop: 10, padding: 12, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8 }
});