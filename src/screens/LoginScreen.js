import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity } from 'lucide-react-native';
import { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../api/api';
import { AppContext } from '../context/AppContext';

export default function LoginScreen({ onLogin }) {
  const { theme } = useContext(AppContext);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const fazerLogin = async () => {
    if (!usuario || !senha) return Alert.alert('Aviso', 'Preencha todos os campos.');
    setLoading(true);
    
    try {
      const res = await api.post('/api/login', { usuario, senha });
      
      // Guarda os dados
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userRole', res.data.role);
      await AsyncStorage.setItem('userFilial', res.data.filial);
      
      // Passa para a próxima tela
      onLogin(res.data);
      
    } catch (error) {
      if (error.response) {
        Alert.alert('Falha na Autenticação', error.response.data.error || 'Credenciais incorretas.');
      } else {
        // 🔴 MODO DETETIVE ATIVADO: Vai mostrar o URL exato e o erro técnico
        Alert.alert(
          'Detalhes do Erro de Rede', 
          `Tentou ligar a: ${api.defaults.baseURL}/api/login\n\nErro interno: ${error.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <View style={[styles.box, { backgroundColor: theme.card }]}>
        <View style={styles.logoContainer}>
          <Activity color={theme.primary} size={48} />
        </View>
        <Text style={[styles.title, { color: theme.primary }]}>TermoSync</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Corporate Platform ESG</Text>

        <Text style={[styles.label, { color: theme.textMain }]}>Credencial / Loja</Text>
        <TextInput 
          style={[styles.input, { borderColor: theme.border, backgroundColor: theme.bg, color: theme.textMain }]} 
          placeholder="admin ou gestor_porto"
          placeholderTextColor={theme.textMuted}
          value={usuario} 
          onChangeText={setUsuario} 
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: theme.textMain }]}>Palavra-passe</Text>
        <TextInput 
          style={[styles.input, { borderColor: theme.border, backgroundColor: theme.bg, color: theme.textMain }]} 
          placeholder="••••••••"
          placeholderTextColor={theme.textMuted}
          secureTextEntry
          value={senha} 
          onChangeText={setSenha} 
        />

        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={fazerLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'A Autenticar...' : 'Autenticar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  box: { padding: 30, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  logoContainer: { backgroundColor: '#f0fdf4', padding: 15, borderRadius: 50, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14, marginBottom: 30 },
  label: { alignSelf: 'flex-start', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  input: { width: '100%', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15 },
  btn: { width: '100%', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});