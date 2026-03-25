import axios from 'axios';
import { io } from 'socket.io-client';

// Troque pelo IP da sua máquina na rede Wi-Fi!
export const BASE_URL = 'http://192.168.200.27:3001'; 
export const API_URL = `${BASE_URL}/api`;

export const api = axios.create({
  baseURL: API_URL,
});

export const getSocket = () => {
  return io(BASE_URL);
};

// Paleta de cores centralizada
export const theme = {
  primary: '#059669',
  secondary: '#10b981',
  bg: '#f8fafc',
  card: '#ffffff',
  textMain: '#0f172a',
  textMuted: '#64748b',
  danger: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#38bdf8',
  border: '#e2e8f0',
};