import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useContext, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

// 🔴 MUITO IMPORTANTE: O mesmo IP!
const API_URL = 'http://192.168.200.27:3000/api';

export default function LoginScreen() {
  const { setToken, setUserId, setUserRole, setUserFilial, setNomeLogado, setPapelLogado } = useContext(AppContext);
  
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const fazerLogin = async () => {
    if (!usuario || !senha) {
      Alert.alert('Erro', 'Por favor, preencha o utilizador e a palavra-passe.');
      return;
    }

    setLoading(true);
    try {
      // 1. Faz o pedido ao Backend
      const res = await axios.post(`${API_URL}/login`, { usuario, senha });
      const dados = res.data;
      
      // 2. Define o cargo/nome formatado
      let identityName = usuario; 
      let roleTitle = 'Gestor de Loja';
      
      if (dados.role === 'ADMIN') { 
        identityName = 'Administrador'; roleTitle = 'Acesso Master'; 
      } else if (dados.role === 'MANUTENCAO') { 
        identityName = dados.nome_tecnico || 'Técnico'; roleTitle = 'Manutenção Global'; 
      } else if (dados.role === 'LOJA') { 
        if (dados.nome_gerente) { identityName = dados.nome_gerente; roleTitle = 'Gerente da Loja'; } 
        else if (dados.nome_coordenador) { identityName = dados.nome_coordenador; roleTitle = 'Coordenador da Loja'; } 
        else { identityName = 'Equipa Geral'; roleTitle = 'Acesso da Loja'; } 
      }

      // 3. Guarda os dados fisicamente na memória do telemóvel
      await AsyncStorage.multiSet([
        ['token', dados.token],
        ['userId', String(dados.id)],
        ['userRole', dados.role],
        ['userFilial', dados.filial],
        ['nomeLogado', identityName],
        ['papelLogado', roleTitle]
      ]);

      // 4. Atualiza o Contexto
      // (O token tem de ser o último a ser atualizado para evitar que a app salte de ecrã sem os outros dados)
      setUserId(dados.id);
      setUserRole(dados.role);
      setUserFilial(dados.filial);
      setNomeLogado(identityName);
      setPapelLogado(roleTitle);
      
      setToken(dados.token); // Isto aciona a navegação para o Dashboard!

    } catch (error) {
      console.log("Erro no login:", error.message);
      Alert.alert('Acesso Negado', 'Credenciais inválidas ou servidor offline.\n\nVerifique se colocou o IP correto no código!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="snowflake" size={50} color="#059669" />
          <Text style={styles.title}>TermoSync</Text>
          <Text style={styles.subtitle}>Enterprise Mobile</Text>
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="account" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nome de Utilizador"
            placeholderTextColor="#94a3b8"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Palavra-passe"
            placeholderTextColor="#94a3b8"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={{ padding: 10 }}>
            <MaterialCommunityIcons name={mostrarSenha ? "eye-off" : "eye"} size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginBtn} 
          onPress={fazerLogin} 
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginBtnText}>Entrar no Sistema</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#059669', // Fundo Verde
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
  },
  inputIcon: {
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 15,
    color: '#0f172a',
  },
  loginBtn: {
    backgroundColor: '#059669',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});