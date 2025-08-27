const apiUrl = import.meta.env.VITE_BASE_URL;

if (!apiUrl) {
  throw new Error("A variável de ambiente VITE_API_BASE_URL não está definida. Verifique seu arquivo .env");
}

export const API_BASE_URL = apiUrl;