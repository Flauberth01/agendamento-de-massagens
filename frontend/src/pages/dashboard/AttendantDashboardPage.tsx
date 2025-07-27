import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useAuth } from '../../stores/authStore'
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react'

interface TodaySession {
  id: number
  user: {
    name: string
    cpf: string
  }
  chair: {
    name: string
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

export const AttendantDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([])
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    confirmedSessions: 0,
    pendingSessions: 0,
    pendingApprovals: 0
  })

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setTodaySessions([
        {
          id: 1,
          user: { name: 'João Silva', cpf: '123.456.789-00' },
          chair: { name: 'Cadeira 1' },
          start_time: '09:00',
          end_time: '09:30',
          status: 'agendado'
        },
        {
          id: 2,
          user: { name: 'Maria Santos', cpf: '987.654.321-00' },
          chair: { name: 'Cadeira 2' },
          start_time: '10:00',
          end_time: '10:30',
          status: 'confirmado'
        }
      ])

      setPendingUsers([
        {
          id: 1,
          name: 'Pedro Costa',
          email: 'pedro@empresa.com',
          requested_role: 'usuario',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'Ana Oliveira',
          email: 'ana@empresa.com',
          requested_role: 'atendente',
          created_at: '2024-01-15T11:00:00Z'
        }
      ])

      setStats({
        totalSessions: 8,
        confirmedSessions: 5,
        pendingSessions: 3,
        pendingApprovals: 2
      })

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard do Atendente</h1>
        <p className="text-gray-600">Bem-vindo, {user?.name}</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Total de agendamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sessões confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingSessions}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando confirmação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovações</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Usuários pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessões de Hoje */}
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

        {/* Aprovações Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Aprovações Pendentes
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
    </div>
  )
} 