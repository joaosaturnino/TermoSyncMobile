import {
  ArrowLeft, Mic, Paperclip,
  Radio,
  Send, Shield,
  Terminal
} from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

const theme = {
  bg: '#020617', card: '#0f172a', textMain: '#f8fafc', textMuted: '#94a3b8',
  border: '#1e293b', primary: '#059669', secondary: '#10b981', danger: '#ef4444'
};

export default function ChatScreen({ navigation }) {
  const [mensagem, setMensagem] = useState('');
  
  const quickReplies = ["Estou no local 📍", "Anomalia resolvida ✅", "Aguardando peças ⏳", "Apoio tático 🆘"];
  
  // Simulação
  const mensagens = [
    { id: 1, texto: "Sistema TermoSync estabeleceu ligação ponto-a-ponto cifrada.", tipo: 'system' },
    { id: 2, texto: "Estou no corredor de congelados, a porta estava mal fechada.", tipo: 'sent', hora: "14:30" },
    { id: 3, texto: "Recebido. Verifica a borracha de vedação por favor.", tipo: 'received', hora: "14:32" }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER TÁTICO */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.textMain} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Equipa de Manutenção</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Link Seguro Estabelecido</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnRadio}>
          <Radio size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.secureBanner}>
        <Shield size={12} color={theme.primary} />
        <Text style={styles.secureText}>Canal Tático E2E (AES-256)</Text>
      </View>

      {/* ÁREA DE MENSAGENS */}
      <ScrollView contentContainerStyle={styles.chatArea}>
        {mensagens.map(msg => {
          if (msg.tipo === 'system') {
            return (
              <View key={msg.id} style={styles.systemBubble}>
                <Terminal size={14} color={theme.textMuted} />
                <Text style={styles.systemText}>{msg.texto}</Text>
              </View>
            );
          }
          
          const isSent = msg.tipo === 'sent';
          return (
            <View key={msg.id} style={[styles.msgWrapper, isSent ? styles.msgSent : styles.msgReceived]}>
              <View style={[styles.msgBubble, isSent ? styles.bubbleSent : styles.bubbleReceived]}>
                <Text style={[styles.msgText, isSent && {color: 'white'}]}>{msg.texto}</Text>
              </View>
              <Text style={styles.msgMeta}>{msg.hora}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* INPUT E QUICK REPLIES */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputContainer}>
          
          {/* Quick Replies Strip */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickReplyScroll} contentContainerStyle={{ paddingHorizontal: 15 }}>
            {quickReplies.map((reply, index) => (
              <TouchableOpacity key={index} style={styles.quickReplyBtn} onPress={() => setMensagem(reply)}>
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Barra de Digitação */}
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.btnAttach}>
              <Paperclip size={20} color={theme.textMuted} />
            </TouchableOpacity>
            
            <View style={styles.textInputWrapper}>
              <TextInput 
                style={styles.textInput}
                placeholder="Transmita comando ou mensagem..."
                placeholderTextColor={theme.textMuted}
                value={mensagem}
                onChangeText={setMensagem}
              />
            </View>

            {mensagem.trim().length > 0 ? (
              <TouchableOpacity style={styles.btnSend}>
                <Send size={18} color="white" style={{ marginLeft: -2 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnMic}>
                <Mic size={20} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  btnBack: { padding: 5, marginRight: 10 },
  headerInfo: { flex: 1 },
  headerName: { color: theme.textMain, fontSize: 16, fontWeight: '800' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary, marginRight: 6 },
  statusText: { color: theme.primary, fontSize: 12, fontWeight: '600' },
  btnRadio: { backgroundColor: 'rgba(5, 150, 105, 0.1)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(5, 150, 105, 0.3)' },

  secureBanner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(5, 150, 105, 0.1)', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(5, 150, 105, 0.2)' },
  secureText: { color: theme.primary, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginLeft: 6, letterSpacing: 1 },

  chatArea: { padding: 15, paddingBottom: 20 },
  
  systemBubble: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.border, marginBottom: 15 },
  systemText: { color: theme.textMuted, fontSize: 11, fontFamily: 'monospace', marginLeft: 8 },

  msgWrapper: { maxWidth: '80%', marginBottom: 15 },
  msgSent: { alignSelf: 'flex-end' },
  msgReceived: { alignSelf: 'flex-start' },
  
  msgBubble: { padding: 14, borderRadius: 18, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  bubbleSent: { backgroundColor: theme.primary, borderBottomRightRadius: 4 },
  bubbleReceived: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderBottomLeftRadius: 4 },
  msgText: { color: theme.textMain, fontSize: 15, lineHeight: 22 },
  msgMeta: { color: theme.textMuted, fontSize: 10, marginTop: 4, alignSelf: 'flex-end', fontWeight: 'bold' },

  inputContainer: { backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border, paddingBottom: Platform.OS === 'ios' ? 10 : 15 },
  quickReplyScroll: { paddingVertical: 12 },
  quickReplyBtn: { backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  quickReplyText: { color: theme.textMain, fontSize: 13, fontWeight: '600' },

  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  btnAttach: { padding: 10 },
  textInputWrapper: { flex: 1, backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border, borderRadius: 24, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 12 : 8, marginHorizontal: 8 },
  textInput: { color: theme.textMain, fontSize: 15 },
  
  btnMic: { padding: 10, backgroundColor: 'rgba(5, 150, 105, 0.1)', borderRadius: 20 },
  btnSend: { backgroundColor: theme.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }
});