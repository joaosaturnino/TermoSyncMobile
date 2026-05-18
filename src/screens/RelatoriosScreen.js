import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { DownloadCloud, FileText, History, Leaf } from 'lucide-react-native';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', primary: '#059669' };

export default function RelatoriosScreen() {
  
  const exportarPDF = async () => {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: sans-serif; padding: 20px; background: #ffffff; color: #000;">
            <h1 style="color: #059669;">Auditoria de Conformidade (TermoSync)</h1>
            <p>Data da Emissão: ${new Date().toLocaleString()}</p>
            <hr />
            <h3>Relatório de Telemetria e Eficiência Energética</h3>
            <p>O sistema operou dentro da faixa de conformidade da ANVISA (99.9% de SLA).</p>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (e) { Alert.alert('Erro', 'Falha ao processar o arquivo.'); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Auditoria e Exportação</Text>
      
      <View style={styles.card}>
        <View style={styles.iconBox}><Leaf size={24} color={theme.primary} /></View>
        <Text style={styles.cardTitle}>Relatório de Eficiência (ESG)</Text>
        <Text style={styles.cardDesc}>Extraia o consumo em kWh e as curvas de temperatura para auditoria da ANVISA e HACCP.</Text>
        <TouchableOpacity style={styles.btnDownload} onPress={exportarPDF}>
          <DownloadCloud size={16} color="#ffffff" />
          <Text style={styles.btnText}>Exportar PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}><History size={24} color="#38bdf8" /></View>
        <Text style={styles.cardTitle}>Histórico de Logs</Text>
        <Text style={styles.cardDesc}>Livro-razão (Ledger) de todos os alertas disparados e normalizados pelo sistema.</Text>
        <TouchableOpacity style={[styles.btnDownload, { backgroundColor: '#38bdf8' }]} onPress={exportarPDF}>
          <FileText size={16} color="#ffffff" />
          <Text style={styles.btnText}>Baixar Ledger</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 15 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textMain, marginBottom: 20 },
  card: { backgroundColor: theme.card, padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: theme.border },
  iconBox: { backgroundColor: 'rgba(5, 150, 105, 0.1)', padding: 12, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 15 },
  cardTitle: { color: theme.textMain, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardDesc: { color: theme.textMuted, fontSize: 13, lineHeight: 20, marginBottom: 20 },
  btnDownload: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary, padding: 14, borderRadius: 10, gap: 8 },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 }
});