import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Loader2,
  XCircle,
  CheckCircle,
  Power,
  PowerOff
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { availabilityService } from '../../services/availabilityService'
import { chairService } from '../../services/chairService'
import { handleApiError } from '../../services/api'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'


const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
]

export const AvailabilityListPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedChair, setSelectedChair] = useState<string>('all')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [availabilityToDelete, setAvailabilityToDelete] = useState<number | null>(null)

  // Buscar disponibilidades
  const { data: availabilityResponse, isLoading, error } = useQuery({
    queryKey: ['availabilities', selectedChair],
    queryFn: () => availabilityService.getAllAvailabilities({
      chairId: selectedChair !== 'all' ? parseInt(selectedChair) : undefined
    }),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  // Buscar cadeiras para filtro
  const { data: chairsResponse } = useQuery({
    queryKey: ['chairs'],
    queryFn: () => chairService.getAllChairs(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Mutação para ativar/desativar disponibilidade
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? availabilityService.activateAvailability(id) : availabilityService.deactivateAvailability(id),
    onSuccess: (updatedAvailability) => {
      toast.success(`Disponibilidade ${updatedAvailability.is_active ? 'ativada' : 'desativada'} com sucesso!`)
      queryClient.invalidateQueries({ queryKey: ['availabilities'] })
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error('Erro ao alterar status', {
        description: apiError.message
      })
    }
  })

  // Mutação para deletar disponibilidade
  const deleteMutation = useMutation({
    mutationFn: (id: number) => availabilityService.deleteAvailability(id),
    onSuccess: () => {
      toast.success('Disponibilidade deletada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['availabilities'] })
      setShowDeleteDialog(false)
      setAvailabilityToDelete(null)
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error('Erro ao deletar disponibilidade', {
        description: apiError.message
      })
    }
  })

  const availabilities = availabilityResponse?.data || []
  const chairs = chairsResponse?.data || []

  const handleCreateAvailability = () => {
    navigate('/availability/create')
  }

  const handleEditAvailability = (id: number) => {
    navigate(`/availability/${id}/edit`)
  }

  const handleViewAvailability = (id: number) => {
    navigate(`/availability/${id}`)
  }

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, active: !currentStatus })
  }

  const handleDeleteAvailability = (id: number) => {
    setAvailabilityToDelete(id)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (availabilityToDelete) {
      deleteMutation.mutate(availabilityToDelete)
    }
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

  const getChairName = (chairId: number) => {
    const chair = chairs.find(c => c.id === chairId)
    return chair?.name || `Cadeira ${chairId}`
  }

  const formatTime = (time: string) => {
    return time
  }

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar disponibilidades</h3>
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
          <p className="text-muted-foreground">Carregando disponibilidades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Disponibilidade</h1>
          <p className="text-muted-foreground">
            Configure os horários disponíveis para cada cadeira
          </p>
        </div>
        <Button onClick={handleCreateAvailability} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Disponibilidade
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Cadeira</label>
              <select
                value={selectedChair}
                onChange={(e) => setSelectedChair(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Todas as cadeiras</option>
                {chairs.map((chair) => (
                  <option key={chair.id} value={chair.id}>
                    {chair.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Disponibilidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Disponibilidades ({availabilities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availabilities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma disponibilidade encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {selectedChair !== 'all'
                  ? 'Não há disponibilidades configuradas para esta cadeira'
                  : 'Comece criando a primeira disponibilidade'
                }
              </p>
              {selectedChair === 'all' && (
                <Button onClick={handleCreateAvailability}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Disponibilidade
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Cadeira</th>
                    <th className="text-left py-3 px-4 font-medium">Dia da Semana</th>
                    <th className="text-left py-3 px-4 font-medium">Horário</th>
                    <th className="text-left py-3 px-4 font-medium">Período de Validade</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {availabilities.map((availability) => (
                    <tr key={availability.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{getChairName(availability.chair_id)}</div>
                      </td>
                      <td className="py-3 px-4">
                        {DAYS_OF_WEEK[availability.day_of_week]}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {availability.valid_from && (
                            <div>De: {formatDate(availability.valid_from.toString())}</div>
                          )}
                          {availability.valid_to && (
                            <div>Até: {formatDate(availability.valid_to.toString())}</div>
                          )}
                          {!availability.valid_from && !availability.valid_to && (
                            <div className="text-muted-foreground">Sem período definido</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(availability.is_active)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAvailability(availability.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAvailability(availability.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(availability.id, availability.is_active)}
                            disabled={toggleStatusMutation.isPending}
                            className={availability.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {toggleStatusMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : availability.is_active ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAvailability(availability.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta disponibilidade? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
} 