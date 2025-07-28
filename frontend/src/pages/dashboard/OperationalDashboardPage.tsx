import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useAuth } from '../../stores/authStore'
import { 
  Calendar, 
  Users, 
  Building, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  UserCheck,
  UserX,
  Loader2,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'
import { handleApiError } from '../../services/api'

interface Session {
  id: number
  user: {
    name: string
    cpf: string
  }
  chair: {
    name: string
    location: string
  }
  start_time: string
  end_time: string
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido' | 'falta'
}

interface PendingUser {
  id: number
  name: string
  email: string
  requested_role: string
  created_at: string
}

interface ChairOccupancy {
  chair_id: number
  chair_name: string
  total_sessions: number
  completed_sessions: number
  cancelled_sessions: number
  no_show_sessions: number
  occupancy_rate: number
}

interface DashboardStats {
  totalSessionsToday: number
  confirmedSessionsToday: number
  pendingApprovals: number
  totalChairs: number
  activeChairs: number
  attendanceRate: number
  cancellationRate: number
}

export const OperationalDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Buscar dados do dashboard operacional
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['operational-dashboard'],
    queryFn: dashboardService.getOperationalDashboard,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  })

  const stats: DashboardStats = dashboardData?.stats || {
    totalSessionsToday: 0,
    confirmedSessionsToday: 0,
    pendingApprovals: 0,
    totalChairs: 0,
    activeChairs: 0,
    attendanceRate: 0,
    cancellationRate: 0
  }

  const todaySessions: Session[] = dashboardData?.todaySessions || []
  const pendingUsers: PendingUser[] = dashboardData?.pendingUsers || []
  const chairOccupancy: ChairOccupancy[] = dashboardData?.chairOccupancy || []

  const handleConfirmSession = (sessionId: number) => {
    // Implementar confirmação de sessão
    console.log('Confirmar sessão:', sessionId)
  }

  const handleMarkAttendance = (sessionId: number) => {
    // Implementar marcação de presença
    console.log('Marcar presença:', sessionId)
  }

  const handleApproveUser = (userId: number) => {
    // Implementar aprovação de usuário
    console.log('Aprovar usuário:', userId)
  }

  const handleRejectUser = (userId: number) => {
    // Implementar rejeição de usuário
    console.log('Rejeitar usuário:', userId)
  }

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar dashboard</h3>
          <p className="text-muted-foreground mb-4">
            {handleApiError(error).message}
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dashboard operacional...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Operacional</h1>
        <p className="text-gray-600">Bem-vindo, {user?.name}</p>
      </div>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sessões Agendadas por Dia */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalSessionsToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmedSessionsToday} confirmadas
            </p>
          </CardContent>
        </Card>

        {/* Pendências de Aprovação */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendências</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Aprovações pendentes</p>
          </CardContent>
        </Card>

        {/* Ocupação por Cadeira */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cadeiras Ativas</CardTitle>
            <Building className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeChairs}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalChairs} disponíveis
            </p>
          </CardContent>
        </Card>

        {/* Taxa de Comparecimento */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comparecimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de presença
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessões Agendadas por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sessões de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySessions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhuma sessão agendada para hoje</p>
            ) : (
              <div className="space-y-3">
                {todaySessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{session.user.name}</div>
                      <div className="text-sm text-gray-600">
                        {session.chair.name} • {session.start_time} - {session.end_time}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(session.status)}
                      {session.status === 'agendado' && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmSession(session.id)}
                        >
                          Confirmar
                        </Button>
                      )}
                      {session.status === 'confirmado' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAttendance(session.id)}
                        >
                          Marcar Presença
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pendências de Aprovação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pendências de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhuma aprovação pendente</p>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">
                        {user.email} • {user.requested_role}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproveUser(user.id)}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectUser(user.id)}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ocupação por Cadeira */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Ocupação por Cadeira
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chairOccupancy.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhuma cadeira disponível</p>
          ) : (
            <div className="space-y-4">
              {chairOccupancy.map((chair) => (
                <div key={chair.chair_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{chair.chair_name}</div>
                    <div className="text-sm text-gray-600">
                      {chair.total_sessions} sessões • {chair.occupancy_rate}% ocupação
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-600">{chair.completed_sessions}</div>
                      <div className="text-xs text-gray-500">Concluídas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-red-600">{chair.cancelled_sessions}</div>
                      <div className="text-xs text-gray-500">Canceladas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-orange-600">{chair.no_show_sessions}</div>
                      <div className="text-xs text-gray-500">Faltas</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Indicadores de Comparecimento e Cancelamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Indicadores de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.attendanceRate}%</div>
              <div className="text-sm text-green-700">Taxa de Comparecimento</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{stats.cancellationRate}%</div>
              <div className="text-sm text-red-700">Taxa de Cancelamento</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.confirmedSessionsToday}</div>
              <div className="text-sm text-blue-700">Sessões Confirmadas Hoje</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 