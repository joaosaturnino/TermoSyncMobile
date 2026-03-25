import { AlertTriangle, ClipboardCheck, PlusCircle, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api, theme } from '../api/api';

export default function EquipamentosScreen() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado do Formulário
  const [form, setForm] = useState({
    nome: '', filial: '', setor: '', tipo: '', temp_min: '', temp_max: '',
    umidade_min: '', umidade_max: '', intervalo_degelo: '6', duracao_degelo: '30'
  });

  useEffect(() => {
    carregarEquipamentos();
  }, []);

  const carregarEquipamentos = async () => {
    try {
      const res = await api.get('/equipamentos');
      setEquipamentos(res.data);
    } catch (error) {
      console.log('Erro ao carregar equipamentos', error);
    }
  };

  const salvarEquipamento = async () => {
    if (!form.nome || !form.filial || !form.tipo) {
      return Alert.alert('Atenção', 'Preencha os campos obrigatórios (Nome, Filial, Tipo).');
    }
    setLoading(true);
    try {
      await api.post('/equipamentos', form);
      Alert.alert('Sucesso', 'Equipamento registado com sucesso!');
      setForm({ nome: '', filial: '', setor: '', tipo: '', temp_min: '', temp_max: '', umidade_min: '', umidade_max: '', intervalo_degelo: '6', duracao_degelo: '30' });
      carregarEquipamentos();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao gravar equipamento.');
    } finally {
      setLoading(false);
    }
  };

  const deletarEquipamento = (id, nome) => {
    Alert.alert('Remover Máquina', `Remover "${nome}" permanentemente?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/equipamentos/${id}`);
            carregarEquipamentos();
          } catch (e) {
            Alert.alert('Erro', 'Ação não autorizada.');
          }
        } 
      }
    ]);
  };

  const renderFormulario = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <PlusCircle color={theme.primary} size={24} />
        <Text style={styles.formTitle}>Registo de Sensor IoT</Text>
      </View>
      
      <TextInput style={styles.input} placeholder="Identificador (Ex: Câmara de Carnes)" value={form.nome} onChangeText={(t) => setForm({...form, nome: t})} />
      <TextInput style={styles.input} placeholder="Filial (Ex: Loja Porto)" value={form.filial} onChangeText={(t) => setForm({...form, filial: t})} />
      <TextInput style={styles.input} placeholder="Setor (Ex: Açougue, Farmácia)" value={form.setor} onChangeText={(t) => setForm({...form, setor: t})} />
      <TextInput style={styles.input} placeholder="Tipo (Ex: Câmara Frigorífica)" value={form.tipo} onChangeText={(t) => setForm({...form, tipo: t})} />
      
      <View style={styles.row}>
        <TextInput style={[styles.input, styles.halfInput]} placeholder="Temp Min (°C)" keyboardType="numeric" value={form.temp_min} onChangeText={(t) => setForm({...form, temp_min: t})} />
        <TextInput style={[styles.input, styles.halfInput]} placeholder="Temp Max (°C)" keyboardType="numeric" value={form.temp_max} onChangeText={(t) => setForm({...form, temp_max: t})} />
      </View>

      <TouchableOpacity style={styles.btnSalvar} onPress={salvarEquipamento} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Adicionar Máquina</Text>}
      </TouchableOpacity>
      
      <Text style={styles.listTitle}>Parque Instalado</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    // Lógica simplificada de calibração para o mobile
    const diasCalib = item.data_calibracao ? Math.floor((Date.now() - new Date(item.data_calibracao).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const calibCritica = diasCalib > 365;

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.equipNome}>{item.nome}</Text>
          <Text style={styles.equipDetalhes}>{item.filial} | {item.tipo}</Text>
          
          <View style={styles.calibRow}>
            {calibCritica ? <AlertTriangle size={16} color={theme.danger} /> : <ClipboardCheck size={16} color={theme.success} />}
            <Text style={[styles.calibText, { color: calibCritica ? theme.danger : theme.success }]}>
              Certificado há {diasCalib} dias
            </Text>
          </View>
          
          <Text style={styles.limites}>
            Limites: {item.temp_min}°C a {item.temp_max}°C
          </Text>
        </View>

        <TouchableOpacity style={styles.btnDelete} onPress={() => deletarEquipamento(item.id, item.nome)}>
          <Trash2 color={theme.danger} size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={equipamentos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderFormulario}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  formContainer: { backgroundColor: theme.card, padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2 },
  formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textMain, marginLeft: 10 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: theme.bg, color: theme.textMain },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  btnSalvar: { backgroundColor: theme.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 5, marginBottom: 10 },
  btnSalvarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textMain, marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: theme.border, elevation: 1 },
  cardInfo: { flex: 1 },
  equipNome: { fontSize: 16, fontWeight: 'bold', color: theme.textMain },
  equipDetalhes: { fontSize: 12, color: theme.textMuted, marginBottom: 8 },
  calibRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  calibText: { fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
  limites: { fontSize: 12, color: theme.textMuted },
  btnDelete: { padding: 10, backgroundColor: '#fee2e2', borderRadius: 8 },
});