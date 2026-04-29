import { Edit, MapPin, Store } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', primary: '#059669' };

export default function LojasScreen() {
  const lojas = [{ id: 1, nome: 'Loja Centro' }, { id: 2, nome: 'Loja Norte' }];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <View style={styles.iconCircle}><Store size={24} color={theme.primary} /></View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>Rede de Filiais</Text>
          <Text style={styles.subtitle}>Gestão de Nós da Infraestrutura</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {lojas.map(loja => (
          <View key={loja.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <MapPin size={18} color={theme.primary} />
              <Text style={styles.cardTitle}>{loja.nome}</Text>
            </View>
            <TouchableOpacity style={styles.btnAction}><Edit size={16} color={theme.textMuted}/></TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  headerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, padding: 15, borderBottomWidth: 1, borderBottomColor: theme.border },
  iconCircle: { padding: 10, backgroundColor: 'rgba(5, 150, 105, 0.15)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(5, 150, 105, 0.3)' },
  title: { color: theme.textMain, fontSize: 18, fontWeight: '900' },
  subtitle: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
  content: { padding: 15 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.card, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { color: theme.textMain, fontSize: 16, fontWeight: '800' },
  btnAction: { padding: 8, backgroundColor: theme.bg, borderRadius: 8, borderWidth: 1, borderColor: theme.border }
});