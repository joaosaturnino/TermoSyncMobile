import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  AlertTriangle,
  Calendar,
  FileText,
  History
} from 'lucide-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { api } from '../api/api';
import { AppContext } from '../context/AppContext';

const TimelineItem = React.memo(({ item, theme }) => (
  <View style={styles.timelineItem}>
    <View style={[styles.timelineMarker, { backgroundColor: theme.primary }]} />
    <View style={[styles.timelineContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.timelineHeader}>
        <View style={styles.dateRow}>
          <Calendar size={14} color={theme.textMuted} />
          <Text style={[styles.timelineDate, { color: theme.textMuted }]}>
            {new Date(item.data_hora).toLocaleString()}
          </Text>
        </View>
        <Text style={[styles.badgeSetor, { backgroundColor: theme.bg, color: theme.textMuted }]}>
          {item.filial} | {item.setor}
        </Text>
      </View>
      
      <View style={styles.timelineBody}>
        <Text style={[styles.equipName, { color: theme.primary }]}>{item.equipamento_nome}</Text>
        <View style={styles.alertRow}>
          <AlertTriangle size={16} color="#ef4444" />
          <Text style={styles.alertMsg}>{item.mensagem}</Text>
        </View>
      </View>

      <View style={[styles.timelineAction, { backgroundColor: 'rgba(16, 185, 129, 0.05)' }]}>
        <Text style={styles.actionLabel}>RELATÓRIO TÉCNICO ASSINADO:</Text>
        <Text style={[styles.actionText, { color: theme.textMain }]}>{item.nota_resolucao}</Text>
      </View>
    </View>
  </View>
));

export default function HistoricoScreen() {
  const { filialAtiva, theme } = useContext(AppContext);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarHistorico = useCallback(async () => {
    try {
      const res = await api.get('/api/notificacoes/historico');
      setHistorico(res.data);
    } catch (error) {
      console.error('Erro ao carregar logs RDC:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const filtrados = useMemo(() => {
    return historico.filter(h => filialAtiva === 'Todas' || h.filial === filialAtiva);
  }, [historico, filialAtiva]);

  // 🔴 NOVA FUNÇÃO PARA GERAR O PDF
  const gerarPDF = async () => {
    if (filtrados.length === 0) return Alert.alert('Aviso', 'Não há dados para exportar.');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
            h1 { color: #059669; text-align: center; }
            h3 { text-align: center; color: #666; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #f1f5f9; padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 12px; }
            td { padding: 10px; border: 1px solid #ddd; font-size: 11px; }
            .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #999; }
          </style>
        </head>
        <body>
          <h1>TermoSync - Relatório de Auditoria</h1>
          <h3>Unidade: ${filialAtiva} | Data: ${new Date().toLocaleDateString()}</h3>
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Equipamento</th>
                <th>Filial/Setor</th>
                <th>Ocorrência</th>
                <th>Resolução Técnica</th>
              </tr>
            </thead>
            <tbody>
              ${filtrados.map(item => `
                <tr>
                  <td>${new Date(item.data_hora).toLocaleString()}</td>
                  <td>${item.equipamento_nome}</td>
                  <td>${item.filial} / ${item.setor}</td>
                  <td style="color: #ef4444;">${item.mensagem}</td>
                  <td>${item.nota_resolucao}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p class="footer">Documento gerado eletronicamente para fins de conformidade RDC/HACCP.</p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.headerArea}>
        <View>
          <Text style={[styles.title, { color: theme.textMain }]}>Livro de Registo Oficial</Text>
          <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>Conformidade RDC / HACCP</Text>
        </View>
        <TouchableOpacity style={styles.btnPdf} onPress={gerarPDF}>
          <FileText size={18} color="#fff" />
          <Text style={styles.btnPdfText}> PDF</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <TimelineItem item={item} theme={theme} />}
        ListHeaderComponent={<View style={styles.timelineLine} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <History size={48} color={theme.border} />
            <Text style={{ color: theme.textMuted, marginTop: 10 }}>Nenhum log auditável encontrado.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={carregarHistorico} colors={[theme.primary]} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  title: { fontSize: 18, fontWeight: '800' },
  btnPdf: { backgroundColor: '#ef4444', flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, alignItems: 'center', elevation: 2 },
  btnPdfText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },
  timelineLine: { position: 'absolute', left: 27, top: 20, bottom: 0, width: 2, backgroundColor: '#e2e8f0' },
  timelineItem: { paddingLeft: 35, marginBottom: 20, position: 'relative' },
  timelineMarker: { position: 'absolute', left: 20, top: 20, width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: '#f8fafc', zIndex: 1 },
  timelineContent: { padding: 15, borderRadius: 12, borderWidth: 1, elevation: 2 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)', paddingBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  timelineDate: { fontSize: 11, fontWeight: '700', marginLeft: 5 },
  badgeSetor: { fontSize: 9, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  timelineBody: { marginBottom: 12 },
  equipName: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  alertRow: { flexDirection: 'row', alignItems: 'center' },
  alertMsg: { color: '#ef4444', fontSize: 12, marginLeft: 6, fontWeight: '600', flex: 1 },
  timelineAction: { padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#10b981', marginTop: 5 },
  actionLabel: { fontSize: 9, fontWeight: '900', color: '#10b981', marginBottom: 4, letterSpacing: 0.5 },
  actionText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  empty: { alignItems: 'center', marginTop: 100 }
});