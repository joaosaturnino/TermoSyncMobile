import { Euro, Leaf, Percent } from 'lucide-react-native';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { api, theme } from '../api/api';
import { AppContext } from '../context/AppContext'; // Importação do contexto global

const screenWidth = Dimensions.get('window').width;
const CUSTO_KWH_EUROS = 0.16;
const FATOR_EMISSAO_CO2 = 0.25;

export default function RelatoriosScreen() {
  const { filialAtiva } = useContext(AppContext); // Ler a loja selecionada

  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const res = await api.get('/relatorios');
      setRelatorios(res.data);
    } catch (e) {
      console.log('Erro relatorios:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Filtragem dos dados ESG pela loja selecionada
  const relatoriosFiltrados = filialAtiva === 'Todas' 
    ? relatorios 
    : relatorios.filter(r => r.filial === filialAtiva);

  // Cálculos Básicos
  let somaKwh = 0;
  let leiturasNoLimite = 0;
  
  // Pegando as últimas 15 leituras da lista já filtrada para o gráfico
  const ultimasLeituras = relatoriosFiltrados.slice(-15);
  const labels = ultimasLeituras.map(r => new Date(r.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const dataTemp = ultimasLeituras.map(r => parseFloat(r.temperatura));
  const dataKwh = ultimasLeituras.map(r => parseFloat(r.consumo_kwh));

  // Processamento dos totais apenas para a filial atual
  relatoriosFiltrados.forEach(r => {
    somaKwh += parseFloat(r.consumo_kwh || 0);
    if (parseFloat(r.temperatura) >= 2 && parseFloat(r.temperatura) <= 8) {
      leiturasNoLimite++;
    }
  });

  const slaCompliance = relatoriosFiltrados.length > 0 ? ((leiturasNoLimite / relatoriosFiltrados.length) * 100).toFixed(1) : 0;
  const co2 = (somaKwh * FATOR_EMISSAO_CO2).toFixed(1);
  const custo = (somaKwh * CUSTO_KWH_EUROS).toFixed(2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      
      {/* Cartões ESG */}
      <View style={styles.esgCard}>
        <View style={styles.esgHeader}>
          <Leaf color={theme.success} size={24} />
          <Text style={styles.esgTitle}>Pegada de Carbono (CO2)</Text>
        </View>
        <Text style={[styles.esgValue, { color: theme.success }]}>{co2} <Text style={styles.esgUnit}>kg</Text></Text>
      </View>

      <View style={[styles.esgCard, { borderLeftColor: theme.warning }]}>
        <View style={styles.esgHeader}>
          <Euro color={theme.warning} size={24} />
          <Text style={styles.esgTitle}>Desperdício Energético</Text>
        </View>
        <Text style={[styles.esgValue, { color: theme.warning }]}>{custo} <Text style={styles.esgUnit}>€</Text></Text>
      </View>

      <View style={[styles.esgCard, { borderLeftColor: theme.primary }]}>
        <View style={styles.esgHeader}>
          <Percent color={theme.primary} size={24} />
          <Text style={styles.esgTitle}>Compliance SLA</Text>
        </View>
        <Text style={[styles.esgValue, { color: slaCompliance >= 90 ? theme.success : theme.danger }]}>{slaCompliance}%</Text>
      </View>

      {/* Gráfico */}
      <Text style={styles.chartTitle}>Termometria vs Consumo (Últimos Registos)</Text>
      <View style={styles.chartContainer}>
        {dataTemp.length > 0 ? (
          <LineChart
            data={{
              labels: labels.length > 0 ? labels : ['00:00'],
              datasets: [
                { data: dataTemp.length > 0 ? dataTemp : [0], color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`, strokeWidth: 2 },
                { data: dataKwh.length > 0 ? dataKwh : [0], color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, strokeWidth: 2 }
              ],
              legend: ["Temp (°C)", "Consumo (kWh)"]
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: theme.card,
              backgroundGradientFrom: theme.card,
              backgroundGradientTo: theme.card,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "4", strokeWidth: "2", stroke: theme.card }
            }}
            bezier
            style={{ borderRadius: 16, marginVertical: 8 }}
          />
        ) : (
          <Text style={{ textAlign: 'center', color: theme.textMuted, padding: 20 }}>Sem dados suficientes para a loja selecionada.</Text>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  esgCard: { backgroundColor: theme.card, padding: 20, borderRadius: 12, marginBottom: 16, borderLeftWidth: 5, borderLeftColor: theme.success, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  esgHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  esgTitle: { fontSize: 16, fontWeight: 'bold', color: theme.textMuted, marginLeft: 10 },
  esgValue: { fontSize: 36, fontWeight: '900' },
  esgUnit: { fontSize: 18, color: theme.textMuted, fontWeight: 'normal' },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textMain, marginTop: 10, marginBottom: 10 },
  chartContainer: { backgroundColor: theme.card, borderRadius: 16, paddingVertical: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, marginBottom: 30 }
});