import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function LoginScreen() {
  const { fazerLogin, isOffline } = useContext(AppContext);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!usuario || !senha) return;
    setLoading(true);
    await fazerLogin(usuario, senha);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.loginBox}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="snowflake" size={50} color="#059669" />
            </View>
            <Text style={styles.title}>TermoSync</Text>
            <Text style={styles.subtitle}>Corporate Platform ESG</Text>
          </View>

          {isOffline && (
            <View style={styles.offlineWarning}>
              <MaterialCommunityIcons name="wifi-off" size={16} color="#ef4444" />
              <Text style={styles.offlineText}>Sem ligação ao servidor. Verifique a rede.</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Credencial de Acesso</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: admin_master"
              placeholderTextColor="#94a3b8"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
              autoCorrect={false}
              showSoftInputOnFocus={true} // Força o teclado virtual no Tablet
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Palavra-passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              autoCapitalize="none"
              showSoftInputOnFocus={true} // Força o teclado virtual no Tablet
            />
          </View>

          <TouchableOpacity 
            style={styles.btn} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.btnText}>Autenticar</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#064e3b' 
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loginBox: { 
    backgroundColor: '#ffffff', 
    width: '100%', 
    maxWidth: 400, 
    borderRadius: 16, 
    padding: 30, 
    elevation: 10 
  },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoCircle: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 50, marginBottom: 15, elevation: 5 },
  title: { fontSize: 32, fontWeight: '900', color: '#059669', marginBottom: 5, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  offlineWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', padding: 10, borderRadius: 8, marginBottom: 20, justifyContent: 'center' },
  offlineText: { color: '#ef4444', fontSize: 12, fontWeight: 'bold', marginLeft: 8 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 15, fontSize: 16, color: '#0f172a', backgroundColor: '#f8fafc' },
  btn: { backgroundColor: '#059669', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});