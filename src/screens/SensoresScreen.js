import {
  Activity,
  Clock,
  Droplets,
  Filter,
  Wifi
} from 'lucide-react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { api } from '../api/api';
import { AppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

/**
 * SensorCard Humidade: Fiel ao layout Web para Higrometria
 * Cores baseadas no token --info (#38bdf8) do App.css
 */
const SensorCard = React.memo(({ eq, theme }) => {
  const valor = eq.ultima_umidade;
  const min = parseFloat(eq.umidade_min || 40);
  const max = parseFloat(eq.umidade_max || 80);
  
  // Lógica de Alerta Higrométrico idêntica ao server.js
  const isAlta = valor > max;
  const isBaixa = valor < min;
  const isAnomalia = (isAlta || isBaixa) && !eq.em_degelo;
  
  // Cálculo da barra de humidade (normalizado entre 5% e 100%)
  let percent = ((valor - min) / (max - min)) * 100;
  percent = Math.min(Math.max(percent, 5), 100);

  // No modo Humidade, a cor padrão é o Azul Info (#38bdf8)
  const statusColor = isAnomalia ? '#f59e0b' : '#38bdf8'; 

  return (
    <View style={[
      styles.card, 
      { backgroundColor: theme.card, borderColor: isAnomalia ? '#f59e0b' : theme.border },
      isAnomalia && styles.cardWarningBorder
    ]}>
      
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.badgeSetor, { backgroundColor: theme.bg, color: theme.textMuted }]}>
            {String(eq.filial).toUpperCase()} | {String(eq.setor).toUpperCase()}
          </Text>
          <Text style={[styles.cardTitle, { color: theme.textMain }]}>{eq.nome}</Text>
        </View>
      </View>

      <View style={[styles.statusBox, { backgroundColor: statusColor }]}>
        <View style={styles.statusInfo}>
          <View style={styles.statusRow}>
            <Droplets color="#fff" size={16} />
            <Text style={styles.statusText}>
              {isAlta ? 'HUMIDADE CRÍTICA' : (isBaixa ? 'AR SECO' : 'HIGROMETRIA OK')}
            </Text>
          </View>
          
          <Text style={styles.limitesText}>
            ALVO: {min}% a {max}% UR
          </Text>
          
          <View style={styles.thermalBarBg}>
            <View style={[styles.thermalBarFill, { width: `${percent}%`, backgroundColor: '#fff' }]} />
          </View>
        </View>

        <View style={styles.tempDisplay}>
          <Text style={styles.sensorLabel}>Humidade</Text>
          <Text style={styles.sensorValue}>
            {valor !== null ? `${valor}%` : '--'}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Clock size={12} color={theme.textMuted} />
          <Text style={[styles.footerText, { color: theme.textMuted }]}> Sensor DHT22</Text>
        </View>
        <View style={styles.footerItem}>
          <Activity size={12} color={isAnomalia ? '#f59e0b' : '#10b981'} />
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            {isAnomalia ? ' Fora do Padrão' : ' Estável'}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default function MonitorizacaoHumidade() {
  const { filialAtiva, theme } = useContext(AppContext);
  const [equipamentos, setEquipamentos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setorSelecionado, setSetorSelecionado] = useState('Todos');

  const setoresDisponiveis = ['Todos', 'Farmácia / Vacinas', 'Açougue', 'Padaria', 'Frios', 'FLV'];

  const carregarDados = useCallback(async () => {
    try {
      const res = await api.get('/equipamentos');
      setEquipamentos(res.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 5000); 
    return () => clearInterval(interval);
  }, [carregarDados]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  // Filtro fiel à Web: Filial + Setor + Apenas quem tem sensor de humidade
  const filtrados = equipamentos.filter(eq => {
    const temSensorHum = eq.umidade_max !== null; 
    const matchFilial = filialAtiva === 'Todas' || eq.filial === filialAtiva;
    const matchSetor = setorSelecionado === 'Todos' || eq.setor === setorSelecionado;
    return temSensorHum && matchFilial && matchSetor;
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Seletor de Setor - Cópia da Web */}
      <View style={[styles.filterContainer, { borderBottomColor: theme.border }]}>
        <View style={styles.filterHeader}>
          <Filter size={16} color="#38bdf8" />
          <Text style={[styles.filterLabel, { color: theme.textMain }]}>Setores Higrométricos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {setoresDisponiveis.map((setor) => (
            <TouchableOpacity 
              key={setor} 
              onPress={() => setSetorSelecionado(setor)}
              style={[
                styles.chip, 
                { backgroundColor: theme.card, borderColor: theme.border },
                setorSelecionado === setor && { backgroundColor: '#38bdf8', borderColor: '#38bdf8' }
              ]}
            >
              <Text style={[
                styles.chipText, 
                { color: theme.textMuted },
                setorSelecionado === setor && { color: '#fff' }
              ]}>
                {setor}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <SensorCard eq={item} theme={theme} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#38bdf8']} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Wifi size={48} color={theme.border} />
            <Text style={{ color: theme.textMuted, marginTop: 10 }}>Nenhum sensor de humidade nesta unidade.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterContainer: { paddingVertical: 12, borderBottomWidth: 1 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  filterLabel: { fontSize: 13, fontWeight: '700', marginLeft: 6, textTransform: 'uppercase' },
  chipScroll: { paddingHorizontal: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, elevation: 4 },
  cardWarningBorder: { borderLeftWidth: 8, borderLeftColor: '#f59e0b' },
  cardHeader: { marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  badgeSetor: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 10, fontWeight: '900' },
  statusBox: { flexDirection: 'row', borderRadius: 12, padding: 15, alignItems: 'center' },
  statusInfo: { flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statusText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 11 },
  limitesText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700', marginBottom: 12 },
  thermalBarBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 5, overflow: 'hidden' },
  thermalBarFill: { height: '100%', borderRadius: 5 },
  tempDisplay: { paddingLeft: 15, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)', minWidth: 90 },
  sensorLabel: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  sensorValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  cardFooter: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 8, justifyContent: 'space-between' },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 11, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 60 }
});