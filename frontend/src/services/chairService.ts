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
    try {
      const response = await api.get('/api/chairs', { params })
      console.log('API response:', response.data);
      
      // Check if response.data.data exists and has the expected structure
      if (response.data && response.data.data && response.data.data.chairs) {
        return response.data.data;
      } else {
        console.error('Unexpected API response structure:', response.data);
        // Return empty response structure
        return {
          chairs: [],
          total: 0,
          limit: 10,
          offset: 0
        };
      }
    } catch (error) {
      console.error('Error fetching chairs:', error);
      // Return empty response structure on error
      return {
        chairs: [],
        total: 0,
        limit: 10,
        offset: 0
      };
    }
  },

  // Buscar cadeira por ID
  async getChairById(id: number): Promise<Chair> {
    try {
      const response = await api.get(`/api/chairs/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching chair by ID:', error);
      throw error;
    }
  },

  // Criar nova cadeira (admin)
  async createChair(data: CreateChairRequest): Promise<Chair> {
    const response = await api.post('/api/chairs', data)
    return response.data.data
  },

  // Atualizar cadeira (admin)
  async updateChair(id: number, data: Partial<CreateChairRequest>): Promise<Chair> {
    const response = await api.put(`/api/chairs/${id}`, data)
    return response.data.data
  },

  // Alternar status da cadeira (admin) - ativa/inativa
  async toggleChairStatus(id: number): Promise<{
    message: string
    data: {
      chair_id: number
      new_status: string
      previous_status: string
    }
  }> {
    const response = await api.patch(`/api/chairs/${id}/toggle-status`)
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
    return response.data.data
  },

  // Buscar estatísticas de cadeiras
  async getChairStats(): Promise<{
    total: number
    active: number
    inactive: number
    utilizationRate: number
  }> {
    const response = await api.get('/api/chairs/stats')
    return response.data.data
  },

  // Buscar cadeiras com agendamentos para hoje
  async getChairsWithTodayBookings(): Promise<Array<Chair & {
    todayBookings: number
  }>> {
    const response = await api.get('/api/chairs/today-bookings')
    return response.data.data
  },

  // Buscar agendamentos de uma cadeira específica
  async getChairBookings(chairId: number, params?: {
    limit?: number
    offset?: number
  }): Promise<{
    bookings: Array<{
      id: number
      user_name: string
      date: string
      time_slot: string
      status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido' | 'falta'
    }>
    total: number
    limit: number
    offset: number
  }> {
    try {
      const response = await api.get(`/api/bookings/chair/${chairId}`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching chair bookings:', error);
      throw error;
    }
  }
} 