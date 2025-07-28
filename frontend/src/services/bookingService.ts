import { api } from './api'
import type { CreateBookingRequest, Booking, BookingListResponse } from '../types/booking'

export const bookingService = {
  // Listar agendamentos do usuário
  async getUserBookings(params?: {
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<BookingListResponse> {
    const response = await api.get('/api/bookings/user', { params })
    return response.data
  },

  // Listar todos os agendamentos (admin/atendente)
  async getAllBookings(params?: {
    status?: string
    startDate?: string
    endDate?: string
    userId?: number
    chairId?: number
    page?: number
    limit?: number
  }): Promise<BookingListResponse> {
    const response = await api.get('/api/bookings', { params })
    return response.data
  },

  // Buscar agendamento por ID
  async getBookingById(id: number): Promise<Booking> {
    const response = await api.get(`/api/bookings/${id}`)
    return response.data
  },

  // Criar novo agendamento
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await api.post('/api/bookings', data)
    return response.data
  },

  // Atualizar agendamento
  async updateBooking(id: number, data: Partial<CreateBookingRequest>): Promise<Booking> {
    const response = await api.put(`/api/bookings/${id}`, data)
    return response.data
  },

  // Reagendar agendamento
  async rescheduleBooking(id: number, data: { start_time: Date; chair_id?: number }): Promise<Booking> {
    const response = await api.put(`/api/bookings/${id}/reschedule`, data)
    return response.data
  },

  // Cancelar agendamento
  async cancelBooking(id: number, reason?: string): Promise<Booking> {
    const response = await api.patch(`/api/bookings/${id}/cancel`, { reason })
    return response.data
  },

  // Confirmar agendamento (atendente)
  async confirmBooking(id: number): Promise<Booking> {
    const response = await api.patch(`/api/bookings/${id}/confirm`)
    return response.data
  },

  // Marcar presença (atendente)
  async markAttendance(id: number, attended: boolean): Promise<Booking> {
    const response = await api.patch(`/api/bookings/${id}/attendance`, { attended })
    return response.data
  },

  // Buscar disponibilidade de cadeiras
  async getChairAvailability(params: {
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
    const response = await api.get('/api/bookings/availability', { params })
    return response.data
  },

  // Buscar estatísticas de agendamentos
  async getBookingStats(params?: {
    startDate?: string
    endDate?: string
    userId?: number
  }): Promise<{
    total: number
    completed: number
    cancelled: number
    pending: number
    upcoming: number
  }> {
    const response = await api.get('/api/bookings/stats', { params })
    return response.data
  },

  // Buscar agendamentos de hoje (atendente)
  async getTodayBookings(): Promise<Booking[]> {
    const response = await api.get('/api/bookings/today')
    return response.data
  },

  // Buscar próximos agendamentos do usuário
  async getUpcomingBookings(limit: number = 5): Promise<Booking[]> {
    const response = await api.get('/api/bookings/upcoming', { params: { limit } })
    return response.data
  },

  // Buscar histórico de agendamentos do usuário
  async getBookingHistory(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<BookingListResponse> {
    const response = await api.get('/api/bookings/history', { params })
    return response.data
  },

  // Buscar estatísticas do sistema (admin)
  async getSystemStats(): Promise<{
    total_users: number
    total_chairs: number
    total_bookings: number
    monthly_bookings: number
    attendance_rate: number
    occupancy_rate: number
    cancellations: number
  }> {
    const response = await api.get('/api/bookings/system-stats')
    return response.data
  },

  // Buscar estatísticas do atendente
  async getAttendantStats(): Promise<{
    total_sessions: number
    attendance_rate: number
    no_shows: number
    avg_session_duration: number
    today_sessions: number
    confirmed_sessions: number
    pending_sessions: number
  }> {
    const response = await api.get('/api/bookings/attendant-stats')
    return response.data
  },

  // Buscar estatísticas do usuário
  async getUserStats(userId?: number): Promise<{
    total: number
    completed: number
    cancelled: number
    pending: number
    upcoming: number
    attendance_rate: number
  }> {
    const response = await api.get('/api/bookings/user-stats', { 
      params: userId ? { userId } : undefined 
    })
    return response.data
  },

  // Buscar opções de reagendamento (novo endpoint)
  async getRescheduleOptions(bookingId: number, date: string): Promise<{
    booking_id: number
    current_booking: Booking
    available_slots: string[]
    date: string
    chair_id: number
    chair_name: string
  }> {
    const response = await api.get(`/api/bookings/reschedule-options/${bookingId}`, {
      params: { date }
    })
    return response.data
  },

  // Reagendar apenas data e horário (novo endpoint)
  async rescheduleBookingDateTime(bookingId: number, startTime: Date): Promise<{
    message: string
    data: {
      id: number
      user_id: number
      chair_id: number
      start_time: string
      end_time: string
      status: string
      notes: string
      updated_at: string
    }
  }> {
    const response = await api.put(`/api/bookings/reschedule-datetime/${bookingId}`, {
      start_time: startTime.toISOString()
    })
    return response.data
  }
} 