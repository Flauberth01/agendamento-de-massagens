import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  Loader2,
  Clock,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import { availabilityService } from '../../services/availabilityService'
import { chairService } from '../../services/chairService'
import { handleApiError } from '../../services/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
]

export const AvailabilityDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Buscar disponibilidade por ID
  const { data: availability, isLoading, error } = useQuery({
    queryKey: ['availability', id],
    queryFn: () => availabilityService.getAvailabilityById(parseInt(id!)),
    enabled: !!id,
  })

  // Buscar informações da cadeira
  const { data: chairsResponse } = useQuery({
    queryKey: ['chairs'],
    queryFn: () => chairService.getAllChairs(),
    staleTime: 5 * 60 * 1000,
  })

  const chairs = chairsResponse?.chairs || []

  const getChairName = (chairId: number) => {
    const chair = chairs.find((c: any) => c.id === chairId)
    return chair?.name || `Cadeira ${chairId}`
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Ativa
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inativa
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
  }

  const handleBack = () => {
    navigate('/availability')
  }

  const handleEdit = () => {
    navigate(`/availability/${id}/edit`)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar disponibilidade</h3>
          <p className="text-muted-foreground mb-4">
            {handleApiError(error).message}
          </p>
          <Button onClick={handleBack}>
            Voltar
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
          <p className="text-muted-foreground">Carregando disponibilidade...</p>
        </div>
      </div>
    )
  }

  if (!availability) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Disponibilidade não encontrada</h3>
          <p className="text-muted-foreground mb-4">
            A disponibilidade solicitada não foi encontrada.
          </p>
          <Button onClick={handleBack}>
            Voltar
          </Button>
        </div>
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
            <h1 className="text-3xl font-bold tracking-tight">Detalhes da Disponibilidade</h1>
            <p className="text-muted-foreground">
              Informações completas sobre esta disponibilidade
            </p>
          </div>
        </div>
        <Button onClick={handleEdit} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">ID:</span>
              <span className="font-medium">#{availability.id}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              {getStatusBadge(availability.is_active)}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Cadeira:</span>
              <span className="font-medium">{getChairName(availability.chair_id)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Dia da Semana:</span>
              <span className="font-medium">{DAYS_OF_WEEK[availability.day_of_week]}</span>
            </div>
          </CardContent>
        </Card>

        {/* Horários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Horário Inicial:</span>
              <span className="font-medium">{availability.start_time}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Horário Final:</span>
              <span className="font-medium">{availability.end_time}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Duração:</span>
              <span className="font-medium">
                {(() => {
                  const start = new Date(`2000-01-01T${availability.start_time}:00`)
                  const end = new Date(`2000-01-01T${availability.end_time}:00`)
                  const diffMs = end.getTime() - start.getTime()
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                  
                  if (diffHours > 0) {
                    return `${diffHours}h ${diffMinutes}min`
                  }
                  return `${diffMinutes}min`
                })()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Período de Validade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período de Validade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {availability.valid_from || availability.valid_to ? (
              <>
                {availability.valid_from && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Data de Início:</span>
                    <span className="font-medium">{formatDate(availability.valid_from)}</span>
                  </div>
                )}
                {availability.valid_to && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Data de Fim:</span>
                    <span className="font-medium">{formatDate(availability.valid_to)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Disponibilidade permanente</p>
                <p className="text-sm text-muted-foreground">Sem período de validade definido</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Criado em:</span>
              <span className="font-medium">{formatDate(availability.created_at)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Última atualização:</span>
              <span className="font-medium">{formatDate(availability.updated_at)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Válida atualmente:</span>
              <span className="font-medium">
                {availability.is_active ? 'Sim' : 'Não'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar Disponibilidade
            </Button>
            <Button variant="outline" onClick={handleBack}>
              Voltar à Lista
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 