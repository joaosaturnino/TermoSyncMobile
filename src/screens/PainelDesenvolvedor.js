import {
  Cpu,
  Globe, HardDrive, Radio,
  ShieldCheck,
  TerminalSquare
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

// ============================================================================
// ECRÃ DE BOOT (HACKER SCREEN MOBILE)
// ============================================================================
const BootScreen = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    let isMounted = true;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    
    const runBootSequence = async () => {
      const sequence = [
        { text: "TermoSync Mobile OS [Build 10.5.22621]", color: '#94a3b8' },
        { text: "Inicializando Processadores... OK", delay: 300 },
        { text: "Escaneando rede por dispositivos edge...", delay: 400 },
        { text: "[ OK ] Watchdogs de hardware acionados.", delay: 200 },
        { text: "Uplink WSS seguro para cluster master... [ 104.28.192.12 ]", delay: 400 },
        { text: "[ OK ] Túnel TLS 1.3 encriptado.", delay: 150, color: '#10b981' },
        { text: "[ AVISO ] IDS INICIANDO ZERO-TRUST.", delay: 500, color: '#ef4444' },
        { text: "SISTEMA RESTRITO. IDENTIFICAÇÃO ROOT NECESSÁRIA.", delay: 200, color: '#cbd5e1' }
      ];

      for (let i = 0; i < sequence.length; i++) {
        if (!isMounted) return;
        await sleep(sequence[i].delay || 100);
        setLogs(prev => [...prev, sequence[i]]);
      }
      if (isMounted) setShowInput(true);
    };

    runBootSequence();
    return () => { isMounted = false; };
  }, []);

  const handleAuth = async () => {
    if (!passcode.trim() || isProcessing) return;
    setIsProcessing(true);
    setShowInput(false);
    
    const typed = passcode;
    setPasscode('');
    setLogs(prev => [...prev, { text: `root@mobile:~$ ${typed.replace(/./g, '*')}`, color: '#10b981' }]);
    
    await new Promise(r => setTimeout(r, 600));
    
    if (typed.toLowerCase() === 'root') {
      setLogs(prev => [...prev, { text: "[ OK ] AUTENTICAÇÃO BEM-SUCEDIDA.", color: '#10b981' }]);
      await new Promise(r => setTimeout(r, 800));
      onComplete();
    } else {
      setLogs(prev => [...prev, { text: "[ FALHA ] ACESSO NEGADO.", color: '#ef4444' }]);
      await new Promise(r => setTimeout(r, 500));
      setShowInput(true);
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.bootContainer}>
      <ScrollView ref={scrollRef} onContentSizeChange={() => scrollRef.current?.scrollToEnd()} style={styles.bootTerminal}>
        {logs.map((log, index) => (
          <Text key={index} style={[styles.bootLog, { color: log.color || '#cbd5e1' }]}>
            {log.text}
          </Text>
        ))}
        {showInput && (
          <View style={styles.bootInputRow}>
            <Text style={styles.bootPrompt}>root@mobile:~$</Text>
            <TextInput 
              style={styles.bootInput} 
              autoFocus 
              secureTextEntry 
              value={passcode} 
              onChangeText={setPasscode} 
              onSubmitEditing={handleAuth}
              keyboardType="default"
              autoCapitalize="none"
              blurOnSubmit={false}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// PAINEL NOC PRINCIPAL (MOBILE)
// ============================================================================
export default function PainelDesenvolvedor({ route }) {
  const [isAuth, setIsAuth] = useState(false);
  const [metrics, setMetrics] = useState({ cpu: 12, ram: 42, ping: 14, reqs: 342, dbQps: 154, bandwidth: 24.5 });
  const [uptimeStr, setUptimeStr] = useState('--:--:--');
  const [apiTraffic, setApiTraffic] = useState([]);
  const [threats, setThreats] = useState([]);

  // Simulador de Uptime Mobile
  useEffect(() => {
    if (!isAuth) return;
    const start = Date.now() - 3600000 * 24 * 3; // 3 dias mockados
    const iUptime = setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 1000);
      const d = Math.floor(diff / 86400);
      const h = String(Math.floor((diff % 86400) / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setUptimeStr(`${d}d ${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(iUptime);
  }, [isAuth]);

  // Motores de Simulação NOC
  useEffect(() => {
    if (!isAuth) return;
    const i1 = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 20) + 15,
        ram: Math.floor(Math.random() * 10) + 60,
        ping: Math.floor(Math.random() * 8) + 10,
        reqs: Math.floor(Math.random() * 150) + 400,
        dbQps: Math.floor(Math.random() * 50) + 100,
        bandwidth: (Math.random() * 10 + 15).toFixed(1)
      });
    }, 2000);

    const i2 = setInterval(() => {
      const methods = ['GET', 'POST', 'WSS'];
      const m = methods[Math.floor(Math.random() * methods.length)];
      setApiTraffic(prev => [...prev.slice(-15), { id: Date.now(), method: m, ms: Math.floor(Math.random() * 40)+5, route: `/api/v1/data/${Math.floor(Math.random()*10)}` }]);
    }, 800);

    const i3 = setInterval(() => {
      if (Math.random() > 0.7) {
        setThreats(prev => [...prev.slice(-10), { id: Date.now(), text: `[WAF BLOCK] SQL_INJECTION from 104.28.${Math.floor(Math.random()*255)}.x` }]);
      }
    }, 3000);

    return () => { clearInterval(i1); clearInterval(i2); clearInterval(i3); };
  }, [isAuth]);

  if (!isAuth) {
    return <BootScreen onComplete={() => setIsAuth(true)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CYBER COMMAND NOC</Text>
          <Text style={styles.headerSubtitle}>Monitoramento Global Multi-Tenant</Text>
        </View>

        {/* HUD HORIZONTAL SCROLL */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hudRow}>
          <View style={styles.hudCard}>
            <View style={styles.hudHeader}><Cpu size={14} color="#10b981"/><Text style={styles.hudTitle}>CPU LOAD</Text></View>
            <Text style={styles.hudValue}>{metrics.cpu}<Text style={styles.hudUnit}>%</Text></Text>
          </View>
          <View style={styles.hudCard}>
            <View style={styles.hudHeader}><HardDrive size={14} color="#f59e0b"/><Text style={styles.hudTitle}>RAM USAGE</Text></View>
            <Text style={styles.hudValue}>{metrics.ram}<Text style={styles.hudUnit}>%</Text></Text>
          </View>
          <View style={styles.hudCard}>
            <View style={styles.hudHeader}><Globe size={14} color="#38bdf8"/><Text style={styles.hudTitle}>BANDWIDTH</Text></View>
            <Text style={styles.hudValue}>{metrics.bandwidth}<Text style={styles.hudUnit}>Mb/s</Text></Text>
          </View>
          <View style={styles.hudCard}>
            <View style={styles.hudHeader}><Radio size={14} color="#ef4444"/><Text style={styles.hudTitle}>NODE.JS UPTIME</Text></View>
            <Text style={[styles.hudValue, {color: '#ef4444'}]}>{uptimeStr}</Text>
          </View>
        </ScrollView>

        {/* TERMINAL: INGRESS ROUTING */}
        <View style={styles.terminalBox}>
          <View style={styles.terminalHeader}>
            <TerminalSquare size={14} color="#38bdf8" />
            <Text style={styles.terminalTitle}>BASH - INGRESS ROUTING (LIVE)</Text>
          </View>
          <View style={styles.terminalBody}>
            {apiTraffic.map(t => (
              <View key={t.id} style={styles.terminalLine}>
                <Text style={styles.tagMethod}>{t.method}</Text>
                <Text style={styles.tagMs}>{t.ms}ms</Text>
                <Text style={styles.tagRoute} numberOfLines={1}>{t.route}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* TERMINAL: WAF SECURITY */}
        <View style={[styles.terminalBox, { borderColor: 'rgba(239,68,68,0.3)' }]}>
          <View style={[styles.terminalHeader, { borderBottomColor: 'rgba(239,68,68,0.3)' }]}>
            <ShieldX size={14} color="#ef4444" />
            <Text style={[styles.terminalTitle, { color: '#ef4444' }]}>WAF / IDS SECURITY LOGS</Text>
          </View>
          <View style={styles.terminalBody}>
            {threats.map(t => (
              <Text key={t.id} style={styles.tagError}>✖ {t.text}</Text>
            ))}
          </View>
        </View>

        {/* SWITCHBOARD (IAM & UI) */}
        <View style={styles.switchboard}>
          <Text style={styles.switchboardTitle}><ShieldCheck size={16} color="#10b981"/> CONTROLE DE ACESSO (IAM)</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>PERMISSÃO GLOBAL</Text>
            <ToggleRight size={28} color="#10b981" />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>MODO MANUTENÇÃO (LOCKDOWN)</Text>
            <ToggleLeft size={28} color="#64748b" />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>GEOFENCING IP</Text>
            <ToggleRight size={28} color="#10b981" />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bootContainer: { flex: 1, backgroundColor: '#000' },
  bootTerminal: { flex: 1, padding: 20 },
  bootLog: { fontFamily: 'monospace', fontSize: 12, marginBottom: 4 },
  bootInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  bootPrompt: { color: '#10b981', fontFamily: 'monospace', fontSize: 14, marginRight: 8 },
  bootInput: { flex: 1, color: '#fff', fontFamily: 'monospace', fontSize: 14 },
  
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  header: { marginBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  headerSubtitle: { color: '#94a3b8', fontSize: 12, marginTop: 4, fontWeight: '600' },
  
  hudRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  hudCard: { backgroundColor: '#0b1120', width: 150, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
  hudHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  hudTitle: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
  hudValue: { color: '#fff', fontSize: 24, fontWeight: '900', fontFamily: 'monospace' },
  hudUnit: { fontSize: 12, color: '#64748b' },

  terminalBox: { backgroundColor: '#020617', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20, height: 200, overflow: 'hidden' },
  terminalHeader: { backgroundColor: '#0b1120', padding: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b', flexDirection: 'row', alignItems: 'center', gap: 8 },
  terminalTitle: { color: '#64748b', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  terminalBody: { padding: 12, flex: 1 },
  terminalLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  tagMethod: { backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: 10, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, fontFamily: 'monospace', fontWeight: 'bold' },
  tagMs: { color: '#64748b', fontSize: 10, fontFamily: 'monospace' },
  tagRoute: { color: '#cbd5e1', fontSize: 11, flex: 1, fontFamily: 'monospace' },
  tagError: { color: '#ef4444', fontSize: 11, fontFamily: 'monospace', marginBottom: 6, fontWeight: 'bold' },

  switchboard: { backgroundColor: '#0b1120', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', padding: 16 },
  switchboardTitle: { color: '#10b981', fontSize: 12, fontWeight: '900', marginBottom: 16, letterSpacing: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#020617', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', marginBottom: 8 },
  switchLabel: { color: '#cbd5e1', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 }
});