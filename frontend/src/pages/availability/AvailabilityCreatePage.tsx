import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Clock,
  Calendar,
  Users,
  X,
  Check
} from 'lucide-react'
import { availabilityService } from '../../services/availabilityService'
import { chairService } from '../../services/chairService'
import { handleApiError } from '../../services/api'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda-feira', short: 'Seg' },
  { value: 2, label: 'Terça-feira', short: 'Ter' },
  { value: 3, label: 'Quarta-feira', short: 'Qua' },
  { value: 4, label: 'Quinta-feira', short: 'Qui' },
  { value: 5, label: 'Sexta-feira', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' }
]

// Gerar horários em blocos de 30 minutos das 08:00 às 18:00
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const nextTime = minute === 30 
        ? `${(hour + 1).toString().padStart(2, '0')}:00`
        : `${hour.toString().padStart(2, '0')}:30`
      
      slots.push({
        value: time,
        label: `${time} às ${nextTime}`
      })
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

export const AvailabilityCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    chair_id: '',
    selected_days: [] as number[],
    selected_times: [] as string[],
    valid_to: '',
    is_active: true
  })

  // Buscar cadeiras
  const { data: chairsResponse, isLoading: loadingChairs } = useQuery({
    queryKey: ['chairs'],
    queryFn: () => chairService.getAllChairs(),
    staleTime: 5 * 60 * 1000,
  })

    // Mutação para criar disponibilidade
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Usar a nova API de criação em lote
      return availabilityService.createMultipleAvailabilities({
        chair_id: data.chair_id,
        selected_days: data.selected_days,
        start_times: data.start_times,
        end_times: data.end_times,
        valid_to: data.valid_to || undefined,
        is_active: data.is_active
      })
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Disponibilidades criadas com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['availabilities'] })
      navigate('/availability')
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error('Erro ao criar disponibilidades', {
        description: apiError.message
      })
    }
  })

  const chairs = chairsResponse?.chairs || []

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleDay = (dayValue: number) => {
    setFormData(prev => ({
      ...prev,
      selected_days: prev.selected_days.includes(dayValue)
        ? prev.selected_days.filter(d => d !== dayValue)
        : [...prev.selected_days, dayValue]
    }))
  }

  const toggleTime = (timeValue: string) => {
    setFormData(prev => ({
      ...prev,
      selected_times: prev.selected_times.includes(timeValue)
        ? prev.selected_times.filter(t => t !== timeValue)
        : [...prev.selected_times, timeValue]
    }))
  }

  const removeDay = (dayValue: number) => {
    setFormData(prev => ({
      ...prev,
      selected_days: prev.selected_days.filter(d => d !== dayValue)
    }))
  }

  const removeTime = (timeValue: string) => {
    setFormData(prev => ({
      ...prev,
      selected_times: prev.selected_times.filter(t => t !== timeValue)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.chair_id || formData.selected_days.length === 0 || formData.selected_times.length === 0) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    // Converter horários para arrays separados de start_time e end_time
    const startTimes: string[] = []
    const endTimes: string[] = []
    
    formData.selected_times.forEach(timeValue => {
      const timeSlot = TIME_SLOTS.find(slot => slot.value === timeValue)
      if (timeSlot) {
        // Extrair start_time e end_time do formato "HH:MM às HH:MM"
        const timeRange = timeSlot.label
        const parts = timeRange.split(' às ')
        if (parts.length === 2) {
          startTimes.push(parts[0])
          endTimes.push(parts[1])
        }
      }
    })

    const submitData = {
      chair_id: parseInt(formData.chair_id),
      selected_days: formData.selected_days,
      start_times: startTimes,
      end_times: endTimes,
      valid_to: formData.valid_to || undefined,
      is_active: formData.is_active
    }

    createMutation.mutate(submitData)
  }

  const handleBack = () => {
    navigate('/availability')
  }

  if (loadingChairs) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando cadeiras...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Nova Disponibilidade</h1>
          <p className="text-muted-foreground">
            Configure os horários disponíveis para uma cadeira
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

            {/* Dias da Semana */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dias da Semana *
              </Label>
              
              {/* Dias Selecionados */}
              {formData.selected_days.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.selected_days.map((dayValue) => {
                    const day = DAYS_OF_WEEK.find(d => d.value === dayValue)
                    return (
                      <Badge key={dayValue} variant="secondary" className="flex items-center gap-1">
                        {day?.short}
                        <button
                          type="button"
                          onClick={() => removeDay(dayValue)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
              
                             {/* Grid de Dias */}
               <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.selected_days.includes(day.value)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-xs font-medium">{day.short}</div>
                    {formData.selected_days.includes(day.value) && (
                      <Check className="h-4 w-4 mx-auto mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Horários */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horários *
              </Label>
              
                             {/* Horários Selecionados */}
               {formData.selected_times.length > 0 && (
                 <div className="flex flex-wrap gap-2">
                   {formData.selected_times.map((timeValue) => {
                     const timeSlot = TIME_SLOTS.find(slot => slot.value === timeValue)
                     return (
                       <Badge key={timeValue} variant="secondary" className="flex items-center gap-1">
                         {timeSlot?.label || timeValue}
                         <button
                           type="button"
                           onClick={() => removeTime(timeValue)}
                           className="ml-1 hover:text-destructive"
                         >
                           <X className="h-3 w-3" />
                         </button>
                       </Badge>
                     )
                   })}
                 </div>
               )}
              
              {/* Select de Horários */}
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    if (value && !formData.selected_times.includes(value)) {
                      toggleTime(value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem 
                        key={slot.value} 
                        value={slot.value}
                        disabled={formData.selected_times.includes(slot.value)}
                      >
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Selecione múltiplos horários para criar várias disponibilidades
                </p>
              </div>
            </div>

                         {/* Período de Validade */}
             <div className="space-y-4">
               <Label className="flex items-center gap-2">
                 <Calendar className="h-4 w-4" />
                 Data de Validade (Opcional)
               </Label>
               <div className="space-y-2">
                 <Label htmlFor="valid_to">Válido até</Label>
                 <Input
                   type="date"
                   id="valid_to"
                   value={formData.valid_to}
                   onChange={(e) => handleInputChange('valid_to', e.target.value)}
                   placeholder="Data de fim da validade"
                 />
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
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active" className="text-sm">
                  Disponibilidade ativa
                </Label>
              </div>
            </div>

            {/* Resumo */}
            {formData.selected_days.length > 0 && formData.selected_times.length > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Resumo da Criação</h4>
                <p className="text-sm text-muted-foreground">
                  Serão criadas {formData.selected_days.length * formData.selected_times.length} disponibilidade(s):
                </p>
                                 <ul className="text-sm text-muted-foreground mt-1">
                   {formData.selected_days.map(day => {
                     const dayLabel = DAYS_OF_WEEK.find(d => d.value === day)?.label
                     return formData.selected_times.map(timeValue => {
                       const timeSlot = TIME_SLOTS.find(slot => slot.value === timeValue)
                       return (
                         <li key={`${day}-${timeValue}`} className="ml-4">
                           • {dayLabel} - {timeSlot?.label || timeValue}
                         </li>
                       )
                     })
                   })}
                 </ul>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Criar Disponibilidades
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={createMutation.isPending}
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