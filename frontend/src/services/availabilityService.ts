import { api } from './api'
import type { Availability, CreateAvailabilityRequest, UpdateAvailabilityRequest, PaginatedAvailabilitiesResponse } from '../types/availability'

export const availabilityService = {
  // Listar todas as disponibilidades
  async getAllAvailabilities(params?: {
    chairId?: number
    dayOfWeek?: number
    isActive?: boolean
    offset?: number
    limit?: number
  }): Promise<PaginatedAvailabilitiesResponse> {
    // Converter camelCase para snake_case
    const convertedParams: any = {}
    if (params?.chairId !== undefined) convertedParams.chair_id = params.chairId
    if (params?.dayOfWeek !== undefined) convertedParams.day_of_week = params.dayOfWeek
    if (params?.isActive !== undefined) convertedParams.is_active = params.isActive
    if (params?.offset !== undefined) convertedParams.offset = params.offset
    if (params?.limit !== undefined) convertedParams.limit = params.limit
    
    const response = await api.get('/api/availabilities', { params: convertedParams })
    return response.data
  },

  // Buscar disponibilidade por ID
  async getAvailabilityById(id: number): Promise<Availability> {
    const response = await api.get(`/api/availabilities/${id}`)
    return response.data
  },

  // Buscar disponibilidades por cadeira
  async getAvailabilitiesByChair(chairId: number): Promise<Availability[]> {
    const response = await api.get(`/api/availabilities/chair/${chairId}`)
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
    const response = await api.get(`/api/availabilities/chair/${params.chairId}/slots`, {
      params: { date: params.date }
    })
    return response.data
  },

  // Criar nova disponibilidade (admin)
  async createAvailability(data: CreateAvailabilityRequest): Promise<Availability> {
    const response = await api.post('/api/availabilities', data)
    return response.data
  },

  // Criar múltiplas disponibilidades (admin) - Nova funcionalidade
  async createMultipleAvailabilities(data: {
    chair_id: number
    selected_days: number[]
    start_times: string[]
    end_times: string[]
    valid_to?: string
    is_active: boolean
  }): Promise<{
    message: string
    created_count: number
    availabilities: Availability[]
  }> {
    const response = await api.post('/api/availabilities/bulk', data)
    return response.data
  },

  // Atualizar disponibilidade (admin)
  async updateAvailability(id: number, data: UpdateAvailabilityRequest): Promise<Availability> {
    const response = await api.put(`/api/availabilities/${id}`, data)
    return response.data
  },

  // Deletar disponibilidade (admin)
  async deleteAvailability(id: number): Promise<void> {
    await api.delete(`/api/availabilities/${id}`)
  },

  // Ativar disponibilidade (admin)
  async activateAvailability(id: number): Promise<Availability> {
    const response = await api.post(`/api/availabilities/${id}/activate`)
    return response.data
  },

  // Desativar disponibilidade (admin)
  async deactivateAvailability(id: number): Promise<Availability> {
    const response = await api.post(`/api/availabilities/${id}/deactivate`)
    return response.data
  },

  // Definir período de validade (admin)
  async setValidityPeriod(id: number, data: {
    validFrom?: string
    validTo?: string
  }): Promise<Availability> {
    const response = await api.put(`/api/availabilities/${id}/validity`, data)
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
    const response = await api.get('/api/availabilities/stats')
    return response.data
  }
} 