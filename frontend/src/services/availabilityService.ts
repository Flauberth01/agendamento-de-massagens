import { api } from './api'
import type { Availability, CreateAvailabilityRequest, UpdateAvailabilityRequest } from '../types/availability'

export const availabilityService = {
  // Listar todas as disponibilidades
  async getAllAvailabilities(params?: {
    chairId?: number
    dayOfWeek?: number
    isActive?: boolean
    page?: number
    limit?: number
  }): Promise<{
    data: Availability[]
    pagination: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await api.get('/availabilities', { params })
    return response.data
  },

  // Buscar disponibilidade por ID
  async getAvailabilityById(id: number): Promise<Availability> {
    const response = await api.get(`/availabilities/${id}`)
    return response.data
  },

  // Buscar disponibilidades por cadeira
  async getAvailabilitiesByChair(chairId: number): Promise<Availability[]> {
    const response = await api.get(`/availabilities/chair/${chairId}`)
    return response.data
  },

  // Buscar slots disponíveis para uma cadeira
  async getAvailableSlots(params: {
    chairId: number
    date: string
  }): Promise<{
    chairId: number
    date: string
    timeSlots: Array<{
      startTime: string
      endTime: string
      available: boolean
      bookingId?: number
    }>
  }> {
    const response = await api.get(`/availabilities/chair/${params.chairId}/slots`, {
      params: { date: params.date }
    })
    return response.data
  },

  // Criar nova disponibilidade (admin)
  async createAvailability(data: CreateAvailabilityRequest): Promise<Availability> {
    const response = await api.post('/availabilities', data)
    return response.data
  },

  // Atualizar disponibilidade (admin)
  async updateAvailability(id: number, data: UpdateAvailabilityRequest): Promise<Availability> {
    const response = await api.put(`/availabilities/${id}`, data)
    return response.data
  },

  // Deletar disponibilidade (admin)
  async deleteAvailability(id: number): Promise<void> {
    await api.delete(`/availabilities/${id}`)
  },

  // Ativar disponibilidade (admin)
  async activateAvailability(id: number): Promise<Availability> {
    const response = await api.post(`/availabilities/${id}/activate`)
    return response.data
  },

  // Desativar disponibilidade (admin)
  async deactivateAvailability(id: number): Promise<Availability> {
    const response = await api.post(`/availabilities/${id}/deactivate`)
    return response.data
  },

  // Definir período de validade (admin)
  async setValidityPeriod(id: number, data: {
    validFrom?: string
    validTo?: string
  }): Promise<Availability> {
    const response = await api.put(`/availabilities/${id}/validity`, data)
    return response.data
  },

  // Buscar estatísticas de disponibilidade
  async getAvailabilityStats(): Promise<{
    total: number
    active: number
    inactive: number
    byDay: {
      [key: number]: number
    }
  }> {
    const response = await api.get('/availabilities/stats')
    return response.data
  }
} 