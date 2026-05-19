import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ─── IMPORTANT: Change this to your computer's IP when testing on a real device ───
// For emulator: 'http://10.0.2.2:5000/api'  (Android emulator)
// For real device: 'http://YOUR_LOCAL_IP:5000/api'  e.g. 'http://192.168.1.5:5000/api'
export const API_BASE_URL = 'http://10.166.54.9:5000/api';

const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    }
    return Promise.reject(err);
  }
);

export default api;
