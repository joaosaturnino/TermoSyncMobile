import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function DashboardScreen({ navigation }) {
  const { equipamentos, notificacoes, contatosDb, socket, userId, nomeLogado, setHistoricoChat, isOffline } = useContext(AppContext);
  
  const [chatModalVisible, setChatModalVisivel] = useState(false);
  const [alertaSelecionado, setAlertaSelecionado] = useState(null);
  const [contatoDestino, setContatoDestino] = useState('');
  const [textoEscalonamento, setTextoEscalonamento] = useState('');

  // Animação de Pulso para Alertas Críticos
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  // Tocar som em caso de alerta crítico mecânico ou de porta
  useEffect(() => {
    const temCritico = (notificacoes || []).some(n => n.tipo_alerta === 'MECANICA' || n.tipo_alerta === 'PORTA');
    if (temCritico && !isOffline) {
      tocarSomAlerta();
    }
  }, [notificacoes, isOffline]);

  const tocarSomAlerta = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/alert.mp3')); // Ajusta o path se necessário
      await sound.playAsync();
    } catch (e) {}
  };

  const equipSeguros = equipamentos || [];
  const notifSeguras = notificacoes || [];
  const contatosSeguros = contatosDb || [];

  const qtdTotal = equipSeguros.length;
  const qtdOperando = equipSeguros.filter(e => e.motor_ligado && !e.em_degelo).length;
  const qtdDegelo = equipSeguros.filter(e => e.em_degelo).length;
  const qtdFalha = equipSeguros.filter(e => !e.motor_ligado && !e.em_degelo).length;

  const abrirEscalonamento = (notif) => {
    setAlertaSelecionado(notif);
    setTextoEscalonamento(`Emergência técnica: A máquina ${notif.equipamento_nome} (${notif.filial}) registou uma anomalia grave. Solicito verificação.`);
    setChatModalVisivel(true);
  };

  const confirmarEscalonamento = () => {
    if (!contatoDestino) return alert("Selecione um destinatário.");
    if (!textoEscalonamento.trim()) return;

    const novaMsg = { id: Date.now(), remetenteId: userId, remetenteNome: nomeLogado, destinoId: contatoDestino, texto: textoEscalonamento, data: new Date(), tipo: 'sent' };
    
    setHistoricoChat(prev => [...(prev || []), novaMsg]);
    socket?.emit('enviar_mensagem_chat', novaMsg);
    
    setChatModalVisivel(false);
    navigation.navigate('Chat Interno'); 
  };

  const getAlertConfig = (tipo) => {
    switch (tipo) {
      case 'REDE': return { icon: 'wifi-alert', color: '#f59e0b', action: 'Verificar Nó', critical: false };
      case 'DEGELO': return { icon: 'snowflake', color: '#38bdf8', action: 'Ocultar Degelo', critical: false };
      case 'MECANICA': return { icon: 'power-plug-off', color: '#f97316', action: 'Manutenção', critical: true };
      case 'PORTA': return { icon: 'door-open', color: '#e11d48', action: 'Fechar Porta', critical: true };
      case 'METROLOGIA': return { icon: 'clipboard-check', color: '#6366f1', action: 'Calibrar', critical: false };
      default: return { icon: 'alert', color: '#ef4444', action: 'Resolver', critical: true };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 5 }}>
          <Ionicons name="menu" size={28} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Central de Operações</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ================= CARDS KPI (Resumo) ================= */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Equipamentos</Text>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(100, 116, 139, 0.1)' }]}><MaterialCommunityIcons name="server" size={20} color="#64748b" /></View>
            </View>
            <Text style={[styles.summaryValue, { color: '#0f172a' }]}>{qtdTotal}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Operando</Text>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}><MaterialCommunityIcons name="check-circle" size={20} color="#10b981" /></View>
            </View>
            <Text style={[styles.summaryValue, { color: '#10b981' }]}>{qtdOperando}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Degelo</Text>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}><MaterialCommunityIcons name="snowflake-thermometer" size={20} color="#38bdf8" /></View>
            </View>
            <Text style={[styles.summaryValue, { color: '#38bdf8' }]}>{qtdDegelo}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Anomalias</Text>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}><MaterialCommunityIcons name="alert-octagon" size={20} color="#ef4444" /></View>
            </View>
            {notifSeguras.length > 0 ? (
              <Animated.Text style={[styles.summaryValue, { color: '#ef4444', transform: [{ scale: pulseAnim }] }]}>{qtdFalha}</Animated.Text>
            ) : (
              <Text style={[styles.summaryValue, { color: '#ef4444' }]}>{qtdFalha}</Text>
            )}
          </View>
        </View>

        {/* ================= TRIAGEM DE ALERTAS ================= */}
        <View style={styles.flexHeader}>
          <Text style={styles.sectionTitle}>Triagem de Rede</Text>
        </View>
        
        {notifSeguras.length === 0 ? (
          <View style={styles.dashboardEmpty}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <MaterialCommunityIcons name="check-decagram" size={64} color="#10b981" style={{ opacity: 0.8 }} />
            </Animated.View>
            <Text style={styles.emptyTitle}>Rede Estável</Text>
            <Text style={styles.emptySubtitle}>Todos os nós e sensores operam normalmente.</Text>
          </View>
        ) : (
          notifSeguras.map(notif => {
            const config = getAlertConfig(notif.tipo_alerta);
            return (
              <Animated.View key={notif.id} style={[styles.cardAlert, { borderBottomColor: config.color }, config.critical && { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.cardTop}>
                  <View style={styles.alertTitleGroup}>
                    <View style={[styles.alertIconBox, { backgroundColor: `${config.color}20` }]}>
                      <MaterialCommunityIcons name={config.icon} size={22} color={config.color} />
                    </View>
                    <Text style={styles.alertEquipName}>{notif.equipamento_nome}</Text>
                  </View>
                  <View style={[styles.timeBadge, { backgroundColor: `${config.color}15` }]}>
                    <Text style={styles.timeBadgeText}>{new Date(notif.data_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  </View>
                </View>
                
                <View style={styles.badgesContainer}>
                  <Text style={styles.badgeSetor}>{notif.filial}</Text>
                  <Text style={styles.badgeSetor}>{notif.setor}</Text>
                </View>
                
                <Text style={styles.alertMsg}>{notif.mensagem}</Text>
                
                <View style={styles.alertActions}>
                  <TouchableOpacity style={[styles.btnAlertAction, { backgroundColor: config.color }]} disabled={isOffline}>
                    <Text style={styles.btnAlertActionText}>{config.action}</Text>
                  </TouchableOpacity>
                  
                  {config.critical && (
                    <TouchableOpacity style={styles.btnChatInternal} onPress={() => abrirEscalonamento(notif)}>
                      <MaterialCommunityIcons name="message-processing" size={20} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      {/* ================= MODAL CHAT INTERNO ================= */}
      <Modal visible={chatModalVisible} transparent animationType="slide">
        <View style={styles.chatOverlay}>
          <View style={styles.chatPanel}>
            <View style={styles.chatPanelHeader}>
              <View>
                <Text style={styles.chatPanelTitle}>Escalonar Alerta</Text>
                <Text style={styles.chatPanelSubtitle}>{alertaSelecionado?.equipamento_nome} • {alertaSelecionado?.filial}</Text>
              </View>
              <TouchableOpacity onPress={() => setChatModalVisivel(false)} style={styles.btnCloseChat}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.chatPanelBody}>
              <Text style={styles.chatLabel}>1. Selecionar Destinatário</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactScroll}>
                {contatosSeguros.map(c => (
                  <TouchableOpacity key={c.id} style={[styles.contatoSelectBtn, contatoDestino === c.id && styles.contatoSelected]} onPress={() => setContatoDestino(c.id)}>
                    <Text style={[styles.contatoSelectText, contatoDestino === c.id && { color: '#fff' }]}>{c.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.chatLabel}>2. Detalhes da Emergência</Text>
              <TextInput 
                style={styles.chatTextarea} 
                multiline 
                value={textoEscalonamento} 
                onChangeText={setTextoEscalonamento} 
              />

              <TouchableOpacity style={styles.btnConfirmChat} onPress={confirmarEscalonamento}>
                <Ionicons name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnConfirmChatText}>Abrir Bate-Papo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0', paddingTop: Platform.OS === 'ios' ? 50 : 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  scrollContent: { padding: 15, paddingBottom: 40 },
  
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 25 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 15, width: '47%', borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 } },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  summaryTitle: { fontSize: 12, color: '#64748b', fontWeight: '700', textTransform: 'uppercase' },
  iconWrapper: { padding: 8, borderRadius: 10 },
  summaryValue: { fontSize: 28, fontWeight: '900', lineHeight: 32 },

  flexHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },

  dashboardEmpty: { padding: 40, alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(16, 185, 129, 0.3)', borderRadius: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginTop: 15 },
  emptySubtitle: { color: '#64748b', textAlign: 'center', marginTop: 5, fontWeight: '500' },

  cardAlert: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 15, borderBottomWidth: 4, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 4 } },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  alertTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertIconBox: { padding: 8, borderRadius: 10 },
  alertEquipName: { fontWeight: '900', fontSize: 16, color: '#0f172a' },
  timeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  timeBadgeText: { fontSize: 11, fontWeight: '800', color: '#0f172a' },
  
  badgesContainer: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badgeSetor: { backgroundColor: '#f8fafc', color: '#64748b', borderWidth: 1, borderColor: '#e2e8f0', fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontWeight: '800', textTransform: 'uppercase' },
  alertMsg: { fontSize: 14, color: '#0f172a', fontWeight: '500', marginBottom: 20, lineHeight: 20 },
  
  alertActions: { flexDirection: 'row', gap: 10 },
  btnAlertAction: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnAlertActionText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  btnChatInternal: { backgroundColor: '#38bdf8', width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  // Chat Modal Styles
  chatOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  chatPanel: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  chatPanelHeader: { backgroundColor: '#ef4444', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatPanelTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  chatPanelSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginTop: 2 },
  btnCloseChat: { padding: 4 },
  chatPanelBody: { padding: 20 },
  chatLabel: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 10, marginTop: 10 },
  contactScroll: { maxHeight: 50, marginBottom: 20 },
  contatoSelectBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0', alignSelf: 'flex-start' },
  contatoSelected: { backgroundColor: '#059669', borderColor: '#059669' },
  contatoSelectText: { color: '#334155', fontWeight: '700', fontSize: 13 },
  chatTextarea: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 15, minHeight: 120, textAlignVertical: 'top', fontSize: 14, color: '#0f172a', marginBottom: 20 },
  btnConfirmChat: { backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12 },
  btnConfirmChatText: { color: '#fff', fontWeight: '800', fontSize: 15 }
});