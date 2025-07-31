import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  Loader2,
  XCircle,
  CheckCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { userService } from '../../services/userService'
import { handleApiError } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import type { User, UserApprovalRequest, UserRejectionRequest } from '../../types/user'

export const UserPendingPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()

  // Buscar usuários pendentes
  const { data: pendingUsers, isLoading, error } = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: userService.getPendingUsers,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
  })

  // Mutação para aprovar usuário
  const approveMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserApprovalRequest }) =>
      userService.approveUser(userId, data),
    onSuccess: (response) => {
      const userName = response.user?.name || 'Usuário'
      toast.success('Usuário aprovado com sucesso!', {
        description: `${userName} foi aprovado no sistema.`
      })
      queryClient.invalidateQueries({ queryKey: ['users', 'pending'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error('Erro ao aprovar usuário', {
        description: apiError.message
      })
    }
  })

  // Mutação para rejeitar usuário
  const rejectMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserRejectionRequest }) =>
      userService.rejectUser(userId, data),
    onSuccess: (response) => {
      const userName = response.user?.name || 'Usuário'
      toast.success('Usuário rejeitado', {
        description: `${userName} foi rejeitado no sistema.`
      })
      queryClient.invalidateQueries({ queryKey: ['users', 'pending'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error('Erro ao rejeitar usuário', {
        description: apiError.message
      })
    }
  })

  const handleApproveUser = (userId: number) => {
    approveMutation.mutate({
      userId,
      data: { status: 'aprovado' }
    })
  }

  const handleRejectUser = (userId: number) => {
    rejectMutation.mutate({
      userId,
      data: { status: 'reprovado', reason: 'Usuário rejeitado pelo administrador' }
    })
  }

  // Função para verificar se o usuário atual pode aprovar/rejeitar o usuário pendente
  const canApproveRejectUser = (pendingUser: User): boolean => {
    if (!currentUser) return false
    
    // Administrador pode aprovar/rejeitar qualquer tipo de usuário
    if (currentUser.role === 'admin') {
      return true
    }
    
    // Atendente só pode aprovar/rejeitar usuários/clientes
    if (currentUser.role === 'atendente') {
      return pendingUser.requested_role === 'usuario'
    }
    
    return false
  }

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'atendente':
        return 'Atendente'
      case 'usuario':
        return 'Usuário'
      default:
        return role
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar aprovações</h3>
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
          <p className="text-muted-foreground">Carregando aprovações pendentes...</p>
        </div>
      </div>
    )
  }

  const users = Array.isArray(pendingUsers) ? pendingUsers : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aprovações Pendentes</h1>
        <p className="text-gray-600">
          Gerencie as solicitações de cadastro de novos usuários
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-xs text-muted-foreground">
              Aprovações do dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitados Hoje</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-xs text-muted-foreground">
              Rejeições do dia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários Aguardando Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma aprovação pendente</h3>
              <p className="text-muted-foreground">
                Todos os usuários foram aprovados ou rejeitados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user: User) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">
                          {user.email} • {user.cpf}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {getRoleLabel(user.requested_role)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Solicitado em {formatDate(user.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canApproveRejectUser(user) && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproveUser(user.id)}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectUser(user.id)}
                          disabled={rejectMutation.isPending}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          {rejectMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                          Rejeitar
                        </Button>
                      </>
                    )}
                    {!canApproveRejectUser(user) && (
                      <Badge variant="secondary">
                        Permissão insuficiente
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 