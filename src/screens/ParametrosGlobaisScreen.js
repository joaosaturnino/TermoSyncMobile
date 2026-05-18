import axios from 'axios';
import { Layers, Thermometer } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', primary: '#059669' };

export default function ParametrosGlobaisScreen({ route }) {
  const { token } = route?.params || {};
  const [tipos, setTipos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const res = await axios.get('http://SEU_IP_LOCAL:3000/api/tipos-refrigeracao', { headers: { Authorization: `Bearer ${token}` } });
      setTipos(res.data);
    } catch (e) { console.log(e); }
  }, [token]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Parâmetros Core</Text>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await carregarDados(); setRefreshing(false); }} tintColor={theme.primary} />}>
        {tipos.map(t => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.nome}>{t.nome}</Text>
            <View style={styles.specRow}>
              <Thermometer size={14} color={theme.textMuted} />
              <Text style={styles.specText}>Faixa Térmica: {t.temp_min}°C a {t.temp_max}°C</Text>
            </View>
            <View style={styles.specRow}>
              <Layers size={14} color={theme.textMuted} />
              <Text style={styles.specText}>Ciclo Degelo: a cada {t.intervalo_degelo}h ({t.duracao_degelo} min)</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 15 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textMain, marginBottom: 15 },
  card: { backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  nome: { color: theme.textMain, fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  specRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  specText: { color: theme.textMuted, fontSize: 13 }
});