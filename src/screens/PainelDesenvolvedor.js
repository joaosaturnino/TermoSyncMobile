import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Activity, Building2, Cpu, DollarSign, FileText, PieChart, Server, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PainelDesenvolvedor({ api, abaAtiva, isDevAuthenticated, showToast, sysConfig, filiaisDb }) {
  
  // Apenas renderiza se a aba ativa for a de BI
  if (abaAtiva !== 'dev_panel' && abaAtiva !== 'bi') {
    return null;
  }

  const [isCompiling, setIsCompiling] = useState(false);

  const gerarRelatorioPDF = async (tipo, tema, cor) => {
    setIsCompiling(true);
    // Usando Alert nativo caso a prop showToast não seja passada
    Alert.alert('Gerando', `Buscando matriz de dados reais para: ${tipo}...`);
    
    try {
      let colunasHtml = `<th>Métrica</th><th>Valor</th><th>Módulo</th>`;
      let linhasHtml = `<tr><td>Estrutura Base</td><td>Operando sob conformidade</td><td>SaaS Core</td></tr>`;

      // Estrutura HTML do PDF
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: 'Helvetica', sans-serif; background-color: #0f172a; color: #cbd5e1; padding: 20px; }
              .header { background-color: ${cor}; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              h1 { margin: 0; font-size: 20px; }
              h2 { margin: 5px 0 0 0; font-size: 14px; opacity: 0.8; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #1e293b; border-radius: 8px; overflow: hidden; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; font-size: 12px; }
              th { background-color: rgba(0,0,0,0.2); color: white; text-transform: uppercase; font-weight: bold; }
              tr:hover { background-color: rgba(255,255,255,0.02); }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>TERMOSYNC ENTERPRISE — RELATÓRIO EXECUTIVO</h1>
              <h2>${tema}</h2>
            </div>
            <p>Emitido em: ${new Date().toLocaleString()} | Classificação: CONFIDENCIAL / USO INTERNO</p>
            <table>
              <thead><tr>${colunasHtml}</tr></thead>
              <tbody>${linhasHtml}</tbody>
            </table>
          </body>
        </html>
      `;

      // Gera o PDF e abre a tela de compartilhamento nativa (WhatsApp, Email, etc)
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (Platform.OS !== 'web') {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (err) {
      Alert.alert('Erro Crítico', 'Falha na compilação analítica.');
      console.error(err);
    } finally {
      setIsCompiling(false);
    }
  };

  const modulosBI = [
    { id: 'FINOPS_BILLING', titulo: 'Core Financeiro (RevOps)', desc: 'Relação completa de faturamento, inadimplência e MRR por organização jurídica.', icon: DollarSign, color: '#10b981' },
    { id: 'AUDITORIA_SOC', titulo: 'Auditoria e Zero-Trust (SOC)', desc: 'Extrato imutável de transações críticas de login, purgas e revogações.', icon: ShieldCheck, color: '#a855f7' },
    { id: 'EDGE_HARDWARE', titulo: 'Inventário Edge Computing', desc: 'Mapeamento massivo da frota de microcontroladores.', icon: Server, color: '#38bdf8' },
    { id: 'CAOS_RESILIENCIA', titulo: 'Auditoria de Resiliência', desc: 'Análise de payloads injetados e tempo de resposta.', icon: Cpu, color: '#ef4444' },
    { id: 'ORGANIZACOES_TENANTS', titulo: 'Ecossistema de Organizações', desc: 'Lista unificada de tenants corporativos provisionados ativos na nuvem.', icon: Building2, color: '#f59e0b' },
    { id: 'SYSOPS_HEALTH', titulo: 'Saúde da Plataforma (SysOps)', desc: 'Logs vitais de conexões WebSockets abertas e volumetria.', icon: Activity, color: '#6366f1' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <PieChart size={24} color="#10b981" />
        <View style={styles.headerTextContainer}>
          <Text style={styles.cardTitle}>Centro de Inteligência & Analytics</Text>
          <Text style={styles.cardSubtitle}>Módulo Executivo Móvel de Extração Direta</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {modulosBI.map(mod => (
          <View key={mod.id} style={[styles.biCard, { borderTopColor: mod.color }]}>
            <View style={styles.biHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: `${mod.color}20` }]}>
                <mod.icon size={22} color={mod.color} />
              </View>
              <View style={styles.biTextContainer}>
                <Text style={styles.biTitle}>{mod.titulo}</Text>
                <Text style={styles.biDesc}>{mod.desc}</Text>
              </View>
            </View>
            <View style={styles.biActions}>
              <TouchableOpacity 
                style={[styles.btnBi, { backgroundColor: mod.color }]} 
                onPress={() => gerarRelatorioPDF(mod.id, mod.titulo, mod.color)}
                disabled={isCompiling}
              >
                <FileText size={14} color="#ffffff" />
                <Text style={styles.btnBiText}>Gerar PDF Real</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  headerTextContainer: { marginLeft: 12, flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#ffffff' },
  cardSubtitle: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  grid: { flexDirection: 'column', gap: 16 },
  biCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, borderTopWidth: 4, borderWidth: 1, borderColor: '#334155' },
  biHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrapper: { padding: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  biTextContainer: { marginLeft: 12, flex: 1 },
  biTitle: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
  biDesc: { fontSize: 11, color: '#94a3b8', marginTop: 4, lineHeight: 14 },
  biActions: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155' },
  btnBi: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 8 },
  btnBiText: { color: '#ffffff', fontSize: 12, fontWeight: '800' }
});