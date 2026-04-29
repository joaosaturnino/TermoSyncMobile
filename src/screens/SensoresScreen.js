import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useMemo, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function SensoresScreen({ route, navigation }) {
  const { isTemp } = route.params || { isTemp: true };
  const { equipamentos, filialAtiva } = useContext(AppContext);
  const [setorFiltro, setSetorFiltro] = useState('Todos');

  const equipamentosDaFilial = useMemo(() => {
    return filialAtiva === 'Todas' ? (equipamentos || []) : (equipamentos || []).filter(e => e.filial === filialAtiva);
  }, [equipamentos, filialAtiva]);

  const filtrados = setorFiltro === 'Todos' ? equipamentosDaFilial : equipamentosDaFilial.filter(eq => eq.setor === setorFiltro);
  const listaSetores = ['Todos', ...new Set(equipamentosDaFilial.map(e => e.setor).filter(Boolean))];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 5 }}>
          <Ionicons name="menu" size={28} color="#059669" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={[styles.iconCircle, { backgroundColor: isTemp ? '#059669' : '#0ea5e9' }]}>
            <MaterialCommunityIcons name={isTemp ? "thermometer" : "water-percent"} size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>{isTemp ? 'Cadeia de Frio' : 'Higrometria'}</Text>
            <Text style={styles.headerSub}>Tempo Real</Text>
          </View>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15, gap: 10 }}>
          {listaSetores.map((s, idx) => (
            <TouchableOpacity key={idx} style={[styles.filterBtn, setorFiltro === s && styles.filterBtnActive]} onPress={() => setSetorFiltro(s)}>
              <Text style={[styles.filterBtnText, setorFiltro === s && styles.filterBtnTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {filtrados.map(eq => {
          const valRaw = isTemp ? (eq.ultima_temp ?? eq.temperatura ?? null) : (eq.ultima_umidade ?? eq.umidade ?? null);
          const val = valRaw !== null ? parseFloat(valRaw) : null;
          
          const min = parseFloat(isTemp ? (eq.temp_min ?? -5) : (eq.umidade_min ?? 35));
          const max = parseFloat(isTemp ? (eq.temp_max ?? 15) : (eq.umidade_max ?? 85));
          
          const temDados = val !== null && val > 0.1;
          const isFora = temDados && (val < min || val > max);
          const statusCor = isFora ? '#ef4444' : (isTemp && eq.em_degelo ? '#0ea5e9' : '#059669');
          
          const range = max - min;
          const position = (temDados && range !== 0) ? Math.min(Math.max(((val - min) / range) * 100, 0), 100) : 0;

          return (
            <View key={eq.id} style={[styles.monitorCard, isFora && styles.borderDanger]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.equipName}>{eq.nome}</Text>
                  <Text style={styles.equipSub}>{eq.setor} • ID: #{eq.id}</Text>
                </View>
                {isTemp && (
                  <View style={[styles.statusPill, eq.em_degelo ? styles.pillDefrost : (eq.motor_ligado ? styles.pillOn : styles.pillOff)]}>
                    <MaterialCommunityIcons name={eq.em_degelo ? "snowflake" : "power"} size={12} color={eq.em_degelo ? '#0ea5e9' : (eq.motor_ligado ? '#10b981' : '#ef4444')} />
                    <Text style={[styles.pillText, {color: eq.em_degelo ? '#0ea5e9' : (eq.motor_ligado ? '#10b981' : '#ef4444')}]}>
                      {eq.em_degelo ? 'DEGELO' : (eq.motor_ligado ? 'ATIVO' : 'FALHA')}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.valueDisplay}>
                <Text style={styles.currentValue}>{temDados ? val.toFixed(1) : '--'}<Text style={styles.currentUnit}>{isTemp ? '°C' : '%'}</Text></Text>
                <MaterialCommunityIcons name={isFora ? "alert-octagon" : "gauge"} size={36} color={isFora ? "#ef4444" : (temDados ? "#059669" : "#cbd5e1")} style={{ opacity: isFora ? 1 : 0.3 }} />
              </View>

              <View style={styles.thermalContainer}>
                <View style={styles.thermalLimits}>
                  <Text style={styles.limitText}>MÍN: {min.toFixed(1)}{isTemp ? '°' : '%'}</Text>
                  <Text style={styles.limitText}>MÁX: {max.toFixed(1)}{isTemp ? '°' : '%'}</Text>
                </View>
                <View style={styles.thermalTrack}>
                  <View style={[styles.thermalPointer, { left: `${position}%`, borderColor: temDados ? statusCor : '#e2e8f0' }]} />
                </View>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.footerFilial}><MaterialCommunityIcons name="map-marker" size={14}/> {eq.filial || 'Local'}</Text>
                {!temDados ? (
                  <Text style={styles.footerAlertWait}>A AGUARDAR DADOS...</Text>
                ) : isFora && (
                  <Text style={styles.footerAlertDanger}>FORA DE PARÂMETROS</Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0', paddingTop: Platform.OS === 'ios' ? 50 : 15 },
  iconCircle: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  headerSub: { fontSize: 11, color: '#64748b', fontWeight: '700' },
  
  filtersContainer: { paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#059669', borderColor: '#059669' },
  filterBtnText: { color: '#64748b', fontWeight: 'bold', fontSize: 13 },
  filterBtnTextActive: { color: '#fff' },

  listContainer: { padding: 15, paddingBottom: 40 },
  
  monitorCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0', elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05 },
  borderDanger: { borderColor: '#ef4444', borderWidth: 2, backgroundColor: '#fef2f2' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  equipName: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  equipSub: { fontSize: 11, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  pillOn: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' },
  pillOff: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' },
  pillDefrost: { backgroundColor: 'rgba(14, 165, 233, 0.1)', borderColor: 'rgba(14, 165, 233, 0.2)' },
  pillText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  valueDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  currentValue: { fontSize: 38, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  currentUnit: { fontSize: 18, fontWeight: '700', color: '#64748b' },

  thermalContainer: { marginBottom: 15 },
  thermalLimits: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  limitText: { fontSize: 11, fontWeight: '800', color: '#64748b' },
  thermalTrack: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, position: 'relative' },
  thermalPointer: { position: 'absolute', top: -5, width: 18, height: 18, backgroundColor: '#fff', borderRadius: 9, borderWidth: 4, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width:0, height:2} },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderColor: '#e2e8f0' },
  footerFilial: { fontSize: 12, color: '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center' },
  footerAlertWait: { fontSize: 10, color: '#f59e0b', fontWeight: '900', letterSpacing: 0.5 },
  footerAlertDanger: { fontSize: 10, color: '#ef4444', fontWeight: '900', letterSpacing: 0.5 }
});