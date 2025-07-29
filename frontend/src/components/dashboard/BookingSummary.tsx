import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  
  TrendingUp
} from 'lucide-react'
import type { Booking } from '../../types/booking'

interface BookingSummaryProps {
  bookings: Booking[]
  className?: string
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({ 
  bookings, 
  className = '' 
}) => {
  const stats = React.useMemo(() => {
    const now = new Date()
    
    const upcoming = bookings.filter(booking => 
      booking.status === 'agendado' && new Date(booking.start_time) > now
    )
    
    const completed = bookings.filter(booking => 
      booking.status === 'realizado'
    )
    
    const cancelled = bookings.filter(booking => 
      booking.status === 'cancelado'
    )
    
    const missed = bookings.filter(booking => 
      booking.status === 'falta'
    )
    
    const today = bookings.filter(booking => {
      const bookingDate = new Date(booking.start_time)
      const todayDate = new Date()
      return bookingDate.toDateString() === todayDate.toDateString()
    })
    
    const thisWeek = bookings.filter(booking => {
      const bookingDate = new Date(booking.start_time)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return bookingDate >= weekAgo
    })
    
    return {
      total: bookings.length,
      upcoming: upcoming.length,
      completed: completed.length,
      cancelled: cancelled.length,
      missed: missed.length,
      today: today.length,
      thisWeek: thisWeek.length
    }
  }, [bookings])

  const getCompletionRate = () => {
    if (stats.total === 0) return 0
    return Math.round((stats.completed / stats.total) * 100)
  }

  const getAttendanceRate = () => {
    const attended = stats.completed
    const totalScheduled = stats.completed + stats.missed
    if (totalScheduled === 0) return 0
    return Math.round((attended / totalScheduled) * 100)
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Total de Agendamentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Agendamentos realizados
          </p>
        </CardContent>
      </Card>

      {/* Próximos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próximos</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
          <p className="text-xs text-muted-foreground">
            Agendamentos futuros
          </p>
        </CardContent>
      </Card>

      {/* Concluídas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">
            {getCompletionRate()}% de conclusão
          </p>
        </CardContent>
      </Card>

      {/* Taxa de Presença */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Presença</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{getAttendanceRate()}%</div>
          <p className="text-xs text-muted-foreground">
            Taxa de comparecimento
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para mostrar estatísticas detalhadas
interface DetailedStatsProps {
  bookings: Booking[]
}

export const DetailedStats: React.FC<DetailedStatsProps> = ({ bookings }) => {
  const stats = React.useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.start_time)
      return bookingDate >= today
    })
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const weekBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.start_time)
      return bookingDate >= weekAgo
    })
    
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    
    const monthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.start_time)
      return bookingDate >= monthAgo
    })
    
    return {
      today: todayBookings.length,
      thisWeek: weekBookings.length,
      thisMonth: monthBookings.length
    }
  }, [bookings])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.today}</div>
          <p className="text-xs text-muted-foreground">
            Sessões agendadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
          <Clock className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.thisWeek}</div>
          <p className="text-xs text-muted-foreground">
            Sessões agendadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.thisMonth}</div>
          <p className="text-xs text-muted-foreground">
            Sessões agendadas
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 