import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler'; // Obrigatório para o Drawer Navigator funcionar
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    // O AppProvider injeta o Token, Sockets, Tema e Dados em toda a aplicação
    <AppProvider>
      {/* O NavigationContainer gere as rotas e o histórico de navegação do telemóvel */}
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#059669" />
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}