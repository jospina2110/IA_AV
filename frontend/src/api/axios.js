import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api",
  timeout: 10000,
});

// Inyectar token JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log de errores en desarrollo
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;