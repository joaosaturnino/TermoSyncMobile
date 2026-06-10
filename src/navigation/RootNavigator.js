import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importação das Telas
import LoginScreen from '../screens/LoginScreen';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{ 
        headerShown: false, // Esconde o cabeçalho padrão para mantermos o nosso design Cyber
        animation: 'fade'   // Animação suave ao fazer login
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}