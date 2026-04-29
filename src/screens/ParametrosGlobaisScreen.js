import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function ParametrosGlobaisScreen({ navigation }) {
  const { listaSetores = [], listaTipos = [], isOffline } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 5 }}>
          <Ionicons name="menu" size={28} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parâmetros Globais</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        
        {/* SETORES */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="map-marker-outline" size={22} color="#059669" />
              <Text style={styles.cardTitle}>Divisões por Setor</Text>
            </View>
            <TouchableOpacity onPress={() => alert('Função criar setor')}><MaterialCommunityIcons name="plus-circle" size={24} color="#059669" /></TouchableOpacity>
          </View>
          {listaSetores.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum setor definido.</Text>
          ) : (
            listaSetores.map(s => (
              <View key={s.id} style={styles.parametroItem}>
                <Text style={styles.parametroName}>{s.nome}</Text>
                <MaterialCommunityIcons name="pencil" size={18} color="#3b82f6" />
              </View>
            ))
          )}
        </View>

        {/* REGRAS SLA */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="filter-variant" size={22} color="#38bdf8" />
              <Text style={styles.cardTitle}>Padrões Térmicos e SLAs</Text>
            </View>
            <TouchableOpacity onPress={() => alert('Função criar regra')}><MaterialCommunityIcons name="plus-circle" size={24} color="#059669" /></TouchableOpacity>
          </View>
          {listaTipos.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma regra definida.</Text>
          ) : (
            listaTipos.map(t => (
              <View key={t.id} style={styles.parametroItemBlock}>
                <View style={styles.parametroBlockHeader}>
                  <Text style={styles.parametroName}>{t.nome}</Text>
                  <MaterialCommunityIcons name="pencil" size={18} color="#3b82f6" />
                </View>
                <View style={styles.badgesRow}>
                  <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <MaterialCommunityIcons name="thermometer" size={12} color="#10b981" />
                    <Text style={[styles.badgeText, { color: '#10b981' }]}>{t.temp_min}°C a {t.temp_max}°C</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: 'rgba(56, 189, 248, 0.1)', borderColor: 'rgba(56, 189, 248, 0.2)' }]}>
                    <MaterialCommunityIcons name="water-percent" size={12} color="#38bdf8" />
                    <Text style={[styles.badgeText, { color: '#0ea5e9' }]}>{t.umidade_min}% a {t.umidade_max}%</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' }]}>
                    <MaterialCommunityIcons name="snowflake" size={12} color="#f59e0b" />
                    <Text style={[styles.badgeText, { color: '#f59e0b' }]}>Ciclo: {t.intervalo_degelo}h</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0', paddingTop: Platform.OS === 'ios' ? 50 : 15 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  listContainer: { padding: 15, paddingBottom: 40, gap: 20 },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderColor: '#f1f5f9', paddingBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  emptyText: { color: '#64748b', fontStyle: 'italic' },
  
  parametroItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  parametroItemBlock: { padding: 15, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 15 },
  parametroBlockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  parametroName: { fontSize: 15, fontWeight: '900', color: '#0f172a' },
  
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '800' }
});