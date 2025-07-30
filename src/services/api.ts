import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, 
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