import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useAuth } from '../../stores/authStore'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Loader2,
  CalendarDays,
  TrendingUp
} from 'lucide-react'

interface UserBooking {
  id: number
  chair: {
    name: string
    location: string
  }
  start_time: string
  end_time: string
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido' | 'falta'
  notes?: string
}

interface UserStats {
  totalBookings: number
  completedBookings: number
  activeBookings: number
  upcomingBookings: number
}

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [userStats, setUserStats] = useState<UserStats>({
    totalBookings: 0,
    completedBookings: 0,
    activeBookings: 0,
    upcomingBookings: 0
  })
  const [upcomingBookings, setUpcomingBookings] = useState<UserBooking[]>([])
  const [recentBookings, setRecentBookings] = useState<UserBooking[]>([])

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setUserStats({
        totalBookings: 15,
        completedBookings: 12,
        activeBookings: 1,
        upcomingBookings: 1
      })

      setUpcomingBookings([
        {
          id: 1,
          chair: { name: 'Cadeira 1', location: 'Sala de Massagem A' },
          start_time: '2024-01-16T14:00:00Z',
          end_time: '2024-01-16T14:30:00Z',
          status: 'agendado'
        }
      ])

      setRecentBookings([
        {
          id: 2,
          chair: { name: 'Cadeira 2', location: 'Sala de Massagem B' },
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T10:30:00Z',
          status: 'concluido'
        },
        {
          id: 3,
          chair: { name: 'Cadeira 1', location: 'Sala de Massagem A' },
          start_time: '2024-01-12T16:00:00Z',
          end_time: '2024-01-12T16:30:00Z',
          status: 'concluido'
        }
      ])

      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Badge variant="secondary">Agendado</Badge>
      case 'confirmado':
        return <Badge variant="default">Confirmado</Badge>
      case 'concluido':
        return <Badge variant="default" className="bg-green-500">Concluído</Badge>
      case 'falta':
        return <Badge variant="destructive">Falta</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCancelBooking = (bookingId: number) => {
    // Implementar cancelamento de agendamento
    console.log('Cancelar agendamento:', bookingId)
  }

  const handleNewBooking = () => {
    navigate('/users/booking')
  }

  const handleViewBookings = () => {
    navigate('/users/booking')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Dashboard</h1>
        <p className="text-gray-600">Bem-vindo, {user?.name}</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Sessões realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.completedBookings}</div>
            <p className="text-xs text-muted-foreground">
              Sessões finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userStats.upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Agendamentos futuros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{userStats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">
              Sessões ativas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximo Agendamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Próximo Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Você não possui agendamentos futuros</p>
                <Button onClick={handleNewBooking} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Nova Sessão
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{booking.chair.name}</div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      📍 {booking.chair.location}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      🕒 {formatDateTime(booking.start_time)}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button size="sm" className="flex-1" onClick={handleNewBooking}>
                        <Plus className="h-4 w-4 mr-1" />
                        Agendar Outra
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhum histórico disponível</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{booking.chair.name}</div>
                      <div className="text-sm text-gray-600">
                        {formatDateTime(booking.start_time)}
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

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleNewBooking} className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              <span>Agendar Nova Sessão</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={handleViewBookings}>
              <Calendar className="h-6 w-6 mb-2" />
              <span>Ver Meus Agendamentos</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={handleViewBookings}>
              <Clock className="h-6 w-6 mb-2" />
              <span>Meu Histórico</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 