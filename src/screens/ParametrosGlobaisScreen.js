import { Droplets, Edit, LayoutGrid, ShieldCheck, Sliders, Snowflake, Thermometer } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const theme = {
  bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8',
  border: '#1e293b', primary: '#059669', info: '#38bdf8', success: '#10b981', danger: '#ef4444'
};

export default function ParametrosGlobaisScreen() {
  const [aba, setAba] = useState('TIPOS'); // SETORES ou TIPOS

  const setores = [{ id: 1, nome: 'Laticínios' }, { id: 2, nome: 'Congelados' }];
  const tipos = [{ id: 1, nome: 'Ilha Congelados', temp_min: -20, temp_max: -15, hr_min: 40, hr_max: 60, degelo_int: 8, degelo_dur: 30 }];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}><Sliders size={20} color={theme.info} /></View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>Políticas & SLA</Text>
          <Text style={styles.subtitle}>Matrizes RDC e Topologias</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, aba === 'TIPOS' && styles.tabActive]} onPress={() => setAba('TIPOS')}>
          <ShieldCheck size={16} color={aba === 'TIPOS' ? 'white' : theme.textMuted} />
          <Text style={[styles.tabText, aba === 'TIPOS' && styles.tabTextActive]}>Matrizes SLA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, aba === 'SETORES' && styles.tabActive]} onPress={() => setAba('SETORES')}>
          <LayoutGrid size={16} color={aba === 'SETORES' ? 'white' : theme.textMuted} />
          <Text style={[styles.tabText, aba === 'SETORES' && styles.tabTextActive]}>Topologia de Zonas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {aba === 'SETORES' ? (
          setores.map(s => (
            <View key={s.id} style={styles.zoneCard}>
              <View><Text style={styles.zoneName}>{s.nome}</Text><Text style={styles.zoneId}>ID: ZN-{s.id}</Text></View>
              <TouchableOpacity style={styles.btnEdit}><Edit size={16} color={theme.textMuted}/></TouchableOpacity>
            </View>
          ))
        ) : (
          tipos.map(t => (
            <View key={t.id} style={styles.slaCard}>
              <View style={styles.slaHeader}>
                <Text style={styles.slaName}>{t.nome}</Text>
                <TouchableOpacity style={styles.btnEdit}><Edit size={16} color={theme.textMuted}/></TouchableOpacity>
              </View>
              <View style={styles.limitsGrid}>
                <View style={[styles.limitTag, { borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.05)' }]}>
                  <Thermometer size={12} color={theme.danger} /><Text style={styles.limitText}>{t.temp_min}°C a {t.temp_max}°C</Text>
                </View>
                <View style={[styles.limitTag, { borderColor: 'rgba(56,189,248,0.3)', backgroundColor: 'rgba(56,189,248,0.05)' }]}>
                  <Droplets size={12} color={theme.info} /><Text style={styles.limitText}>{t.hr_min}% a {t.hr_max}%</Text>
                </View>
                <View style={[styles.limitTag, { borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.05)' }]}>
                  <Snowflake size={12} color={theme.success} /><Text style={styles.limitText}>Ciclo: {t.degelo_int}h ({t.degelo_dur}m)</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  iconCircle: { padding: 10, backgroundColor: 'rgba(56, 189, 248, 0.15)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  title: { color: theme.textMain, fontSize: 18, fontWeight: '900' },
  subtitle: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
  tabs: { flexDirection: 'row', padding: 15, gap: 10 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card },
  tabActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  tabText: { color: theme.textMuted, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: 'white' },
  content: { padding: 15, paddingBottom: 40 },
  
  zoneCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.card, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 10 },
  zoneName: { color: theme.textMain, fontSize: 15, fontWeight: '800' },
  zoneId: { color: theme.textMuted, fontSize: 10, fontFamily: 'monospace', marginTop: 4 },
  
  slaCard: { backgroundColor: theme.card, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.border, borderTopWidth: 4, borderTopColor: theme.success, marginBottom: 15 },
  slaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  slaName: { color: theme.textMain, fontSize: 16, fontWeight: '800' },
  btnEdit: { padding: 8, backgroundColor: theme.bg, borderRadius: 8, borderWidth: 1, borderColor: theme.border },
  limitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  limitTag: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  limitText: { color: theme.textMain, fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' }
});