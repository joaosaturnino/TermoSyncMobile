import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import React, { useContext, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager } from 'react-native';
import { AppContext } from '../context/AppContext';

// Ativar animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CustomDrawer(props) {
  const { logout, nomeLogado, papelLogado, userRole, userFilial, filialAtiva, setFilialAtiva, filiaisDb } = useContext(AppContext);
  const [expandido, setExpandido] = useState(false);

  const inicial = nomeLogado ? nomeLogado.charAt(0).toUpperCase() : 'U';

  const toggleExpandir = () => {
    // Animação suave ao abrir/fechar o acordeão
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido(!expandido);
  };

  const selecionarFilial = (f) => {
    setFilialAtiva(f);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#059669' }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: '#059669' }}>
        
        {/* Cabeçalho / Logo */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <MaterialCommunityIcons name="snowflake" size={26} color="#059669" />
          </View>
          <Text style={styles.headerTitle}>TermoSync</Text>
        </View>

        {/* Perfil do Utilizador */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{inicial}</Text></View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>{nomeLogado || 'Utilizador'}</Text>
            <Text style={styles.profileRole}>{papelLogado}</Text>
          </View>
        </View>

        {/* Seletor de Loja Expansível Animado */}
        <View style={styles.lojaSelectorContainer}>
          <Text style={styles.selectorLabel}>
            <MaterialCommunityIcons name="map-marker-outline" size={12}/> {userRole === 'ADMIN' ? 'REDE DE LOJAS' : 'ACESSO LOCAL'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.selectorButton, expandido && styles.selectorButtonOpen]} 
            onPress={toggleExpandir}
            disabled={userRole !== 'ADMIN'}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <MaterialCommunityIcons 
                name={userRole === 'ADMIN' ? "store-outline" : "store"} 
                size={18} 
                color="#ffffff" 
                style={{ marginRight: 8 }}
              />
              <Text style={styles.selectorValueText} numberOfLines={1}>
                {userRole !== 'ADMIN' ? userFilial : (filialAtiva === 'Todas' ? 'Visão Global Integrada' : filialAtiva)}
              </Text>
            </View>
            {userRole === 'ADMIN' && (
              <MaterialCommunityIcons 
                name={expandido ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="rgba(255,255,255,0.7)" 
              />
            )}
          </TouchableOpacity>

          {/* Lista Suspensa (Dropdown) */}
          {expandido && userRole === 'ADMIN' && (
            <View style={styles.dropdownContainer}>
              {['Todas', ...(filiaisDb || [])].map((f, index) => {
                const isActive = filialAtiva === f;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => selecionarFilial(f)}
                    style={[
                      styles.dropdownItem, 
                      isActive && styles.dropdownItemActive,
                      index === 0 && { marginTop: 4 }, // Espaçamento extra no topo
                      index === (filiaisDb?.length || 0) && { marginBottom: 4 } // Espaçamento extra no fundo
                    ]}
                  >
                    <MaterialCommunityIcons 
                      name={isActive ? "radiobox-marked" : "radiobox-blank"} 
                      size={18} 
                      color={isActive ? '#059669' : 'rgba(255,255,255,0.6)'} 
                    />
                    <Text style={[
                      styles.dropdownItemText, 
                      isActive && styles.dropdownItemTextActive
                    ]}>
                      {f === 'Todas' ? 'Visão Global Integrada' : f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Itens de Navegação Padrão */}
        <View style={{ paddingTop: 5 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      
      {/* Rodapé / Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <MaterialCommunityIcons name="logout" size={20} color="#ffffff" />
        <Text style={styles.logoutText}>Encerrar Sessão</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 25, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  logoBox: { backgroundColor: '#ffffff', padding: 6, borderRadius: 8 },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900', letterSpacing: -1 },
  profileSection: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 25 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  avatarText: { color: '#059669', fontSize: 22, fontWeight: '900' },
  profileInfo: { marginLeft: 15, flex: 1 },
  profileName: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  profileRole: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  /* Estilos do Seletor Melhorado */
  lojaSelectorContainer: { paddingHorizontal: 15, marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  selectorLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 8, marginLeft: 5 },
  
  selectorButton: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  selectorButtonOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.2)', 
  },
  selectorValueText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, flex: 1 },
  
  dropdownContainer: { 
    backgroundColor: 'rgba(0,0,0,0.15)', 
    borderBottomLeftRadius: 10, 
    borderBottomRightRadius: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: 0
  },
  dropdownItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 10, 
    borderRadius: 8, 
    marginBottom: 2 
  },
  dropdownItemActive: { 
    backgroundColor: '#ffffff',
    elevation: 2
  },
  dropdownItemText: { 
    color: '#cbd5e1', // Cor do texto inativo baseada no App.css
    fontSize: 13, 
    fontWeight: '600', 
    marginLeft: 10,
    flex: 1
  },
  dropdownItemTextActive: {
    color: '#059669',
    fontWeight: 'bold'
  },

  logoutBtn: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.05)' },
  logoutText: { color: '#ffffff', fontWeight: 'bold' }
});