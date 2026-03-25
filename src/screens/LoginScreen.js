import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api, theme } from '../api/api';

export default function LoginScreen({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const fazerLogin = async () => {
    if (!usuario || !senha) return Alert.alert('Erro', 'Preencha os campos');
    setLoading(true);
    try {
      const res = await api.post('/login', { usuario, senha });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userRole', res.data.role);
      await AsyncStorage.setItem('userFilial', res.data.filial);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      onLogin(res.data);
    } catch (error) {
      // Aqui está o truque para saber o erro real:
      if (error.response) {
        // O servidor respondeu (Erro 401 - Senha errada mesmo)
        Alert.alert('Falha no Login', error.response.data.error || 'Credenciais incorretas.');
      } else {
        // O servidor nem sequer foi encontrado (Erro de Rede / IP errado)
        Alert.alert(
          'Servidor Inacessível', 
          'Não foi possível conectar ao backend. Verifique se o IP em api.js está correto e se o PC e o Telemóvel estão no mesmo Wi-Fi.'
        );
        console.log('Erro detalhado:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <View style={styles.logoContainer}>
          <Activity color={theme.primary} size={48} />
        </View>
        <Text style={styles.title}>TermoSync</Text>
        <Text style={styles.subtitle}>Corporate Platform ESG</Text>

        <Text style={styles.label}>Credencial / Loja</Text>
        <TextInput 
          style={styles.input} 
          placeholder="admin ou gestor_porto"
          value={usuario} 
          onChangeText={setUsuario} 
          autoCapitalize="none"
        />

        <Text style={styles.label}>Palavra-passe</Text>
        <TextInput 
          style={styles.input} 
          placeholder="••••••••"
          secureTextEntry
          value={senha} 
          onChangeText={setSenha} 
        />

        <TouchableOpacity style={styles.btn} onPress={fazerLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Autenticando...' : 'Autenticar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.primary, justifyContent: 'center', padding: 20 },
  box: { backgroundColor: theme.card, padding: 30, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  logoContainer: { backgroundColor: '#f0fdf4', padding: 15, borderRadius: 50, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.primary, marginBottom: 5 },
  subtitle: { fontSize: 14, color: theme.textMuted, marginBottom: 30 },
  label: { alignSelf: 'flex-start', fontSize: 12, fontWeight: 'bold', color: theme.textMain, marginBottom: 5 },
  input: { width: '100%', borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: theme.bg },
  btn: { backgroundColor: theme.primary, width: '100%', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});