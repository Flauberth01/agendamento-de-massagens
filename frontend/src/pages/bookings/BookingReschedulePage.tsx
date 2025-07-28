import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'

import { 
  Calendar, 
  Clock, 
  Building, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin
} from 'lucide-react'
import { format, addDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { bookingService } from '../../services/bookingService'
import { chairService } from '../../services/chairService'
import { availabilityService } from '../../services/availabilityService'
import { handleApiError } from '../../services/api'
import type { Chair } from '../../types/chair'
import type { Booking } from '../../types/booking'

interface TimeSlot {
  startTime: Date
  endTime: Date
  available: boolean
  bookingId?: number
}

export const BookingReschedulePage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const bookingId = parseInt(id || '0')
  const queryClient = useQueryClient()

  // Estados
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [bookingNotes, setBookingNotes] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Buscar agendamento atual
  const { data: currentBooking, isLoading: bookingLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.getBookingById(bookingId),
    enabled: !!bookingId,
  })

  // Extrair os dados do agendamento (pode estar dentro de uma propriedade 'data')
  const bookingData = (currentBooking as any)?.data || currentBooking

  console.log('BookingReschedulePage - currentBooking:', currentBooking)
  console.log('BookingReschedulePage - bookingData:', bookingData)
  console.log('BookingReschedulePage - start_time:', bookingData?.start_time)
  console.log('BookingReschedulePage - end_time:', bookingData?.end_time)
  console.log('BookingReschedulePage - chair:', bookingData?.chair)
  console.log('BookingReschedulePage - status:', bookingData?.status)

  // Buscar cadeiras ativas
  const { data: chairsResponse, isLoading: chairsLoading } = useQuery({
    queryKey: ['chairs', 'active'],
    queryFn: () => chairService.getAllChairs({ status: 'ativa' }),
    staleTime: 5 * 60 * 1000,
  })

  // Buscar disponibilidade quando data e cadeira são selecionadas
  const { data: availabilityData, isLoading: availabilityLoading } = useQuery({
    queryKey: ['availability', selectedChair?.id, selectedDate],
    queryFn: () => {
      if (!selectedChair || !selectedDate) return null
      try {
        return availabilityService.getAvailableSlots({
          chairId: selectedChair.id,
          date: format(selectedDate, 'yyyy-MM-dd')
        })
      } catch (error) {
        console.error('Erro ao buscar disponibilidade:', error)
        return null
      }
    },
    enabled: !!selectedChair && !!selectedDate,
    staleTime: 1 * 60 * 1000,
  })

  // Mutação para reagendar
  const rescheduleMutation = useMutation({
    mutationFn: async (data: { start_time: Date; chair_id: number }) => {
      return bookingService.rescheduleBooking(bookingId, {
        start_time: data.start_time,
        chair_id: data.chair_id
      })
    },
    onSuccess: () => {
      toast.success('Sessão reagendada com sucesso!', {
        description: `Sua sessão foi reagendada para ${(() => {
          try {
            return format(selectedDate, 'dd/MM/yyyy')
          } catch (error) {
            return 'data selecionada'
          }
        })()} às ${(() => {
          try {
            if (!selectedTimeSlot) return 'horário selecionado'
            return format(selectedTimeSlot.startTime, 'HH:mm')
          } catch (error) {
            return 'horário selecionado'
          }
        })()}`
      })
      
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      
      navigate('/bookings')
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error('Erro ao reagendar sessão', {
        description: apiError.message
      })
    }
  })

  const availableChairs = Array.isArray(chairsResponse?.chairs) ? chairsResponse.chairs : []
  const availableTimeSlots = availabilityData?.data || []

  // Inicializar com dados do agendamento atual
  useEffect(() => {
    if (bookingData) {
      try {
        const startTime = new Date(bookingData.start_time)
        if (isNaN(startTime.getTime())) {
          console.error('Data de início inválida:', bookingData.start_time)
          return
        }
        setSelectedDate(startTime)
        setSelectedChair(bookingData.chair)
        setBookingNotes(bookingData.notes || '')
      } catch (error) {
        console.error('Erro ao inicializar dados do agendamento:', error)
      }
    }
  }, [bookingData])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTimeSlot(null)
  }

  const handleChairSelect = (chair: Chair) => {
    setSelectedChair(chair)
    setSelectedTimeSlot(null)
  }

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (timeSlot.available) {
      setSelectedTimeSlot(timeSlot)
    }
  }

  const handleConfirmReschedule = () => {
    if (!selectedChair || !selectedTimeSlot) {
      toast.error('Selecione uma cadeira e horário')
      return
    }

    setShowConfirmDialog(true)
  }

  const handleRescheduleConfirm = async () => {
    if (!selectedChair || !selectedTimeSlot) return

    const rescheduleData = {
      start_time: selectedTimeSlot.startTime,
      chair_id: selectedChair.id
    }

    rescheduleMutation.mutate(rescheduleData)
  }

  const formatTime = (date: Date) => {
    try {
      return format(date, 'HH:mm', { locale: ptBR })
    } catch (error) {
      console.error('Erro ao formatar horário:', error, date)
      return '--:--'
    }
  }

  const formatDate = (date: Date) => {
    try {
      return format(date, 'dd/MM/yyyy', { locale: ptBR })
    } catch (error) {
      console.error('Erro ao formatar data:', error, date)
      return '--/--/----'
    }
  }

  const getDayName = (date: Date) => {
    try {
      return format(date, 'EEEE', { locale: ptBR })
    } catch (error) {
      console.error('Erro ao obter nome do dia:', error, date)
      return '--'
    }
  }

  if (bookingLoading || chairsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sessão não encontrada
        </h3>
        <p className="text-gray-600 mb-4">
          A sessão que você está tentando reagendar não foi encontrada.
        </p>
        <Button onClick={() => navigate('/bookings')}>
          Voltar às Sessões
        </Button>
      </div>
    )
  }

  // Verificar se as datas são válidas
  try {
    const startDate = new Date(bookingData.start_time)
    const endDate = new Date(bookingData.end_time)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Datas inválidas no agendamento:', bookingData)
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Dados da sessão inválidos
          </h3>
          <p className="text-gray-600 mb-4">
            Os dados da sessão contêm informações inválidas.
          </p>
          <Button onClick={() => navigate('/bookings')}>
            Voltar às Sessões
          </Button>
        </div>
      )
    }
  } catch (error) {
    console.error('Erro ao validar datas:', error)
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar dados
        </h3>
        <p className="text-gray-600 mb-4">
          Ocorreu um erro ao carregar os dados da sessão.
        </p>
        <Button onClick={() => navigate('/bookings')}>
          Voltar às Sessões
        </Button>
      </div>
    )
  }

  // Função para gerar datas disponíveis (movida para dentro do return)
  const generateAvailableDates = () => {
    try {
      const dates = []
      const today = startOfDay(new Date())
      
      for (let i = 0; i < 30; i++) {
        const date = addDays(today, i)
        dates.push({
          value: date,
          label: format(date, 'EEEE, dd/MM/yyyy', { locale: ptBR }),
        })
      }
      
      return dates
    } catch (error) {
      console.error('Erro ao gerar datas disponíveis:', error)
      return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/bookings')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reagendar Sessão</h1>
          <p className="text-gray-600">Escolha uma nova data e horário para sua sessão</p>
        </div>
      </div>

      {/* Informações da sessão atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sessão Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Data Atual</Label>
              <p className="text-lg font-medium">
                {(() => {
                  try {
                    const startDate = new Date(bookingData.start_time)
                    if (isNaN(startDate.getTime())) {
                      return 'Data inválida'
                    }
                    return formatDate(startDate)
                  } catch (error) {
                    return 'Data inválida'
                  }
                })()}
              </p>
              <p className="text-sm text-gray-600">
                {(() => {
                  try {
                    const startDate = new Date(bookingData.start_time)
                    if (isNaN(startDate.getTime())) {
                      return '--'
                    }
                    return getDayName(startDate)
                  } catch (error) {
                    return '--'
                  }
                })()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Horário Atual</Label>
              <p className="text-lg font-medium">
                {(() => {
                  try {
                    const startDate = new Date(bookingData.start_time)
                    const endDate = new Date(bookingData.end_time)
                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                      return 'Horário inválido'
                    }
                    return `${formatTime(startDate)} - ${formatTime(endDate)}`
                  } catch (error) {
                    return 'Horário inválido'
                  }
                })()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Cadeira Atual</Label>
              <p className="text-lg font-medium">{bookingData.chair.name}</p>
              <p className="text-sm text-gray-600">{bookingData.chair.location}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <p className="text-lg font-medium capitalize">{bookingData.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de nova data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Nova Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {(() => {
              try {
                const dates = generateAvailableDates()
                return dates.map((date) => (
                  <Button
                    key={date.value.toISOString()}
                    variant={selectedDate.toDateString() === date.value.toDateString() ? 'default' : 'outline'}
                    onClick={() => handleDateSelect(date.value)}
                    className="h-auto p-3 flex flex-col"
                  >
                    <span className="text-xs font-medium">
                      {format(date.value, 'EEE', { locale: ptBR })}
                    </span>
                    <span className="text-sm">
                      {format(date.value, 'dd', { locale: ptBR })}
                    </span>
                  </Button>
                ))
              } catch (error) {
                console.error('Erro ao renderizar datas:', error)
                return (
                  <div className="col-span-full text-center py-4 text-gray-500">
                    Erro ao carregar datas disponíveis
                  </div>
                )
              }
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Seleção de cadeira */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Nova Cadeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableChairs.map((chair) => (
                <Button
                  key={chair.id}
                  variant={selectedChair?.id === chair.id ? 'default' : 'outline'}
                  onClick={() => handleChairSelect(chair)}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4" />
                    <span className="font-medium">{chair.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    {chair.location}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seleção de horário */}
      {selectedChair && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Novo Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availabilityLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {(() => {
                  try {
                    return availableTimeSlots.map((slot: any, index: number) => {
                      const startTime = new Date(slot.startTime)
                      const endTime = new Date(slot.endTime)
                      
                      // Verificar se as datas são válidas
                      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                        console.error('Datas inválidas no slot:', slot)
                        return null
                      }
                      
                      const timeSlot: TimeSlot = {
                        startTime,
                        endTime,
                        available: slot.available,
                        bookingId: slot.bookingId
                      }
                      
                      return (
                        <Button
                          key={index}
                          variant={
                            selectedTimeSlot?.startTime.getTime() === timeSlot.startTime.getTime()
                              ? 'default'
                              : timeSlot.available
                              ? 'outline'
                              : 'outline'
                          }
                          disabled={!timeSlot.available}
                          onClick={() => handleTimeSlotSelect(timeSlot)}
                          className="h-auto p-3 flex flex-col"
                        >
                          <span className="text-sm font-medium">
                            {formatTime(timeSlot.startTime)}
                          </span>
                          <span className="text-xs text-gray-600">
                            {formatTime(timeSlot.endTime)}
                          </span>
                          {!timeSlot.available && (
                            <span className="text-xs text-red-600 mt-1">Indisponível</span>
                          )}
                        </Button>
                      )
                    }).filter(Boolean) // Remove slots inválidos
                  } catch (error) {
                    console.error('Erro ao renderizar horários:', error)
                    return (
                      <div className="col-span-full text-center py-4 text-gray-500">
                        Erro ao carregar horários disponíveis
                      </div>
                    )
                  }
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {selectedTimeSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Observações (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Adicione observações sobre a sessão..."
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {/* Resumo e confirmação */}
      {selectedTimeSlot && selectedChair && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resumo do Reagendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Nova Data</Label>
                  <p className="text-lg font-medium">
                    {(() => {
                      try {
                        return formatDate(selectedDate)
                      } catch (error) {
                        return 'Data inválida'
                      }
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      try {
                        return getDayName(selectedDate)
                      } catch (error) {
                        return '--'
                      }
                    })()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Novo Horário</Label>
                  <p className="text-lg font-medium">
                    {(() => {
                      try {
                        if (!selectedTimeSlot) return 'Horário não selecionado'
                        return `${formatTime(selectedTimeSlot.startTime)} - ${formatTime(selectedTimeSlot.endTime)}`
                      } catch (error) {
                        return 'Horário inválido'
                      }
                    })()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Nova Cadeira</Label>
                  <p className="text-lg font-medium">{selectedChair?.name || 'Cadeira não selecionada'}</p>
                  <p className="text-sm text-gray-600">{selectedChair?.location || '--'}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/bookings')}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmReschedule}
                  disabled={rescheduleMutation.isPending}
                >
                  {rescheduleMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Reagendando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Reagendamento
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de confirmação */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleRescheduleConfirm}
        title="Confirmar Reagendamento"
        message={`Tem certeza que deseja reagendar sua sessão para ${(() => {
          try {
            return formatDate(selectedDate)
          } catch (error) {
            return 'data selecionada'
          }
        })()} às ${(() => {
          try {
            if (!selectedTimeSlot) return 'horário selecionado'
            return formatTime(selectedTimeSlot.startTime)
          } catch (error) {
            return 'horário selecionado'
          }
        })()}?`}
        confirmText="Sim, Reagendar"
        cancelText="Cancelar"
        variant="default"
      />
    </div>
  )
} 