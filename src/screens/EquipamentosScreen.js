import axios from 'axios';
import { Edit, MapPin, PlusCircle, Server, Thermometer, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', primary: '#059669', danger: '#ef4444' };

export default function EquipamentosScreen({ route }) {
  const { token } = route?.params || {};
  const [equipamentos, setEquipamentos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarEquipamentos = useCallback(async () => {
    try {
      const res = await axios.get('http://SEU_IP_LOCAL:3000/api/equipamentos', { headers: { Authorization: `Bearer ${token}` } });
      setEquipamentos(res.data);
    } catch (e) { Alert.alert('Erro', 'Falha ao carregar a frota IoT.'); }
  }, [token]);

  useEffect(() => { carregarEquipamentos(); }, [carregarEquipamentos]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarEquipamentos();
    setRefreshing(false);
  };

  const confirmarExclusao = (id, nome) => {
    Alert.alert('Remover Máquina', `Deseja excluir o equipamento "${nome}" permanentemente?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await axios.delete(`http://SEU_IP_LOCAL:3000/api/equipamentos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            carregarEquipamentos();
          } catch (e) { Alert.alert('Erro', 'Falha na exclusão.'); }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão de Equipamentos</Text>
        <TouchableOpacity style={styles.btnAdd}>
          <PlusCircle size={20} color="#ffffff" />
          <Text style={styles.btnAddText}>Novo Nó IoT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}>
        {equipamentos.map(eq => (
          <View key={eq.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconBox}><Server size={20} color={theme.primary} /></View>
              <View style={styles.infoBox}>
                <Text style={styles.eqName}>{eq.nome}</Text>
                <Text style={styles.eqFilial}><MapPin size={12} color={theme.textMuted}/> {eq.filial || 'Matriz'}</Text>
              </View>
            </View>
            
            <View style={styles.specsRow}>
              <View style={styles.specBadge}><Thermometer size={12} color={theme.textMuted}/> <Text style={styles.specText}>Min: {eq.temp_min}°C</Text></View>
              <View style={styles.specBadge}><Thermometer size={12} color={theme.textMuted}/> <Text style={styles.specText}>Max: {eq.temp_max}°C</Text></View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.btnAction, { borderColor: theme.primary }]}><Edit size={16} color={theme.primary} /></TouchableOpacity>
              <TouchableOpacity style={[styles.btnAction, { borderColor: theme.danger }]} onPress={() => confirmarExclusao(eq.id, eq.nome)}><Trash2 size={16} color={theme.danger} /></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.textMain },
  btnAdd: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  btnAddText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  card: { backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: theme.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { backgroundColor: 'rgba(5, 150, 105, 0.1)', padding: 10, borderRadius: 8, marginRight: 12 },
  infoBox: { flex: 1 },
  eqName: { color: theme.textMain, fontSize: 16, fontWeight: 'bold' },
  eqFilial: { color: theme.textMuted, fontSize: 12, marginTop: 4 },
  specsRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  specBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, gap: 4 },
  specText: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 15 },
  btnAction: { padding: 8, borderRadius: 6, borderWidth: 1 }
});