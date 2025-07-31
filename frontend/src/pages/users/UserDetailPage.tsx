import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { ArrowLeft, Mail, Phone, Building, Shield, CheckCircle, XCircle, IdCard, Loader2, User as UserIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { userService } from '../../services/userService'
import { handleApiError } from '../../services/api'

export const UserDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Buscar dados do usuário
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(parseInt(id || '0')),
    enabled: !!id,
  })

  const handleBack = () => {
    navigate('/users')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
      case 'reprovado':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Reprovado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
      case 'atendente':
        return <Badge className="bg-blue-100 text-blue-800">Atendente</Badge>
      case 'usuario':
        return <Badge className="bg-gray-100 text-gray-800">Usuário</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'masculino':
        return 'Masculino'
      case 'feminino':
        return 'Feminino'
      case 'outro':
        return 'Outro'
      default:
        return gender
    }
  }

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
  }

  const formatDateTime = (date: string | Date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
  }

  const calculateAge = (birthDate: string | Date) => {
    const date = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - date.getFullYear()
    const monthDiff = today.getMonth() - date.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--
    }
    
    return age
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar usuário</h3>
          <p className="text-muted-foreground mb-4">
            {handleApiError(error).message}
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à Lista
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
          <p className="text-muted-foreground">Carregando dados do usuário...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Usuário não encontrado</h3>
        <p className="text-muted-foreground mb-4">
          O usuário que você está procurando não existe ou foi removido.
        </p>
        <Button onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar à Lista
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-muted-foreground">
              Visualize as informações completas do usuário
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                <p className="text-sm">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">CPF</label>
                <p className="text-sm">{user.cpf}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                <p className="text-sm">{getGenderText(user.gender)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                <p className="text-sm">
                  {user.birth_date ? formatDate(user.birth_date) : 'Não informado'}
                  {user.birth_date && ` (${calculateAge(user.birth_date)} anos)`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informações de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-sm">{user.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Profissionais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Função</label>
                <p className="text-sm">{user.function}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cargo</label>
                <p className="text-sm">{user.position}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Matrícula</label>
                <p className="text-sm">{user.registration}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Setor</label>
                <p className="text-sm">{user.sector}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Função no Sistema</label>
                <div className="mt-1">
                  {getRoleBadge(user.role)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
                <p className="text-sm">{formatDateTime(user.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
                <p className="text-sm">{formatDateTime(user.updated_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Último Login</label>
                <p className="text-sm">
                  {user.last_login ? formatDateTime(user.last_login) : 'Nunca fez login'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 