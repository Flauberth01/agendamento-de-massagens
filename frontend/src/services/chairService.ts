import { api } from './api'
import type { Chair, CreateChairRequest, ChairListResponse } from '../types/chair'

export const chairService = {
  // Listar todas as cadeiras
  async getAllChairs(params?: {
    status?: 'ativa' | 'inativa'
    location?: string
    page?: number
    limit?: number
  }): Promise<ChairListResponse> {
    const response = await api.get('/api/chairs', { params })
    return response.data
  },

  // Buscar cadeira por ID
  async getChairById(id: number): Promise<Chair> {
    const response = await api.get(`/api/chairs/${id}`)
    return response.data
  },

  // Criar nova cadeira (admin)
  async createChair(data: CreateChairRequest): Promise<Chair> {
    const response = await api.post('/api/chairs', data)
    return response.data
  },

  // Atualizar cadeira (admin)
  async updateChair(id: number, data: Partial<CreateChairRequest>): Promise<Chair> {
    const response = await api.put(`/api/chairs/${id}`, data)
    return response.data
  },

  // Ativar/desativar cadeira (admin)
  async toggleChairStatus(id: number, active: boolean): Promise<Chair> {
    const response = await api.patch(`/api/chairs/${id}/status`, { active })
    return response.data
  },

  // Deletar cadeira (admin)
  async deleteChair(id: number): Promise<void> {
    await api.delete(`/api/chairs/${id}`)
  },

  // Buscar cadeiras disponíveis para uma data/horário
  async getAvailableChairs(params: {
    date: string
    startTime: string
    endTime: string
  }): Promise<Chair[]> {
    const response = await api.get('/api/chairs/available', { params })
    return response.data
  },

  // Buscar estatísticas de cadeiras
  async getChairStats(): Promise<{
    total: number
    active: number
    inactive: number
    utilizationRate: number
  }> {
    const response = await api.get('/api/chairs/stats')
    return response.data
  },

  // Buscar cadeiras com agendamentos para hoje
  async getChairsWithTodayBookings(): Promise<Array<Chair & {
    todayBookings: number
  }>> {
    const response = await api.get('/api/chairs/today-bookings')
    return response.data
  }
} 