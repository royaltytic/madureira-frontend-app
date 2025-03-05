// Em seu arquivo de configuração da API, por exemplo, services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", 
});

api.interceptors.request.use((config) => {
  const userData = localStorage.getItem("userData");
  if (userData) {
    const { token } = JSON.parse(userData);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
