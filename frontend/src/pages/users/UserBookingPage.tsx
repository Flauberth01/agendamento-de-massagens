import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Plus,
  Loader2,
  CalendarDays,
  Building,
  AlertCircle,
  ArrowLeft,
  Trash2,
  MapPin,
  User,
  Sparkles,
  XCircle
} from 'lucide-react'
import { format, addDays, startOfDay, isBefore, differenceInHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { bookingService } from '../../services/bookingService'
import { chairService } from '../../services/chairService'
import { handleApiError } from '../../services/api'
import { useAuth } from '../../stores/authStore'
import type { Booking, CreateBookingRequest } from '../../types/booking'
import type { Chair } from '../../types/chair'

interface TimeSlot {
  startTime: Date
  endTime: Date
  available: boolean
  bookingId?: number
}

export const UserBookingPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  // Estados
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingNotes, setBookingNotes] = useState('')
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)

  // Verificar se há um agendamento para cancelar na URL
  const cancelBookingId = searchParams.get('cancel')

  // Buscar cadeiras ativas
  const { data: chairsResponse } = useQuery({
    queryKey: ['chairs', 'active'],
    queryFn: () => chairService.getAllChairs({ status: 'ativa' }),
    staleTime: 5 * 60 * 1000,
  })

  // Buscar agendamentos do usuário (apenas para cancelamento via URL)
  const { data: userBookings } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: () => bookingService.getUserBookings(),
    staleTime: 1 * 60 * 1000,
  })

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
    staleTime: 1 * 60 * 1000,
  })

  // Mutação para criar agendamento
  const createBookingMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingService.createBooking(data),
    onSuccess: () => {
      toast.success('Agendamento criado com sucesso!', {
        description: `Sua sessão foi agendada para ${format(selectedDate, 'dd/MM/yyyy')} às ${format(selectedTimeSlot!.startTime, 'HH:mm')}`
      })
      
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      
      setShowBookingForm(false)
      setSelectedTimeSlot(null)
      setBookingNotes('')
      navigate('/dashboard')
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error('Erro ao criar agendamento', {
        description: apiError.message
      })
    }
  })

  // Mutação para cancelar agendamento
  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: number) => bookingService.cancelBooking(bookingId),
    onSuccess: () => {
      toast.success('Agendamento cancelado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      setShowCancelDialog(false)
      setBookingToCancel(null)
      navigate('/dashboard')
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error('Erro ao cancelar agendamento', {
        description: apiError.message
      })
    }
  })

  const availableChairs = Array.isArray(chairsResponse?.chairs) ? chairsResponse.chairs : []
  const userBookingsList = Array.isArray(userBookings?.data) ? userBookings.data : []

  // Verificar se o usuário já tem um agendamento ativo
  const activeBooking = userBookingsList.find(booking => 
    booking.status === 'agendado' || booking.status === 'confirmado'
  )

  // Verificar se há agendamento para cancelar na URL
  useEffect(() => {
    if (cancelBookingId) {
      const booking = userBookingsList.find(b => b.id === parseInt(cancelBookingId))
      if (booking) {
        setBookingToCancel(booking)
        setShowCancelDialog(true)
      }
    }
  }, [cancelBookingId, userBookingsList])

  // Funções utilitárias
  const canCancelBooking = (booking: Booking) => {
    const now = new Date()
    const bookingTime = new Date(booking.start_time)
    const hoursUntilBooking = differenceInHours(bookingTime, now)
    return hoursUntilBooking >= 3
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedChair(null)
    setSelectedTimeSlot(null)
  }

  const handleChairSelect = (chair: Chair) => {
    setSelectedChair(chair)
    setSelectedTimeSlot(null)
  }

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (timeSlot.available) {
      setSelectedTimeSlot(timeSlot)
      setShowBookingForm(true)
    }
  }

  const handleConfirmBooking = () => {
    if (!selectedChair || !selectedDate || !selectedTimeSlot) return

    const bookingData: CreateBookingRequest = {
      chair_id: selectedChair.id,
      start_time: selectedTimeSlot.startTime,
      notes: bookingNotes
    }

    createBookingMutation.mutate(bookingData)
  }

  const handleConfirmCancellation = () => {
    if (bookingToCancel) {
      cancelBookingMutation.mutate(bookingToCancel.id)
    } else if (activeBooking) {
      cancelBookingMutation.mutate(activeBooking.id)
    }
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Minimalista */}
      <div className="text-center space-y-2">
        {activeBooking ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-900">
              Agendamento Ativo
            </h2>
            <p className="text-muted-foreground">
              Você já possui um agendamento ativo. Cancele o atual para fazer um novo.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <Building className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">{activeBooking.chair?.name}</div>
                  <div className="text-sm text-muted-foreground">{activeBooking.chair?.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatDate(activeBooking.start_time)} às {formatTime(activeBooking.start_time)}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')} 
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleConfirmCancellation()}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar Agendamento
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-gray-900">
              Agendar Sessão de Massagem
            </h2>
            <p className="text-muted-foreground">
              Escolha a data, cadeira e horário para sua sessão
            </p>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-2 mx-auto mt-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </>
        )}
      </div>

      {/* Processo de Agendamento */}
      {!activeBooking && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Passo 1: Seleção de Data */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                Passo 1: Escolha a Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {Array.from({ length: 14 }, (_, i) => {
                  const date = addDays(new Date(), i)
                  const isDisabled = isDateDisabled(date)
                  const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                  
                  return (
                    <button
                      key={i}
                      onClick={() => !isDisabled && handleDateSelect(date)}
                      disabled={isDisabled}
                      className={`
                        p-3 border rounded-lg text-left transition-all duration-200
                        ${isDisabled 
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                          : 'hover:bg-blue-50 hover:border-blue-200 cursor-pointer'
                        }
                        ${isSelected
                          ? 'bg-blue-100 border-blue-300 text-blue-900 shadow-sm'
                          : 'bg-white border-gray-200'
                        }
                      `}
                    >
                      <div className="font-medium">{formatDate(date)}</div>
                      <div className="text-sm text-muted-foreground capitalize">{getDayName(date)}</div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Passo 2: Seleção de Cadeira */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5 text-green-600" />
                Passo 2: Escolha a Cadeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                availableChairs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Building className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma cadeira disponível</h3>
                    <p className="text-muted-foreground">Não há cadeiras ativas no momento.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableChairs.map((chair: Chair) => (
                      <button
                        key={chair.id}
                        onClick={() => handleChairSelect(chair)}
                        className={`
                          w-full p-4 border rounded-lg text-left transition-all duration-200
                          ${selectedChair?.id === chair.id
                            ? 'bg-green-50 border-green-300 text-green-900 shadow-sm'
                            : 'hover:bg-green-50 hover:border-green-200 bg-white border-gray-200'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Building className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-lg">{chair.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{chair.location}</span>
                        </div>
                        <div className="text-xs text-green-600 font-medium">✓ Disponível</div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-blue-400" />
                  </div>
                  <p className="text-muted-foreground">Selecione uma data primeiro</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Passo 3: Seleção de Horário */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-purple-600" />
                Passo 3: Escolha o Horário
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedChair && selectedDate ? (
                availabilityLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <span className="ml-3 text-muted-foreground">Carregando horários...</span>
                  </div>
                ) : availabilityData?.timeSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum horário disponível</h3>
                    <p className="text-muted-foreground">Não há horários disponíveis para esta data e cadeira.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {availabilityData?.timeSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleTimeSlotSelect({
                          startTime: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${slot.startTime}`),
                          endTime: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${slot.endTime}`),
                          available: slot.available,
                          bookingId: slot.bookingId
                        })}
                        disabled={!slot.available}
                        className={`
                          p-4 border rounded-lg text-center transition-all duration-200
                          ${!slot.available
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'hover:bg-purple-50 hover:border-purple-200 cursor-pointer bg-white border-gray-200'
                          }
                          ${selectedTimeSlot && 
                            format(selectedTimeSlot.startTime, 'HH:mm') === slot.startTime
                            ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-sm'
                            : ''
                          }
                        `}
                      >
                        <div className="font-semibold text-lg">{slot.startTime}</div>
                        <div className="text-xs text-muted-foreground">30 minutos</div>
                        {!slot.available && (
                          <div className="text-xs text-red-500 mt-1 font-medium">Ocupado</div>
                        )}
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Building className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="text-muted-foreground">Selecione uma cadeira primeiro</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Confirmação de Agendamento */}
      {showBookingForm && selectedChair && selectedDate && selectedTimeSlot && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-8 max-w-md w-full mx-4 border shadow-xl">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirmar Agendamento</h3>
              <p className="text-muted-foreground">Revise os detalhes da sua sessão</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Data:</span>
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Horário:</span>
                  <span className="font-medium">
                    {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Cadeira:</span>
                  <span className="font-medium">{selectedChair.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-muted-foreground">Local:</span>
                  <span className="font-medium">{selectedChair.location}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Alguma observação especial..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBookingForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={createBookingMutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  'Confirmar Agendamento'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Cancelamento */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleConfirmCancellation}
        title="Confirmar Cancelamento"
        message="Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita."
        confirmText="Confirmar Cancelamento"
        cancelText="Manter Agendamento"
        variant="destructive"
      />
    </div>
  )
} 