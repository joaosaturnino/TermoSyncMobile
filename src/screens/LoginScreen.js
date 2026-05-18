import axios from 'axios';
import { Lock, ShieldCheck, User } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Supondo que você tenha um AppContext para gerenciar o token:
// import { AppContext } from '../context/AppContext';

const theme = { bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#1e293b', primary: '#10b981' };

export default function LoginScreen({ navigation }) {
  // const { setToken, setUserId } = useContext(AppContext);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fazerLogin = async () => {
    if (!usuario || !senha) return Alert.alert('Erro', 'Preencha todos os campos.');
    setIsLoading(true);
    try {
      // Substitua pelo IP da sua máquina
      const res = await axios.post('http://SEU_IP_LOCAL:3000/api/login', { usuario, senha });
      Alert.alert('Acesso Liberado', `Bem-vindo(a), ${res.data.nome_tecnico || usuario}`);
      // setToken(res.data.token);
      // setUserId(res.data.id);
    } catch (e) {
      Alert.alert('Acesso Negado', 'Credenciais inválidas ou conta suspensa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <View style={styles.logoContainer}>
          <ShieldCheck size={72} color={theme.primary} />
          <Text style={styles.title}>TermoSync NOC</Text>
          <Text style={styles.subtitle}>Acesso Mobile Tático</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputBox}>
            <User size={20} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} placeholder="Nome de Usuário" placeholderTextColor={theme.textMuted}
              value={usuario} onChangeText={setUsuario} autoCapitalize="none"
            />
          </View>

          <View style={styles.inputBox}>
            <Lock size={20} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} placeholder="Senha de Acesso" placeholderTextColor={theme.textMuted}
              value={senha} onChangeText={setSenha} secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={fazerLogin} disabled={isLoading}>
            <Text style={styles.btnPrimaryText}>{isLoading ? 'VERIFICANDO...' : 'AUTENTICAR'}</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { flex: 1, justifyContent: 'center', padding: 25 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: theme.textMain, marginTop: 15 },
  subtitle: { fontSize: 14, color: theme.textMuted, marginTop: 5, textTransform: 'uppercase', letterSpacing: 1 },
  formContainer: { backgroundColor: theme.card, padding: 25, borderRadius: 20, borderWidth: 1, borderColor: theme.border },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: theme.textMain, paddingVertical: 15, fontSize: 16 },
  btnPrimary: { backgroundColor: theme.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnPrimaryText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});