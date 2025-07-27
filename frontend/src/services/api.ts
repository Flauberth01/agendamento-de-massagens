import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Configuração da aplicação
const APP_CONFIG = {
  name: 'Sistema de Agendamento',
  version: '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
} as const;

// Tipos para respostas da API
export interface ApiError {
  message: string;
  error?: string;
  status?: number;
}

// Configuração base do Axios
const api: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar renovar o token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${APP_CONFIG.apiUrl}/api/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { token } = response.data;
          localStorage.setItem('access_token', token);

          // Repetir a requisição original com o novo token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Se o refresh falhar, limpar tokens e redirecionar para login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Redirecionar para login se estiver em uma página protegida
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Funções auxiliares para tratamento de erros
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Erro da API com resposta
    return {
      message: error.response.data?.message || 'Erro na requisição',
      error: error.response.data?.error,
      status: error.response.status,
    };
  } else if (error.request) {
    // Erro de rede
    return {
      message: 'Erro de conexão. Verifique sua internet.',
      error: 'NETWORK_ERROR',
    };
  } else {
    // Erro genérico
    return {
      message: error.message || 'Erro desconhecido',
      error: 'UNKNOWN_ERROR',
    };
  }
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

// Função para obter o token atual
export const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Função para obter o usuário atual
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// Função para limpar dados de autenticação
export const clearAuth = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Função para salvar dados de autenticação
export const saveAuth = (token: string, refreshToken: string, user: any): void => {
  localStorage.setItem('access_token', token);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
};

export { api };
export default api; 