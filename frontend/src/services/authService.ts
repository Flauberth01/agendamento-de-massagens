import { api } from './api'
import type { 
  LoginForm, 
  RegisterStep1Form, 
  RegisterStep2Form, 
  AuthResponse, 
  RefreshTokenResponse 
} from '@/types/user'

class AuthService {
  // Login
  async login(data: LoginForm): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data)
    return response.data
  }

  // Registro - Etapa 1
  async registerStep1(data: RegisterStep1Form): Promise<{ message: string; data: any }> {
    const response = await api.post('/api/auth/register/step1', data)
    return response.data
  }

  // Registro - Etapa 2
  async registerStep2(data: RegisterStep2Form): Promise<{ message: string; data: any }> {
    const response = await api.post('/api/auth/register/step2', data)
    return response.data
  }

  // Registro completo (alternativa)
  async register(data: RegisterStep1Form & RegisterStep2Form): Promise<{ message: string; data: any }> {
    const response = await api.post('/api/auth/register', data)
    return response.data
  }

  // Logout
  async logout(): Promise<{ message: string }> {
    const response = await api.post('/api/auth/logout')
    return response.data
  }

  // Refresh Token
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/api/auth/refresh')
    return response.data
  }

  // Verificar se está autenticado
  async checkAuth(): Promise<{ user: any; isAuthenticated: boolean }> {
    try {
      const response = await api.get('/api/auth/me')
      return {
        user: response.data,
        isAuthenticated: true
      }
    } catch (error) {
      return {
        user: null,
        isAuthenticated: false
      }
    }
  }
}

export const authService = new AuthService() 