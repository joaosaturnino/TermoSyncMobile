import axios from 'axios';
import { AlertOctagon, Cpu } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', primary: '#059669', danger: '#ef4444' };

export default function SimuladorScreen({ route }) {
  const { token } = route?.params || {};
  const [isEnviando, setIsEnviando] = useState(false);

  const injetarAnomalia = async (tipo) => {
    setIsEnviando(true);
    try {
      await axios.post('http://SEU_IP_LOCAL:3000/api/leituras', {
        equipamento_id: 1, // ID Fixo para teste ou pode criar um Picker
        temperatura: tipo === 'TEMPERATURA' ? '25.0' : '5.0',
        umidade: '60',
        alerta_forcado: tipo,
        motor_ligado: tipo !== 'MECANICA',
        em_degelo: tipo === 'DEGELO'
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      Alert.alert('Sucesso', `Payload de Caos [${tipo}] inejtado com sucesso.`);
    } catch (err) {
      Alert.alert('Erro', 'Falha na injeção de dados.');
    } finally {
      setIsEnviando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardCaos}>
        <Cpu size={32} color={theme.danger} style={{ marginBottom: 10 }} />
        <Text style={styles.title}>Motor de Engenharia do Caos</Text>
        <Text style={styles.subtitle}>Injete payloads corrompidos para testar a resiliência do sistema e do SLA.</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.btnCaos} onPress={() => injetarAnomalia('PORTA_ABERTA')} disabled={isEnviando}>
          <AlertOctagon size={20} color={theme.danger} />
          <Text style={styles.btnText}>Forçar Abertura de Porta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCaos} onPress={() => injetarAnomalia('MECANICA')} disabled={isEnviando}>
          <AlertOctagon size={20} color={theme.warning} />
          <Text style={[styles.btnText, { color: theme.warning }]}>Simular Paragem do Motor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCaos} onPress={() => injetarAnomalia('REDE')} disabled={isEnviando}>
          <AlertOctagon size={20} color={theme.textMuted} />
          <Text style={[styles.btnText, { color: theme.textMuted }]}>Simular Queda de Conectividade</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 15 },
  cardCaos: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', alignItems: 'center', marginBottom: 25 },
  title: { color: theme.danger, fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  subtitle: { color: theme.textMain, fontSize: 12, textAlign: 'center', marginTop: 10, lineHeight: 18 },
  grid: { gap: 15 },
  btnCaos: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
  btnText: { color: theme.danger, fontWeight: 'bold', fontSize: 14 }
});