import axios from "axios";
import { CLAVE_TOKEN } from "../utils/constants";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(CLAVE_TOKEN);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      
      localStorage.removeItem(CLAVE_TOKEN); 
    }
    return Promise.reject(error); 
  }
);

export default axiosClient;