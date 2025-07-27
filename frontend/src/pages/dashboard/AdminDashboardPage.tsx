import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

import { useAuth } from '../../stores/authStore'
import { 
  Users, 
  UserCheck,
  Building,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  XCircle
} from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'
import { handleApiError } from '../../services/api'
import type { DashboardStats } from '../../services/dashboardService'

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Buscar dados do dashboard
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: dashboardService.getAdminDashboard,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  })

  const systemStats: DashboardStats = dashboardData?.stats || {
    totalUsers: 0,
    totalChairs: 0,
    totalBookings: 0,
    activeBookings: 0,
    pendingApprovals: 0,
    todaySessions: 0,
    monthlyGrowth: 0
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
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600">Bem-vindo, {user?.name}</p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Pendentes</CardTitle>
            <UserCheck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{systemStats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cadeiras Ativas</CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalChairs}</div>
            <p className="text-xs text-muted-foreground">Disponíveis para agendamento</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.todaySessions}</div>
            <p className="text-xs text-muted-foreground">Agendamentos para hoje</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ações Administrativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200"
              onClick={() => navigate('/users')}
            >
              <UserCheck className="h-6 w-6 text-orange-500" />
              <span className="text-sm font-medium">Aprovar Usuários</span>
              <span className="text-xs text-muted-foreground">
                {systemStats.pendingApprovals} pendente(s)
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200"
              onClick={() => navigate('/chairs')}
            >
              <Building className="h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium">Gerenciar Cadeiras</span>
              <span className="text-xs text-muted-foreground">
                {systemStats.totalChairs} cadeira(s)
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2 hover:bg-green-50 hover:border-green-200"
              onClick={() => navigate('/availability')}
            >
              <Calendar className="h-6 w-6 text-green-500" />
              <span className="text-sm font-medium">Configurar Horários</span>
              <span className="text-xs text-muted-foreground">
                Disponibilidade
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200"
              onClick={() => navigate('/bookings')}
            >
              <Clock className="h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium">Ver Sessões</span>
              <span className="text-xs text-muted-foreground">
                {systemStats.todaySessions} hoje
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2 hover:bg-indigo-50 hover:border-indigo-200"
              onClick={() => navigate('/users')}
            >
              <Users className="h-6 w-6 text-indigo-500" />
              <span className="text-sm font-medium">Gerenciar Usuários</span>
              <span className="text-xs text-muted-foreground">
                Todos os usuários
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2 hover:bg-cyan-50 hover:border-cyan-200"
              onClick={() => navigate('/bookings/today')}
            >
              <Calendar className="h-6 w-6 text-cyan-500" />
              <span className="text-sm font-medium">Sessões de Hoje</span>
              <span className="text-xs text-muted-foreground">
                Agendamentos do dia
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Alertas do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemStats.pendingApprovals > 0 ? (
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {systemStats.pendingApprovals} usuário(s) aguardando aprovação
                  </div>
                  <div className="text-xs text-orange-700 mt-1">
                    Clique em "Aprovar Usuários" para revisar as solicitações
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/users')}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Revisar
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm">Nenhuma aprovação pendente</div>
                  <div className="text-xs text-green-700 mt-1">Sistema funcionando normalmente</div>
                </div>
              </div>
            )}

            {systemStats.todaySessions > 0 && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {systemStats.todaySessions} sessão(ões) agendada(s) para hoje
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    Verifique a disponibilidade das cadeiras
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/bookings/today')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Ver Sessões
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 