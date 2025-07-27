import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useAuth } from '../../stores/authStore'
import { bookingService } from '../../services/bookingService'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Loader2,
  MapPin,
  User,
  CalendarDays,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { handleApiError } from '../../services/api'
import type { Booking } from '../../types/booking'

interface UserStats {
  totalBookings: number
  completedBookings: number
  upcomingBookings: number
  activeBookings: number
}

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  // Buscar agendamentos do usuário
  const { data: userBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: () => bookingService.getUserBookings(),
    staleTime: 1 * 60 * 1000,
  })

  const bookings = userBookings?.data || []

  // Calcular estatísticas
  const stats: UserStats = {
    totalBookings: bookings.length,
    completedBookings: bookings.filter(b => b.status === 'concluido').length,
    upcomingBookings: bookings.filter(b => b.status === 'agendado' || b.status === 'confirmado').length,
    activeBookings: bookings.filter(b => b.status === 'agendado' || b.status === 'confirmado').length
  }

  // Próximo agendamento
  const nextBooking = bookings
    .filter(b => b.status === 'agendado' || b.status === 'confirmado')
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0]

  // Histórico recente (últimos 3)
  const recentBookings = bookings
    .filter(b => b.status === 'concluido' || b.status === 'cancelado')
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 3)

  useEffect(() => {
    if (!bookingsLoading) {
      setIsLoading(false)
    }
  }, [bookingsLoading])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Agendado</Badge>
      case 'confirmado':
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmado</Badge>
      case 'concluido':
        return <Badge variant="default" className="bg-green-500 text-white">Concluído</Badge>
      case 'falta':
        return <Badge variant="destructive">Falta</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDateTime = (dateTime: Date) => {
    return format(dateTime, 'dd/MM, HH:mm', { locale: ptBR })
  }

  const formatDate = (dateTime: Date) => {
    return format(dateTime, 'dd/MM/yyyy', { locale: ptBR })
  }

  const handleNewBooking = () => {
    navigate('/users/booking')
  }

  const handleCancelBooking = (bookingId: number) => {
    navigate(`/users/booking?cancel=${bookingId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando seu dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header com saudação */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Olá, {user?.name}! 👋
        </h2>
        <p className="text-muted-foreground">
          Gerencie seus agendamentos e acompanhe suas sessões
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total de Sessões</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalBookings}</div>
            <p className="text-xs text-blue-700">
              Sessões realizadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.completedBookings}</div>
            <p className="text-xs text-green-700">
              Sessões finalizadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Próximas</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.upcomingBookings}</div>
            <p className="text-xs text-purple-700">
              Agendamentos futuros
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Ativas</CardTitle>
            <User className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.activeBookings}</div>
            <p className="text-xs text-orange-700">
              Sessões ativas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Próximo Agendamento */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Próximo Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!nextBooking ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum agendamento futuro
                </h3>
                <p className="text-muted-foreground mb-6">
                  Que tal agendar sua primeira sessão de massagem?
                </p>
                <Button onClick={handleNewBooking} size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Plus className="h-5 w-5 mr-2" />
                  Agendar Primeira Sessão
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold text-xl text-gray-900">{nextBooking.chair?.name}</div>
                    {getStatusBadge(nextBooking.status)}
                  </div>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>{nextBooking.chair?.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{formatDateTime(nextBooking.start_time)}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-blue-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Limite de Agendamento</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        Você pode ter apenas um agendamento ativo por vez. Cancele este agendamento para fazer um novo.
                      </p>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCancelBooking(nextBooking.id)}
                      className="w-full border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar Agendamento
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico Recente */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-purple-600" />
              Histórico Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum histórico disponível
                </h3>
                <p className="text-muted-foreground">
                  Suas sessões concluídas aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{booking.chair?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(booking.start_time)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 