import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function EquipamentosScreen({ navigation }) {
  const { equipamentos, userRole, filialAtiva, isOffline, api, carregarDashboard, filiaisDb } = useContext(AppContext);
  
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formEquip, setFormEquip] = useState({ nome: '', temp_min: '0', temp_max: '8', umidade_min: '60', umidade_max: '85', intervalo_degelo: '6', filial: filialAtiva });

  const equipamentosDaFilial = filialAtiva === 'Todas' ? (equipamentos || []) : (equipamentos || []).filter(eq => eq.filial === filialAtiva);

  const aplicarNormaANVISA = () => {
    setFormEquip(prev => ({ ...prev, temp_min: '2', temp_max: '8', umidade_min: '60', umidade_max: '85', intervalo_degelo: '6' }));
    alert("Padrão Legal (ANVISA) para Frios/Vacinas aplicado!");
  };

  const salvarNovoEquipamento = async () => {
    if (isOffline) return alert('Ação bloqueada offline.');
    if (!formEquip.nome) return alert('Preencha o nome do equipamento.');
    try {
      await api.post('/equipamentos', formEquip);
      setMostrarForm(false);
      carregarDashboard();
      alert('Equipamento salvo!');
    } catch (e) { alert('Erro ao salvar equipamento.'); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 5 }}>
          <Ionicons name="menu" size={28} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Central de Máquinas</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        
        <View style={styles.equipamentosHeader}>
          <TouchableOpacity style={styles.btnNewEquip} onPress={() => setMostrarForm(!mostrarForm)}>
            <MaterialCommunityIcons name={mostrarForm ? "close" : "plus-circle"} size={20} color="#fff" />
            <Text style={styles.btnNewEquipText}>{mostrarForm ? 'Cancelar' : 'Novo Equipamento'}</Text>
          </TouchableOpacity>
        </View>

        {mostrarForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeaderLine}>
              <Text style={styles.formTitle}>Registar Ativo IoT</Text>
              <TouchableOpacity style={styles.btnAnvisa} onPress={aplicarNormaANVISA}>
                <MaterialCommunityIcons name="shield-check" size={16} color="#38bdf8" />
                <Text style={styles.btnAnvisaText}>Norma ANVISA</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Identificador da Máquina" value={formEquip.nome} onChangeText={t => setFormEquip({...formEquip, nome: t})} />
            
            <View style={styles.grid2Cols}>
              <TextInput style={styles.input} placeholder="Temp Mín (°C)" keyboardType="numeric" value={formEquip.temp_min} onChangeText={t => setFormEquip({...formEquip, temp_min: t})} />
              <TextInput style={styles.input} placeholder="Temp Máx (°C)" keyboardType="numeric" value={formEquip.temp_max} onChangeText={t => setFormEquip({...formEquip, temp_max: t})} />
            </View>

            <TouchableOpacity style={styles.btnSave} onPress={salvarNovoEquipamento}>
              <Text style={styles.btnSaveText}>Salvar no Sistema</Text>
            </TouchableOpacity>
          </View>
        )}

        {equipamentosDaFilial.map(eq => {
          const calibracaoVencida = new Date(eq.data_calibracao) < new Date();
          const ringColor = !eq.motor_ligado ? '#ef4444' : (eq.em_degelo ? '#38bdf8' : '#10b981');
          
          return (
            <View key={eq.id} style={styles.equipCard}>
              <View style={styles.equipHeader}>
                <View style={styles.equipTitleBox}>
                  <View style={[styles.statusRing, { backgroundColor: ringColor, shadowColor: ringColor }]} />
                  <View>
                    <Text style={styles.equipName}>{eq.nome}</Text>
                    <Text style={styles.equipSubtitle}>{eq.filial} • {eq.setor || 'Geral'}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.btnEdit} disabled={isOffline}>
                  <MaterialCommunityIcons name="pencil" size={18} color="#3b82f6" />
                </TouchableOpacity>
              </View>

              <View style={styles.limitsBox}>
                <View style={styles.limitTag}>
                  <MaterialCommunityIcons name="thermometer" size={14} color="#ef4444" />
                  <Text style={styles.limitText}>{eq.temp_min}°C a {eq.temp_max}°C</Text>
                </View>
                <View style={styles.limitTag}>
                  <MaterialCommunityIcons name="water-percent" size={14} color="#38bdf8" />
                  <Text style={styles.limitText}>{eq.umidade_min || 40}% a {eq.umidade_max || 80}%</Text>
                </View>
              </View>

              <View style={[styles.calibBadge, calibracaoVencida ? styles.calibCritical : styles.calibOk]}>
                <MaterialCommunityIcons name={calibracaoVencida ? "alert-circle" : "check-decagram"} size={16} color={calibracaoVencida ? "#ef4444" : "#10b981"} />
                <Text style={[styles.calibText, calibracaoVencida ? {color: '#ef4444'} : {color: '#10b981'}]}>
                  Calibração: {eq.data_calibracao ? new Date(eq.data_calibracao).toLocaleDateString() : 'Pendente'}
                </Text>
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
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  listContainer: { padding: 15, paddingBottom: 40 },
  
  equipamentosHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 15 },
  btnNewEquip: { backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, gap: 8, elevation: 2 },
  btnNewEquipText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  formCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', elevation: 3 },
  formHeaderLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  formTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  btnAnvisa: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  btnAnvisaText: { color: '#38bdf8', fontWeight: '800', fontSize: 12 },
  input: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 12, color: '#0f172a', fontWeight: '600' },
  grid2Cols: { flexDirection: 'row', gap: 10 },
  btnSave: { backgroundColor: '#059669', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnSaveText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  
  equipCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, borderWidth: 1, borderColor: '#f1f5f9' },
  equipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  equipTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusRing: { width: 12, height: 12, borderRadius: 6, elevation: 4 },
  equipName: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  equipSubtitle: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginTop: 2 },
  btnEdit: { backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: 8, borderRadius: 8 },
  
  limitsBox: { flexDirection: 'row', gap: 10, marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  limitTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  limitText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  
  calibBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
  calibOk: { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)' },
  calibCritical: { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' },
  calibText: { fontSize: 12, fontWeight: '800' }
});