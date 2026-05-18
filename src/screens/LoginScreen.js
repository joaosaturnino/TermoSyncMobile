import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Lock, ShieldCheck, User } from 'lucide-react-native';
import { useContext, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView, Platform,
  SafeAreaView, StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { AppContext } from '../context/AppContext';

export default function LoginScreen() {
  // Puxando o contexto global da aplicação
  const contexto = useContext(AppContext);

  // Fallback visual se o contexto ainda estiver carregando
  if (!contexto) return null;

  const { 
    setToken, setUserId, setUserRole, setUserFilial, 
    setNomeLogado, setPapelLogado, theme 
  } = contexto;

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fazerLogin = async () => {
    if (!usuario || !senha) {
      return Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
    }
    
    setIsLoading(true);

    // Utilizando o seu IP local configurado no AppContext
    const API_URL = 'http://192.168.56.1:3000/api';
    
    try {
      const res = await axios.post(`${API_URL}/login`, { usuario, senha });
      
      const { token, id, role, filial, nome_tecnico, nome_gerente, nome_coordenador } = res.data;
      
      // Definição da identidade baseada na resposta da API
      let nomeIdentity = usuario;
      let papelIdentity = 'Equipe Geral';

      if (role === 'DEV') { nomeIdentity = 'Desenvolvedor'; papelIdentity = 'SysAdmin / Root'; }
      else if (role === 'ADMIN') { nomeIdentity = 'Administrador'; papelIdentity = 'Acesso Master'; }
      else if (role === 'MANUTENCAO') { nomeIdentity = nome_tecnico || 'Técnico'; papelIdentity = 'Manutenção Global'; }
      else if (role === 'LOJA') { 
        if (nome_gerente) { nomeIdentity = nome_gerente; papelIdentity = 'Gerente da Loja'; }
        else if (nome_coordenador) { nomeIdentity = nome_coordenador; papelIdentity = 'Coordenador'; }
      }

      // 1. Salvar localmente para manter a sessão ao reiniciar o App (Persistência)
      await AsyncStorage.multiSet([
        ['token', token],
        ['userId', String(id)],
        ['userRole', role],
        ['userFilial', filial || 'Todas'],
        ['nomeLogado', nomeIdentity],
        ['papelLogado', papelIdentity]
      ]);

      // 2. Atualizar o estado global (Isto fará o RootNavigator mudar para o DrawerNavigator imediatamente)
      setUserId(String(id));
      setUserRole(role);
      setUserFilial(filial || 'Todas');
      setNomeLogado(nomeIdentity);
      setPapelLogado(papelIdentity);
      setToken(token); 

    } catch (e) {
      console.log('Erro de login:', e);
      if (!e.response) {
         Alert.alert('Falha de Rede', 'Não foi possível conectar ao servidor (192.168.200.27). Verifique se o backend (Node.js) está online.');
      } else {
         Alert.alert('Acesso Negado', 'Credenciais inválidas ou conta suspensa.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme?.background || '#0f172a' }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme?.background || '#0f172a'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <View style={styles.logoContainer}>
          <ShieldCheck size={72} color={theme?.primary || '#10b981'} />
          <Text style={[styles.title, { color: theme?.textMain || '#f8fafc' }]}>TermoSync NOC</Text>
          <Text style={[styles.subtitle, { color: theme?.textMuted || '#94a3b8' }]}>Acesso Mobile Tático</Text>
        </View>

        <View style={[styles.formContainer, { backgroundColor: theme?.card || '#1e293b', borderColor: theme?.border || '#334155' }]}>
          <View style={[styles.inputBox, { backgroundColor: theme?.background || '#0f172a', borderColor: theme?.border || '#334155' }]}>
            <User size={20} color={theme?.textMuted || '#94a3b8'} style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { color: theme?.textMain || '#f8fafc' }]} 
              placeholder="Nome de Usuário" 
              placeholderTextColor={theme?.textMuted || '#94a3b8'}
              value={usuario} 
              onChangeText={setUsuario} 
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputBox, { backgroundColor: theme?.background || '#0f172a', borderColor: theme?.border || '#334155' }]}>
            <Lock size={20} color={theme?.textMuted || '#94a3b8'} style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { color: theme?.textMain || '#f8fafc' }]} 
              placeholder="Senha de Acesso" 
              placeholderTextColor={theme?.textMuted || '#94a3b8'}
              value={senha} 
              onChangeText={setSenha} 
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.btnPrimary, { backgroundColor: theme?.primary || '#10b981' }]} 
            onPress={fazerLogin} 
            disabled={isLoading}
          >
            <Text style={styles.btnPrimaryText}>{isLoading ? 'VERIFICANDO...' : 'AUTENTICAR'}</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 25 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 15 },
  subtitle: { fontSize: 14, marginTop: 5, textTransform: 'uppercase', letterSpacing: 1 },
  formContainer: { padding: 25, borderRadius: 20, borderWidth: 1 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16 },
  btnPrimary: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnPrimaryText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});