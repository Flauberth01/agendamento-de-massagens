import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { addHours, isAfter, isBefore, differenceInHours } from 'date-fns'
import type { Booking } from '../types/booking'

interface UseBookingNotificationsProps {
  bookings: Booking[]
  onShowReminder: (booking: Booking) => void
}

export const useBookingNotifications = ({ bookings, onShowReminder }: UseBookingNotificationsProps) => {
  const [notifications, setNotifications] = useState<{
    upcoming: Booking[]
    overdue: Booking[]
    reminders: Booking[]
  }>({
    upcoming: [],
    overdue: [],
    reminders: []
  })

  useEffect(() => {
    const now = new Date()
    const upcomingBookings = bookings.filter(booking => {
      const bookingTime = new Date(booking.start_time)
      return booking.status === 'agendado' && isAfter(bookingTime, now)
    })

    const overdueBookings = bookings.filter(booking => {
      const bookingTime = new Date(booking.start_time)
      return booking.status === 'agendado' && isBefore(bookingTime, now)
    })

    const reminderBookings = upcomingBookings.filter(booking => {
      const bookingTime = new Date(booking.start_time)
      const hoursUntilBooking = differenceInHours(bookingTime, now)
      // Mostrar lembrete 24h antes e 1h antes
      return hoursUntilBooking <= 24 && hoursUntilBooking > 0
    })

    setNotifications({
      upcoming: upcomingBookings,
      overdue: overdueBookings,
      reminders: reminderBookings
    })

    // Mostrar notificações automáticas
    if (reminderBookings.length > 0) {
      const nextBooking = reminderBookings[0]
      const hoursUntilBooking = differenceInHours(new Date(nextBooking.start_time), now)
      
      if (hoursUntilBooking <= 1) {
        toast.info('Sessão em 1 hora!', {
          description: `Sua sessão está agendada para ${new Date(nextBooking.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        })
      } else if (hoursUntilBooking <= 24) {
        toast.info('Lembrete de agendamento', {
          description: `Você tem uma sessão amanhã às ${new Date(nextBooking.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        })
      }
    }

    if (overdueBookings.length > 0) {
      toast.error('Sessões perdidas', {
        description: `Você tem ${overdueBookings.length} sessão(ões) que não foram realizadas.`
      })
    }
  }, [bookings, onShowReminder])

  const canCancelBooking = (booking: Booking): boolean => {
    const now = new Date()
    const bookingTime = new Date(booking.start_time)
    const threeHoursBefore = addHours(bookingTime, -3)
    
    return booking.status === 'agendado' && isAfter(now, threeHoursBefore)
  }

  const getCancellationDeadline = (booking: Booking): Date => {
    const bookingTime = new Date(booking.start_time)
    return addHours(bookingTime, -3)
  }

  const getTimeUntilBooking = (booking: Booking): string => {
    const now = new Date()
    const bookingTime = new Date(booking.start_time)
    const diffInHours = differenceInHours(bookingTime, now)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((bookingTime.getTime() - now.getTime()) / (1000 * 60))
      return `${diffInMinutes} minutos`
    } else if (diffInHours < 24) {
      return `${diffInHours} horas`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} dias`
    }
  }

  return {
    notifications,
    canCancelBooking,
    getCancellationDeadline,
    getTimeUntilBooking
  }
} 