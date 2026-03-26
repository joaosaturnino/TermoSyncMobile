import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { io } from 'socket.io-client';

// Troque pelo IP da sua máquina na rede Wi-Fi!
export const BASE_URL = 'http://10.98.173.164:3001'; 
export const API_URL = `${BASE_URL}/api`;
export const SOCKET_URL = BASE_URL;

export const api = axios.create({
  baseURL: API_URL,
});

// INTERCEPTOR: A Magia acontece aqui!
// Antes de QUALQUER requisição sair do telemóvel, ele vai buscar o token e anexa ao Cabeçalho.
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getSocket = () => {
  return io(SOCKET_URL);
};