import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginForm, CreateUserRequest } from '../types';
import api, { saveAuth, clearAuth, handleApiError } from '../services/api';

interface AuthState {
  // Estado
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Ações
  login: (credentials: LoginForm) => Promise<boolean>;
  register: (userData: CreateUserRequest) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (credentials: LoginForm) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post('/api/auth/login', credentials);
          const { token, refresh_token, user } = response.data;

          // Salvar dados de autenticação
          saveAuth(token, refresh_token, user);

          set({
            user,
            token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const apiError = handleApiError(error);
          set({
            isLoading: false,
            error: apiError.message,
          });
          return false;
        }
      },

      // Registro
      register: async (userData: CreateUserRequest) => {
        set({ isLoading: true, error: null });

        try {
          await api.post('/api/auth/register', userData);
          
          set({
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const apiError = handleApiError(error);
          set({
            isLoading: false,
            error: apiError.message,
          });
          return false;
        }
      },

      // Logout
      logout: async () => {
        try {
          // Tentar fazer logout no servidor
          await api.post('/api/auth/logout');
        } catch (error) {
          // Ignorar erros de logout
        } finally {
          // Limpar dados locais
          clearAuth();
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Refresh da autenticação
      refreshAuth: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          return false;
        }

        try {
          const response = await api.post('/api/auth/refresh', {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { token } = response.data;
          
          // Atualizar token
          localStorage.setItem('access_token', token);
          
          set({
            token,
            isAuthenticated: true,
          });

          return true;
        } catch (error) {
          // Se o refresh falhar, fazer logout
          get().logout();
          return false;
        }
      },

      // Definir usuário
      setUser: (user: User) => {
        set({ user });
      },

      // Definir erro
      setError: (error: string | null) => {
        set({ error });
      },

      // Limpar erro
      clearError: () => {
        set({ error: null });
      },

      // Definir loading
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hooks auxiliares
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    ...store,
    // Verificar se o usuário tem permissão
    hasPermission: (permission: string) => {
      const { user } = store;
      if (!user) return false;

      switch (permission) {
        case 'manage_users':
          return user.role === 'atendente' || user.role === 'admin';
        case 'manage_chairs':
          return user.role === 'admin';
        case 'manage_availability':
          return user.role === 'admin';
        case 'approve_attendants':
          return user.role === 'admin';
        case 'view_all_bookings':
          return user.role === 'atendente' || user.role === 'admin';
        case 'manage_bookings':
          return user.role === 'atendente' || user.role === 'admin';
        default:
          return false;
      }
    },

    // Verificar se o usuário é admin
    isAdmin: () => {
      return store.user?.role === 'admin';
    },

    // Verificar se o usuário é atendente
    isAttendant: () => {
      return store.user?.role === 'atendente';
    },

    // Verificar se o usuário é usuário comum
    isUser: () => {
      return store.user?.role === 'usuario';
    },

    // Verificar se o usuário está aprovado
    isApproved: () => {
      return store.user?.status === 'aprovado';
    },
  };
}; 