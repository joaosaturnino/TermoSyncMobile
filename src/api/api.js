import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import io from 'socket.io-client';

// 🔴 CONFIGURAÇÃO DO IP (Escolhe a opção correta para o teu caso)

// OPÇÃO A: Se estiveres a usar o EMULADOR DO ANDROID STUDIO
// const BASE_URL = 'http://10.0.2.2:3000';

// OPÇÃO B: Se estiveres a usar o SIMULADOR DO iOS
// const BASE_URL = 'http://localhost:3000';

// OPÇÃO C: Se estiveres a usar o EXPO GO num TELEMÓVEL FÍSICO (Android ou iPhone)
const BASE_URL = 'http://10.98.173.164:3000'; // Sem espaços!

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, 
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