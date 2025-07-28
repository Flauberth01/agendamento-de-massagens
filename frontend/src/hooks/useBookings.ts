import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '../services/bookingService'
import { availabilityService } from '../services/availabilityService'
import type { CreateBookingRequest } from '../types/booking'
import { toast } from 'sonner'
import { useAuth } from './useAuth'

export const useBookings = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Buscar agendamentos do usuário
  const useUserBookings = () => {
    return useQuery({
      queryKey: ['user-bookings'],
      queryFn: async () => {
        // Se for atendente ou admin, buscar todos os agendamentos
        // Se for usuário regular, buscar apenas os próprios agendamentos
        if (user?.role === 'atendente' || user?.role === 'admin') {
          console.log('Usuário é atendente/admin - buscando todos os agendamentos')
          const response = await bookingService.getAllBookings()
          return response
        } else {
          console.log('Usuário é regular - buscando apenas seus agendamentos')
          const response = await bookingService.getUserBookings()
          return response
        }
      },
      enabled: !!user,
    })
  }

  // Buscar todos os agendamentos (admin/atendente)
  const useAllBookings = (params?: {
    status?: string
    startDate?: string
    endDate?: string
    userId?: number
    chairId?: number
    page?: number
    limit?: number
  }) => {
    return useQuery({
      queryKey: ['all-bookings', params],
      queryFn: () => bookingService.getAllBookings(params),
      staleTime: 2 * 60 * 1000, // 2 minutos
    })
  }

  // Buscar agendamento por ID
  const useBookingById = (id: number) => {
    return useQuery({
      queryKey: ['booking', id],
      queryFn: () => bookingService.getBookingById(id),
      enabled: !!id,
    })
  }

  // Buscar próximos agendamentos
  const useUpcomingBookings = (limit: number = 5) => {
    return useQuery({
      queryKey: ['upcoming-bookings', limit],
      queryFn: () => bookingService.getUpcomingBookings(limit),
      staleTime: 5 * 60 * 1000, // 5 minutos
    })
  }

  // Buscar agendamentos de hoje
  const useTodayBookings = () => {
    return useQuery({
      queryKey: ['today-bookings'],
      queryFn: () => bookingService.getTodayBookings(),
      staleTime: 1 * 60 * 1000, // 1 minuto
    })
  }

  // Buscar estatísticas de agendamentos
  const useBookingStats = (params?: {
    startDate?: string
    endDate?: string
    userId?: number
  }) => {
    return useQuery({
      queryKey: ['booking-stats', params],
      queryFn: () => bookingService.getBookingStats(params),
      staleTime: 10 * 60 * 1000, // 10 minutos
    })
  }

  // Buscar disponibilidade de cadeira
  const useChairAvailability = (params: {
    chairId: number
    date: string
  }) => {
    return useQuery({
      queryKey: ['chair-availability', params],
      queryFn: () => availabilityService.getAvailableSlots(params),
      enabled: !!params.chairId && !!params.date,
      staleTime: 1 * 60 * 1000, // 1 minuto
    })
  }

  // Criar agendamento
  const useCreateBooking = () => {
    return useMutation({
      mutationFn: (data: CreateBookingRequest) => bookingService.createBooking(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['booking-stats'] })
        toast.success('Agendamento criado com sucesso!')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao criar agendamento')
      },
    })
  }

  // Cancelar agendamento
  const useCancelBooking = () => {
    return useMutation({
      mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
        bookingService.cancelBooking(id, reason),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['booking-stats'] })
        toast.success('Agendamento cancelado com sucesso!')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao cancelar agendamento')
      },
    })
  }

  // Reagendar agendamento
  const useRescheduleBooking = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: { start_time: Date; chair_id?: number } }) =>
        bookingService.rescheduleBooking(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['booking-stats'] })
        toast.success('Agendamento reagendado com sucesso!')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao reagendar agendamento')
      },
    })
  }

  // Confirmar agendamento (atendente)
  const useConfirmBooking = () => {
    return useMutation({
      mutationFn: (id: number) => bookingService.confirmBooking(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['all-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['today-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['booking-stats'] })
        toast.success('Agendamento confirmado com sucesso!')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao confirmar agendamento')
      },
    })
  }

  // Marcar presença (atendente)
  const useMarkAttendance = () => {
    return useMutation({
      mutationFn: ({ id, attended }: { id: number; attended: boolean }) =>
        bookingService.markAttendance(id, attended),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['all-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['today-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['booking-stats'] })
        toast.success('Presença marcada com sucesso!')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao marcar presença')
      },
    })
  }

  return {
    useUserBookings,
    useAllBookings,
    useBookingById,
    useUpcomingBookings,
    useTodayBookings,
    useBookingStats,
    useChairAvailability,
    useCreateBooking,
    useCancelBooking,
    useRescheduleBooking,
    useConfirmBooking,
    useMarkAttendance,
  }
} 