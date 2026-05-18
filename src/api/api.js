import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import io from 'socket.io-client';

// 🔴 O IP do teu computador
const SOCKET_URL = 'http://192.168.137.23:3000'; 
const API_URL = 'http://192.168.137.23:3000/api'; // Repara que tem /api no final!

export const api = axios.create({
  baseURL: API_URL,
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
    socket = io(SOCKET_URL); 
  }
  return socket;
};

export default api;