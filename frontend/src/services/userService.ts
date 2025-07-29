import { api } from './api'
import type { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserListResponse, 
  UserApprovalRequest,
  UserRejectionRequest
} from '../types/user'

export const userService = {
  // Listar todos os usuários (admin)
  async getAllUsers(params?: {
    role?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<UserListResponse> {
    const response = await api.get('/api/users', { params })
    return response.data
  },

  // Buscar usuário por ID
  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/api/users/${id}`)
    return response.data.data
  },

  // Buscar perfil do usuário logado
  // TODO: Implementar endpoint /users/me no backend
  async getCurrentUser(): Promise<User> {
    throw new Error('Endpoint /users/me não implementado no backend')
  },

  // Atualizar perfil do usuário logado
  // TODO: Implementar endpoint /users/me no backend
  async updateCurrentUser(_data: Partial<UpdateUserRequest>): Promise<User> {
    throw new Error('Endpoint /users/me não implementado no backend')
  },

  // Criar usuário (admin)
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await api.post('/api/users', data)
    return response.data
  },

  // Atualizar usuário (admin)
  async updateUser(id: number, data: Partial<UpdateUserRequest>): Promise<User> {
    const response = await api.put(`/api/users/${id}`, data)
    return response.data
  },

  // Deletar usuário (admin)
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/api/users/${id}`)
  },

  // Aprovar usuário (admin/atendente)
  async approveUser(id: number, data: UserApprovalRequest): Promise<User> {
    const response = await api.post(`/api/users/${id}/approve`, data)
    return response.data
  },

  // Rejeitar usuário (admin/atendente)
  async rejectUser(id: number, data: UserRejectionRequest): Promise<User> {
    const response = await api.post(`/api/users/${id}/reject`, data)
    return response.data
  },

  // Buscar usuários pendentes de aprovação
  async getPendingUsers(): Promise<User[]> {
    const response = await api.get('/api/users/pending')
    const data = response.data.data
    // Se data for um objeto vazio ou não for um array, retorna array vazio
    return Array.isArray(data) ? data : []
  },

  // Buscar estatísticas de usuários
  // TODO: Implementar endpoint /users/stats no backend
  async getUserStats(): Promise<{
    total: number
    active: number
    pending: number
    rejected: number
    byRole: {
      usuario: number
      atendente: number
      admin: number
    }
  }> {
    throw new Error('Endpoint /users/stats não implementado no backend')
  },

  // Alterar senha do usuário logado
  // TODO: Implementar endpoint /users/change-password no backend
  async changePassword(_data: {
    currentPassword: string
    newPassword: string
  }): Promise<void> {
    throw new Error('Endpoint /users/change-password não implementado no backend')
  },

  // Solicitar redefinição de senha
  // TODO: Implementar endpoint /users/forgot-password no backend
  async requestPasswordReset(_email: string): Promise<void> {
    throw new Error('Endpoint /users/forgot-password não implementado no backend')
  },

  // Redefinir senha com token
  // TODO: Implementar endpoint /users/reset-password no backend
  async resetPassword(_data: {
    token: string
    newPassword: string
  }): Promise<void> {
    throw new Error('Endpoint /users/reset-password não implementado no backend')
  },

  // Verificar se CPF já existe
  async checkCPFExists(cpf: string): Promise<{ exists: boolean }> {
    const response = await api.get(`/api/users/check-cpf?cpf=${encodeURIComponent(cpf)}`)
    return response.data
  },

  // Verificar se email já existe
  // TODO: Implementar endpoint /users/check-email no backend
  async checkEmailExists(_email: string): Promise<{ exists: boolean }> {
    throw new Error('Endpoint /users/check-email não implementado no backend')
  }
} 