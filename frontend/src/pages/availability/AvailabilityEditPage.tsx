import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Clock,
  Calendar,
  Users
} from 'lucide-react'
import { availabilityService } from '../../services/availabilityService'
import { chairService } from '../../services/chairService'
import { handleApiError } from '../../services/api'
import { format } from 'date-fns'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
]

// Gerar horários em blocos de 30 minutos
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(time)
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

export const AvailabilityEditPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    chair_id: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    valid_from: '',
    valid_to: '',
    is_active: true
  })

  // Buscar disponibilidade por ID
  const { data: availability, isLoading: loadingAvailability, error } = useQuery({
    queryKey: ['availability', id],
    queryFn: () => availabilityService.getAvailabilityById(parseInt(id!)),
    enabled: !!id,
  })

  // Buscar cadeiras
  const { data: chairsResponse, isLoading: loadingChairs } = useQuery({
    queryKey: ['chairs'],
    queryFn: () => chairService.getAllChairs(),
    staleTime: 5 * 60 * 1000,
  })

  // Mutação para atualizar disponibilidade
  const updateMutation = useMutation({
    mutationFn: (data: any) => availabilityService.updateAvailability(parseInt(id!), data),
    onSuccess: () => {
      toast.success('Disponibilidade atualizada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['availabilities'] })
      queryClient.invalidateQueries({ queryKey: ['availability', id] })
      navigate('/availability')
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error('Erro ao atualizar disponibilidade', {
        description: apiError.message
      })
    }
  })

  // Preencher formulário quando os dados carregarem
  useEffect(() => {
    if (availability) {
      setFormData({
        chair_id: availability.chair_id.toString(),
        day_of_week: availability.day_of_week.toString(),
        start_time: availability.start_time,
        end_time: availability.end_time,
        valid_from: availability.valid_from ? format(new Date(availability.valid_from), 'yyyy-MM-dd') : '',
        valid_to: availability.valid_to ? format(new Date(availability.valid_to), 'yyyy-MM-dd') : '',
        is_active: availability.is_active
      })
    }
  }, [availability])

  const chairs = chairsResponse?.chairs || []

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.chair_id || !formData.day_of_week || !formData.start_time || !formData.end_time) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    // Validar se o horário final é maior que o inicial
    if (formData.start_time >= formData.end_time) {
      toast.error('O horário final deve ser maior que o horário inicial')
      return
    }

    const submitData = {
      chair_id: parseInt(formData.chair_id),
      day_of_week: parseInt(formData.day_of_week),
      start_time: formData.start_time,
      end_time: formData.end_time,
      valid_from: formData.valid_from || undefined,
      valid_to: formData.valid_to || undefined,
      is_active: formData.is_active
    }

    updateMutation.mutate(submitData)
  }

  const handleBack = () => {
    navigate('/availability')
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

  if (loadingAvailability || loadingChairs) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Disponibilidade</h1>
          <p className="text-muted-foreground">
            Modifique os horários disponíveis para esta cadeira
          </p>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Dados da Disponibilidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cadeira */}
            <div className="space-y-2">
              <Label htmlFor="chair_id" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Cadeira *
              </Label>
              <Select
                value={formData.chair_id}
                onValueChange={(value) => handleInputChange('chair_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cadeira" />
                </SelectTrigger>
                <SelectContent>
                  {chairs.map((chair: any) => (
                    <SelectItem key={chair.id} value={chair.id.toString()}>
                      {chair.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dia da Semana */}
            <div className="space-y-2">
              <Label htmlFor="day_of_week" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dia da Semana *
              </Label>
              <Select
                value={formData.day_of_week}
                onValueChange={(value) => handleInputChange('day_of_week', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia da semana" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horário Inicial *
                </Label>
                <Select
                  value={formData.start_time}
                  onValueChange={(value) => handleInputChange('start_time', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário inicial" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horário Final *
                </Label>
                <Select
                  value={formData.end_time}
                  onValueChange={(value) => handleInputChange('end_time', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário final" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Período de Validade */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período de Validade (Opcional)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Data de Início</Label>
                  <Input
                    type="date"
                    id="valid_from"
                    value={formData.valid_from}
                    onChange={(e) => handleInputChange('valid_from', e.target.value)}
                    placeholder="Data de início da validade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_to">Data de Fim</Label>
                  <Input
                    type="date"
                    id="valid_to"
                    value={formData.valid_to}
                    onChange={(e) => handleInputChange('valid_to', e.target.value)}
                    placeholder="Data de fim da validade"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Deixe em branco para disponibilidade permanente
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Status
              </Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked.toString())}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active" className="text-sm">
                  Disponibilidade ativa
                </Label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 