import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useContext, useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function HistoricoChamadosScreen() {
  const { chamados, userRole, nomeLogado, filialAtiva, tecnicosDb } = useContext(AppContext);
  const [filtroTecnico, setFiltroTecnico] = useState('todos');

  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const historicoAntigo = useMemo(() => {
    let list = chamados.filter(c => c.status === 'Concluído' && new Date(c.data_conclusao) < trintaDiasAtras);
    
    if (userRole === 'MANUTENCAO') list = list.filter(c => c.tecnico_responsavel === nomeLogado);
    else {
      if (userRole === 'ADMIN' && filialAtiva !== 'Todas') list = list.filter(c => c.filial === filialAtiva);
      if (filtroTecnico !== 'todos') list = list.filter(c => c.tecnico_responsavel === filtroTecnico);
    }
    
    return list;
  }, [chamados, userRole, nomeLogado, filialAtiva, filtroTecnico, trintaDiasAtras]);

  const imprimirArquivoPDF = async () => {
    if (historicoAntigo.length === 0) return Alert.alert("Aviso", "Histórico Vazio");
    
    let html = `
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
          .os-container { border-bottom: 2px dashed #94a3b8; padding-bottom: 30px; margin-bottom: 30px; page-break-inside: avoid; }
          h3 { color: #475569; text-align: center; border-bottom: 1px solid #475569; padding-bottom: 5px; margin-bottom: 15px;}
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .label { font-weight: bold; color: #475569; }
          .box { background: #f8fafc; padding: 10px; border-radius: 5px; border: 1px solid #e2e8f0; margin-top: 5px; font-size: 14px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
          .sig-box { width: 45%; text-align: center; border-top: 1px solid #000; padding-top: 5px; font-size: 12px; }
          .header-main { text-align: center; font-size: 22px; font-weight: bold; color: #0f172a; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header-main">ARQUIVO MORTO DE OS (+30 DIAS)</div>
    `;

    historicoAntigo.forEach(c => {
      html += `
        <div class="os-container">
          <h3>OS #${c.id} (ARQUIVADA) - ${c.filial}</h3>
          <div class="row">
            <div><span class="label">Equipamento:</span> ${c.equipamento_nome}</div>
            <div><span class="label">Conclusão:</span> ${new Date(c.data_conclusao).toLocaleDateString()}</div>
          </div>
          <div class="row">
            <div><span class="label">Solicitante:</span> ${c.solicitante_nome}</div>
            <div><span class="label">Técnico:</span> ${c.tecnico_responsavel || 'N/A'}</div>
          </div>
          <div style="margin-bottom: 10px; margin-top: 15px;">
            <span class="label">Relatório Histórico:</span>
            <div class="box">${c.nota_resolucao}</div>
          </div>
        </div>
      `;
    });
    html += `</body></html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch(e) { Alert.alert("Erro", "Falha no PDF"); }
  };

  return (
    <View style={styles.container}>
      {userRole !== 'MANUTENCAO' && (
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 5 }}>Filtrar Arquivo por Técnico:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={[styles.filterBtnTec, filtroTecnico === 'todos' && styles.filterActiveTec]} onPress={() => setFiltroTecnico('todos')}><Text style={[styles.fTextTec, filtroTecnico === 'todos' && styles.fTextA]}>Todos</Text></TouchableOpacity>
            {tecnicosDb.map(tec => (
              <TouchableOpacity key={tec.id} style={[styles.filterBtnTec, filtroTecnico === tec.nome_tecnico && styles.filterActiveTec]} onPress={() => setFiltroTecnico(tec.nome_tecnico)}>
                <Text style={[styles.fTextTec, filtroTecnico === tec.nome_tecnico && styles.fTextA]}>{tec.nome_tecnico}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity style={styles.btnArchive} onPress={imprimirArquivoPDF}>
        <MaterialCommunityIcons name="archive" size={20} color="#fff" />
        <Text style={styles.btnArchiveText}>Imprimir Arquivo PDF ({historicoAntigo.length})</Text>
      </TouchableOpacity>

      <FlatList
        data={historicoAntigo}
        keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.equipamento_nome}</Text>
              <Text style={styles.statusBadge}>Arquivado</Text>
            </View>
            <Text style={styles.desc}>"{item.descricao}"</Text>
            <Text style={styles.info}>Loja: {item.filial} | Tec: {item.tecnico_responsavel}</Text>
            <View style={styles.resBox}>
              <Text style={styles.resText}>Resolução: {item.nota_resolucao}</Text>
              <Text style={{fontSize: 10, color: 'gray', marginTop: 5}}>Data: {new Date(item.data_conclusao).toLocaleDateString()}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 15 },
  filterBtnTec: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center' },
  filterActiveTec: { backgroundColor: '#94a3b8', borderColor: '#94a3b8' },
  fTextTec: { color: '#475569', fontSize: 12, fontWeight: 'bold' },
  fTextA: { color: '#fff' },
  btnArchive: { backgroundColor: '#475569', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 8, marginBottom: 15 },
  btnArchiveText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  card: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 10, marginBottom: 15, borderLeftWidth: 6, borderLeftColor: '#94a3b8', elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#475569' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#94a3b8', color: '#fff', fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  desc: { fontSize: 14, fontStyle: 'italic', marginVertical: 10, color: '#64748b' },
  info: { fontSize: 13, color: '#64748b', marginBottom: 3 },
  resBox: { backgroundColor: '#e2e8f0', padding: 10, borderRadius: 8, marginTop: 10 },
  resText: { fontSize: 13, color: '#334155' }
});