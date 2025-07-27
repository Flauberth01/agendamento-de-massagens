import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

import { createBookingSchema, type CreateBookingForm } from '../../utils/validation'

import { bookingService } from '../../services/bookingService'
import { chairService } from '../../services/chairService'
import { handleApiError } from '../../services/api'
import type { Chair } from '../../types/chair'
import type { CreateBookingRequest } from '../../types/booking'
import { 
 
  Clock, 
  Building, 
  ArrowLeft,
  Loader2,
  CheckCircle,

  XCircle
} from 'lucide-react'
import { format, addDays, startOfDay, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TimeSlot {
  startTime: Date
  endTime: Date
  available: boolean
  bookingId?: number
}

interface BookingSummary {
  chair: Chair
  date: Date
  timeSlot: TimeSlot
  notes?: string
}

export const BookingCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null)

  const {
    register,
    handleSubmit,
  } = useForm<CreateBookingForm>({
    resolver: zodResolver(createBookingSchema),
    mode: 'onChange',
  })

  // Buscar cadeiras ativas
  const { data: chairsResponse, isLoading: chairsLoading, error: chairsError } = useQuery({
    queryKey: ['chairs', 'active'],
    queryFn: () => chairService.getAllChairs({ status: 'ativa' }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  const availableChairs = chairsResponse?.data || []

  // Buscar disponibilidade quando data e cadeira são selecionadas
  const { data: availabilityData, isLoading: availabilityLoading } = useQuery({
    queryKey: ['availability', selectedChair?.id, selectedDate],
    queryFn: () => {
      if (!selectedChair || !selectedDate) return null
      return bookingService.getChairAvailability({
        chairId: selectedChair.id,
        date: format(selectedDate, 'yyyy-MM-dd')
      })
    },
    enabled: !!selectedChair && !!selectedDate,
    staleTime: 1 * 60 * 1000, // 1 minuto
  })

  // Mutação para criar agendamento
  const createBookingMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingService.createBooking(data),
    onSuccess: (createdBooking) => {
      toast.success('Agendamento criado com sucesso!', {
        description: `Sua sessão foi agendada para ${format(selectedDate!, 'dd/MM/yyyy')} às ${format(selectedTimeSlot!.startTime, 'HH:mm')}`
      })
      
      // Atualizar cache de agendamentos
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      
      setBookingSummary({
        chair: selectedChair!,
        date: selectedDate!,
        timeSlot: selectedTimeSlot!,
        notes: createdBooking.notes
      })
      setCurrentStep(5)
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error('Erro ao criar agendamento', {
        description: apiError.message
      })
    }
  })

  // Processar dados de disponibilidade
  useEffect(() => {
    if (availabilityData && selectedDate) {
      const slots: TimeSlot[] = availabilityData.timeSlots.map(slot => ({
        startTime: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${slot.startTime}`),
        endTime: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${slot.endTime}`),
        available: slot.available,
        bookingId: slot.bookingId
      }))
      setAvailableTimeSlots(slots)
    }
  }, [availabilityData, selectedDate])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTimeSlot(null)
    setCurrentStep(2)
  }

  const handleChairSelect = (chairId: number) => {
    const chair = availableChairs.find((c: Chair) => c.id === chairId)
    if (chair) {
      setSelectedChair(chair)
      setCurrentStep(3)
    }
  }

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (timeSlot.available) {
      setSelectedTimeSlot(timeSlot)
      setCurrentStep(4)
    }
  }

  const handleConfirmBooking = async (data: CreateBookingForm) => {
    if (!selectedChair || !selectedDate || !selectedTimeSlot) return

    const bookingData: CreateBookingRequest = {
      chair_id: selectedChair.id,
      start_time: selectedTimeSlot.startTime,
      notes: data.notes
    }

    createBookingMutation.mutate(bookingData)
  }

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: ptBR })
  }

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR })
  }

  const getDayName = (date: Date) => {
    return format(date, 'EEEE', { locale: ptBR })
  }

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date())
    return isBefore(date, today)
  }

  // Tratamento de erros
  if (chairsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar cadeiras</h3>
          <p className="text-muted-foreground mb-4">
            {handleApiError(chairsError).message}
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Selecione uma Data</h2>
        <p className="text-gray-600 mb-6">Escolha a data para sua sessão de massagem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {Array.from({ length: 14 }, (_, i) => {
          const date = addDays(new Date(), i)
          const isDisabled = isDateDisabled(date)
          
          return (
            <button
              key={i}
              onClick={() => !isDisabled && handleDateSelect(date)}
              disabled={isDisabled}
              className={`
                p-4 border rounded-lg text-center transition-colors
                ${isDisabled 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                }
                ${selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-200'
                }
              `}
            >
              <div className="text-sm font-medium">{formatDate(date)}</div>
              <div className="text-xs text-gray-500">{getDayName(date)}</div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Selecione uma Cadeira</h2>
        <p className="text-gray-600 mb-6">
          Data selecionada: <span className="font-medium">{selectedDate && formatDate(selectedDate)}</span>
        </p>
      </div>

      {chairsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando cadeiras...</span>
        </div>
      ) : availableChairs.length === 0 ? (
        <div className="text-center py-8">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma cadeira disponível</h3>
          <p className="text-gray-600">Não há cadeiras ativas no momento.</p>
        </div>
      ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {availableChairs.map((chair: Chair) => (
            <button
              key={chair.id}
              onClick={() => handleChairSelect(chair.id)}
              className={`
                p-4 border rounded-lg text-left transition-colors
                ${selectedChair?.id === chair.id
                  ? 'bg-blue-100 border-blue-500'
                  : 'hover:bg-gray-50 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{chair.name}</span>
              </div>
              <div className="text-sm text-gray-600">{chair.location}</div>
              <div className="text-xs text-green-600 mt-1">Disponível</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Selecione um Horário</h2>
        <p className="text-gray-600 mb-6">
          {selectedDate && formatDate(selectedDate)} • {selectedChair?.name}
        </p>
      </div>

      {availabilityLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando horários disponíveis...</span>
        </div>
      ) : availableTimeSlots.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum horário disponível</h3>
          <p className="text-gray-600">Não há horários disponíveis para esta data e cadeira.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {availableTimeSlots.map((slot, index) => (
            <button
              key={index}
              onClick={() => handleTimeSlotSelect(slot)}
              disabled={!slot.available}
              className={`
                p-3 border rounded-lg text-center transition-colors
                ${!slot.available
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                }
                ${selectedTimeSlot === slot
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-200'
                }
              `}
            >
              <div className="font-medium">{formatTime(slot.startTime)}</div>
              <div className="text-xs text-gray-500">30 min</div>
              {!slot.available && (
                <div className="text-xs text-red-500 mt-1">Ocupado</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Confirme seu Agendamento</h2>
        <p className="text-gray-600 mb-6">Revise os detalhes antes de confirmar</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Data</Label>
              <p className="text-lg">{selectedDate && formatDate(selectedDate)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Horário</Label>
              <p className="text-lg">
                {selectedTimeSlot && formatTime(selectedTimeSlot.startTime)} - {selectedTimeSlot && formatTime(selectedTimeSlot.endTime)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Cadeira</Label>
              <p className="text-lg">{selectedChair?.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Localização</Label>
              <p className="text-lg">{selectedChair?.location}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input
              id="notes"
              placeholder="Alguma observação especial..."
              {...register('notes')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(3)}
          className="flex-1"
        >
          Voltar
        </Button>
        <Button
          onClick={handleSubmit(handleConfirmBooking)}
          disabled={createBookingMutation.isPending}
          className="flex-1"
        >
          {createBookingMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando Agendamento...
            </>
          ) : (
            'Confirmar Agendamento'
          )}
        </Button>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Agendamento Confirmado!</h2>
        <p className="text-gray-600">
          Sua sessão foi agendada com sucesso. Você receberá um email de confirmação.
        </p>
      </div>

      {bookingSummary && (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">{formatDate(bookingSummary.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-medium">
                  {formatTime(bookingSummary.timeSlot.startTime)} - {formatTime(bookingSummary.timeSlot.endTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cadeira:</span>
                <span className="font-medium">{bookingSummary.chair.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Local:</span>
                <span className="font-medium">{bookingSummary.chair.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
        >
          Voltar ao Dashboard
        </Button>
        <Button
          onClick={() => {
            setCurrentStep(1)
            setSelectedDate(null)
            setSelectedChair(null)
            setSelectedTimeSlot(null)
            setBookingSummary(null)
          }}
        >
          Novo Agendamento
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Novo Agendamento</h1>
          <p className="text-gray-600">Agende sua sessão de massagem</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        ></div>
      </div>

      {/* Steps */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </CardContent>
      </Card>
    </div>
  )
} 