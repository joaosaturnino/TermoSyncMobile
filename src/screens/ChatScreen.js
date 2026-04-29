import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useContext, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function ChatScreen({ navigation }) {
  const { socket, userId, nomeLogado, contatosDb, historicoChat, setHistoricoChat, setNaoLidasPorContato, naoLidasPorContato, chamadaAtiva, setChamadaAtiva } = useContext(AppContext);
  
  const [contatoAtivo, setContatoAtivo] = useState(null);
  const [mensagem, setMensagem] = useState('');
  
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [somAtual, setSomAtual] = useState(null);

  const flatListRef = useRef(null);
  const callPulseAnim = useRef(new Animated.Value(1)).current;

  // Animação da Chamada
  useEffect(() => {
    if (chamadaAtiva) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(callPulseAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
          Animated.timing(callPulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    }
  }, [chamadaAtiva]);

  useEffect(() => {
    if (contatoAtivo) {
      setNaoLidasPorContato(prev => {
        if (prev && prev[contatoAtivo.id]) {
          const n = { ...prev }; delete n[contatoAtivo.id]; return n; 
        }
        return prev;
      });
    }
  }, [contatoAtivo, historicoChat, setNaoLidasPorContato]);

  const enviarMensagemTexto = () => {
    if (!mensagem.trim()) return;
    const novaMsg = { id: Date.now(), remetenteId: userId, remetenteNome: nomeLogado, destinoId: contatoAtivo.id, texto: mensagem, data: new Date(), tipo: 'sent' };
    
    setHistoricoChat(prev => [...(prev || []), novaMsg]);
    socket?.emit('enviar_mensagem_chat', novaMsg);
    setMensagem('');
  };

  const anexarImagem = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.5, base64: true });
      if (!result.canceled && result.assets && result.assets[0].base64) {
        const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const novaMsg = { id: Date.now(), remetenteId: userId, remetenteNome: nomeLogado, destinoId: contatoAtivo.id, texto: `[FILE:imagem.jpg|image/jpeg]${base64}`, data: new Date(), tipo: 'sent' };
        setHistoricoChat(prev => [...(prev || []), novaMsg]);
        socket?.emit('enviar_mensagem_chat', novaMsg);
      }
    } catch (e) {}
  };

  const iniciarGravacao = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {}
  };

  const pararEEnviarGravacao = async () => {
    setIsRecording(false);
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      const novaMsg = { id: Date.now(), remetenteId: userId, remetenteNome: nomeLogado, destinoId: contatoAtivo.id, texto: `[AUDIO]${uri}`, data: new Date(), tipo: 'sent' };
      setHistoricoChat(prev => [...(prev || []), novaMsg]);
      socket?.emit('enviar_mensagem_chat', novaMsg);
    } catch (e) {}
  };

  const tocarAudio = async (uri) => {
    try {
      if (somAtual) await somAtual.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSomAtual(sound);
      await sound.playAsync();
    } catch (e) {}
  };

  const atenderChamada = () => socket?.emit('chamada_aceita', { destinoId: chamadaAtiva.peer.id });
  const rejeitarChamada = () => socket?.emit('chamada_rejeitada', { destinoId: chamadaAtiva.peer.id });
  const desligarChamada = () => socket?.emit('chamada_encerrar', { destinoId: chamadaAtiva.peer.id });

  if (chamadaAtiva) {
    return (
      <View style={styles.callOverlay}>
        <Animated.View style={[styles.callPulseRing, { transform: [{ scale: callPulseAnim }] }]} />
        <View style={styles.callAvatar}>
          <Text style={styles.callAvatarText}>{chamadaAtiva.peer.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.callName}>{chamadaAtiva.peer.nome}</Text>
        <Text style={styles.callStatusText}>{chamadaAtiva.state === 'incoming' ? 'A receber chamada VoIP...' : 'Chamada em curso...'}</Text>
        
        <View style={styles.callActions}>
          {chamadaAtiva.state === 'incoming' && (
            <TouchableOpacity style={styles.btnCallAccept} onPress={atenderChamada}>
              <MaterialCommunityIcons name="phone" size={32} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btnCallReject} onPress={chamadaAtiva.state === 'incoming' ? rejeitarChamada : desligarChamada}>
            <MaterialCommunityIcons name="phone-hangup" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!contatoAtivo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 5 }}>
            <Ionicons name="menu" size={28} color="#059669" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Central de Colaboração</Text>
          <View style={{ width: 28 }} />
        </View>
        <FlatList
          data={contatosDb || []} 
          keyExtractor={c => String(c?.id || Math.random())}
          renderItem={({ item }) => {
            if (!item) return null;
            const unread = (naoLidasPorContato || {})[item.id] || 0;
            return (
              <TouchableOpacity style={[styles.contactItem, unread > 0 && styles.contactItemUnread]} onPress={() => setContatoAtivo(item)}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{item.nome ? item.nome.charAt(0).toUpperCase() : 'U'}</Text></View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.nome || 'Desconhecido'}</Text>
                  <Text style={styles.contactRole}>{item.cargo || ''}</Text>
                </View>
                {unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>}
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    );
  }

  const mensagensExibidas = (historicoChat || []).filter(m => 
    (String(m?.remetenteId) === String(contatoAtivo?.id) && m?.tipo === 'received') || 
    (String(m?.destinoId) === String(contatoAtivo?.id) && m?.tipo === 'sent') ||
    (String(m?.destinoId) === 'todos')
  );

  const renderItem = ({ item }) => {
    if (!item) return null;
    const isSent = item.tipo === 'sent';
    const textoOriginal = item.texto || ''; 
    const isAudio = textoOriginal.startsWith('[AUDIO]');
    const isFile = textoOriginal.startsWith('[FILE:');

    let content = <Text style={[styles.msgText, isSent ? styles.msgTextSent : {}]}>{textoOriginal.replace(/\[REP:.*?\]\s*/, '')}</Text>;
    
    if (isAudio) {
      content = (
        <TouchableOpacity style={styles.audioBtn} onPress={() => tocarAudio(textoOriginal.substring(7))}>
          <Ionicons name={somAtual ? "pause" : "play"} size={20} color={isSent ? "#fff" : "#059669"} />
          <Text style={[styles.msgText, isSent ? styles.msgTextSent : {}]}>Mensagem de Voz</Text>
        </TouchableOpacity>
      );
    } else if (isFile && textoOriginal.includes('image/')) {
      const src = textoOriginal.substring(textoOriginal.indexOf(']') + 1);
      content = <Image source={{ uri: src }} style={styles.chatImage} />;
    }

    return (
      <View style={[styles.msgWrapper, isSent ? styles.msgSent : styles.msgReceived]}>
        <View style={[styles.msgBubble, isSent ? styles.bubbleSent : styles.bubbleReceived]}>
          {content}
          <View style={styles.msgMeta}>
            <Text style={[styles.msgTime, isSent ? {color: 'rgba(255,255,255,0.8)'} : {}]}>
              {new Date(item.data || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isSent && <Ionicons name="checkmark-done" size={15} color="#fff" style={{ marginLeft: 4 }} />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setContatoAtivo(null)} style={{ padding: 5 }}>
            <Ionicons name="arrow-back" size={24} color="#64748b" />
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <View style={styles.smallAvatar}>
              <Text style={styles.smallAvatarText}>{contatoAtivo?.nome ? contatoAtivo.nome.charAt(0).toUpperCase() : 'U'}</Text>
            </View>
            <View>
              <Text style={styles.chatHeaderName}>{contatoAtivo?.nome || 'Utilizador'}</Text>
              <Text style={styles.chatHeaderStatus}>{contatoAtivo?.cargo || ''}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => socket?.emit('chamada_iniciar', { remetenteId: userId, remetenteNome: nomeLogado, destinoId: contatoAtivo?.id })} style={styles.btnCallHeader}>
            <MaterialCommunityIcons name="phone" size={20} color="#059669" />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={mensagensExibidas}
          keyExtractor={item => String(item?.id || Math.random())}
          renderItem={renderItem}
          contentContainerStyle={styles.chatHistory}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputArea}>
          {!isRecording ? (
            <>
              <TouchableOpacity style={styles.iconBtn} onPress={anexarImagem}>
                <MaterialCommunityIcons name="paperclip" size={24} color="#64748b" />
              </TouchableOpacity>
              <TextInput 
                style={styles.input} 
                placeholder="Mensagem..." 
                value={mensagem} 
                onChangeText={setMensagem} 
                multiline
              />
              {mensagem.trim() ? (
                <TouchableOpacity style={styles.sendBtn} onPress={enviarMensagemTexto}>
                  <MaterialCommunityIcons name="send" size={20} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.iconBtn} onPress={iniciarGravacao}>
                  <MaterialCommunityIcons name="microphone" size={26} color="#64748b" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.recordingArea}>
              <MaterialCommunityIcons name="microphone" size={26} color="#ef4444" style={{ opacity: 0.8 }} />
              <Text style={styles.recordingText}>A gravar áudio...</Text>
              <TouchableOpacity style={styles.sendBtnAudio} onPress={pararEEnviarGravacao}>
                <MaterialCommunityIcons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0', paddingTop: Platform.OS === 'ios' ? 50 : 15 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  
  contactItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', marginHorizontal: 10, marginTop: 10, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: {width: 0, height: 2} },
  contactItemUnread: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd', borderWidth: 1 },
  avatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  contactInfo: { flex: 1, marginLeft: 15 },
  contactName: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  contactRole: { fontSize: 12, color: '#64748b', marginTop: 4, textTransform: 'uppercase', fontWeight: '700' },
  badge: { backgroundColor: '#38bdf8', borderRadius: 20, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingTop: Platform.OS === 'ios' ? 50 : 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0', elevation: 4, zIndex: 10 },
  chatHeaderInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  smallAvatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  smallAvatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  chatHeaderName: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  chatHeaderStatus: { fontSize: 12, color: '#10b981', fontWeight: '700' },
  btnCallHeader: { backgroundColor: '#ecfdf5', padding: 10, borderRadius: 50 },
  
  chatHistory: { padding: 15, paddingBottom: 30 },
  msgWrapper: { marginBottom: 15, maxWidth: '80%' },
  msgSent: { alignSelf: 'flex-end' },
  msgReceived: { alignSelf: 'flex-start' },
  
  // 🔴 Cantos assimétricos fieis à versão Web
  msgBubble: { padding: 12, paddingHorizontal: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1 },
  bubbleSent: { backgroundColor: '#059669', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 4 },
  bubbleReceived: { backgroundColor: '#ffffff', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 4, borderBottomRightRadius: 18, borderWidth: 1, borderColor: '#e2e8f0' },
  
  msgText: { fontSize: 15, color: '#0f172a', lineHeight: 22 },
  msgTextSent: { color: '#ffffff' },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 6 },
  msgTime: { fontSize: 10, color: '#64748b', fontWeight: '600' },
  chatImage: { width: 220, height: 220, borderRadius: 12, marginBottom: 5 },
  audioBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  
  inputArea: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingBottom: Platform.OS === 'ios' ? 20 : 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e2e8f0' },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, maxHeight: 120, fontSize: 15, color: '#0f172a' },
  iconBtn: { padding: 10 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center', marginLeft: 8, elevation: 3 },
  sendBtnAudio: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  recordingArea: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  recordingText: { color: '#ef4444', fontWeight: '800', flex: 1, marginLeft: 10, fontSize: 15 },

  // 🔴 Tela de Chamada VoIP Imersiva
  callOverlay: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  callPulseRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 2, borderColor: '#38bdf8', opacity: 0.5 },
  callAvatar: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center', elevation: 10, marginBottom: 20 },
  callAvatarText: { fontSize: 60, fontWeight: '900', color: '#fff' },
  callName: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 10 },
  callStatusText: { fontSize: 16, color: '#94a3b8', fontWeight: '600', marginBottom: 50 },
  callActions: { flexDirection: 'row', gap: 40, marginTop: 40 },
  btnCallAccept: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  btnCallReject: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', elevation: 5 }
});