import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import io from 'socket.io-client';

// 🔴 ATENÇÃO: Substitui pelos teus números (ex: 'http://192.168.1.100:3000')
// 💡 DICA: Se estiveres a testar no Emulador do PC (e não num telemóvel real), usa 'http://10.0.2.2:3000'
const BASE_URL = 'http://10.98.173.164:3000'; 

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
  } catch (error) {
    console.log('Erro ao anexar token:', error);
  }
  return config;
});

let socket;
export const getSocket = () => {
  if (!socket) {
    socket = io(BASE_URL); 
  }
  return socket;
};