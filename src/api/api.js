import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import io from 'socket.io-client';

// 🔴 COLOCA AQUI O IP QUE APARECE NO TEU TERMINAL DO EXPO
// Copia apenas os números (192.168...) e deixa a porta :3000 no final
const BASE_URL = 'http://192.168.200.27:3000'; 

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, 
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

// Mantemos as duas formas para não quebrar os imports das outras telas
export default api;