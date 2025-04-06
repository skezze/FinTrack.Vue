import axios from 'axios';
import { host } from '@/enviroment';
import { getToken } from '@/helpers/auth';

const apiClient = axios.create({
  baseURL: host,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      if (!config.headers) {
          config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;