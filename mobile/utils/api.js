import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// REPLACE THIS WITH YOUR LOCAL IP ADDRESS (e.g., http://192.168.1.10:3600)
const BASE_URL = 'https://callens.vercel.app/api'; 

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
