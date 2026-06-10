import { Fingerprint, Lock, ShieldAlert, TerminalSquare, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      // Verificação de segurança: só tenta navegar se o 'navigation' existir
      if (navigation && navigation.replace) {
        navigation.replace('Drawer'); 
      } else {
        console.warn("Aviso: Objeto 'navigation' não encontrado. Se estiver a testar a tela diretamente no App.js, isto é normal.");
      }
      
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <View style={styles.logoContainer}>
          <Fingerprint size={64} color="#10b981" />
          <Text style={styles.title}>TERMOSYNC OS</Text>
          <Text style={styles.subtitle}>SECURE UPLINK VERIFICATION</Text>
        </View>

        <View style={styles.terminalBox}>
          <View style={styles.terminalHeader}>
            <TerminalSquare size={14} color="#64748b" />
            <Text style={styles.terminalTitle}>/dev/tty1 - AUTH MODULE</Text>
          </View>
          <View style={styles.terminalBody}>
            <Text style={styles.logText}>{'>'} Inicializando protocolo Zero-Trust...</Text>
            <Text style={styles.logText}>{'>'} Aguardando credenciais (JWT)...</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <User size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} placeholder="IDENTIFICAÇÃO (ROOT/USER)" 
              placeholderTextColor="#64748b" value={usuario} onChangeText={setUsuario}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} placeholder="CHAVE CRIPTOGRÁFICA (SENHA)" 
              placeholderTextColor="#64748b" secureTextEntry value={senha} onChangeText={setSenha}
            />
          </View>

          <TouchableOpacity style={styles.btnAuth} onPress={handleLogin} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator color="#020617" size="small" /> : <ShieldAlert size={20} color="#020617" />}
            <Text style={styles.btnAuthText}>{isProcessing ? 'VERIFICANDO HASH...' : 'ESTABELECER CONEXÃO'}</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 16, letterSpacing: 2 },
  subtitle: { fontSize: 12, color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold', marginTop: 4, letterSpacing: 1 },

  terminalBox: { backgroundColor: '#0b1120', borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', marginBottom: 30, overflow: 'hidden' },
  terminalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0f172a', padding: 8, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  terminalTitle: { color: '#64748b', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' },
  terminalBody: { padding: 12, minHeight: 60 },
  logText: { color: '#cbd5e1', fontSize: 11, fontFamily: 'monospace', marginBottom: 4 },

  formContainer: { gap: 16 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0b1120', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, paddingHorizontal: 16, height: 55 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold' },
  
  btnAuth: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#10b981', height: 55, borderRadius: 10, shadowColor: '#10b981', shadowOpacity: 0.5, shadowRadius: 15, elevation: 5, marginTop: 10 },
  btnAuthText: { color: '#020617', fontSize: 13, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace' }
});