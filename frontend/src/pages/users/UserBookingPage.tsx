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
  Eye,
  Trash2,
  MapPin,
  User
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
  const [viewMode, setViewMode] = useState<'calendar' | 'my-bookings'>('calendar')
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

  // Buscar agendamentos do usuário
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

  // Verificar se há agendamento para cancelar na URL
  useEffect(() => {
    if (cancelBookingId) {
      const booking = userBookingsList.find(b => b.id === parseInt(cancelBookingId))
      if (booking) {
        setBookingToCancel(booking)
        setShowCancelDialog(true)
        setViewMode('my-bookings')
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

  const getTimeUntilBooking = (booking: Booking) => {
    const now = new Date()
    const bookingTime = new Date(booking.start_time)
    const diffInHours = differenceInHours(bookingTime, now)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((bookingTime.getTime() - now.getTime()) / (1000 * 60))
      return `${diffInMinutes} minutos`
    } else if (diffInHours < 24) {
      return `${diffInHours} horas`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} dias`
    }
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

  const handleCancelBooking = (booking: Booking) => {
    if (!canCancelBooking(booking)) {
      toast.error('Não é possível cancelar este agendamento', {
        description: 'O cancelamento deve ser feito com pelo menos 3 horas de antecedência.'
      })
      return
    }
    
    setBookingToCancel(booking)
    setShowCancelDialog(true)
  }

  const handleConfirmCancellation = () => {
    if (bookingToCancel) {
      cancelBookingMutation.mutate(bookingToCancel.id)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Agendado</Badge>
      case 'confirmado':
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmado</Badge>
      case 'concluido':
        return <Badge variant="default" className="bg-green-500 text-white">Concluído</Badge>
      case 'falta':
        return <Badge variant="destructive">Falta</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const upcomingBookings = userBookingsList.filter(booking => 
    booking.status === 'agendado' || booking.status === 'confirmado'
  )

  const pastBookings = userBookingsList.filter(booking => 
    booking.status === 'concluido' || booking.status === 'cancelado' || booking.status === 'falta'
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <p className="text-muted-foreground">Agende sua sessão de massagem de forma simples</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendário
          </Button>
          <Button
            variant={viewMode === 'my-bookings' ? 'default' : 'outline'}
            onClick={() => setViewMode('my-bookings')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Meus Agendamentos
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seleção de Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Selecione uma Data
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
                        p-3 border rounded-lg text-left transition-colors
                        ${isDisabled 
                          ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                          : 'hover:bg-accent hover:border-accent-foreground cursor-pointer'
                        }
                        ${isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border'
                        }
                      `}
                    >
                      <div className="font-medium">{formatDate(date)}</div>
                      <div className="text-sm text-muted-foreground">{getDayName(date)}</div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Cadeira */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Selecione uma Cadeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                availableChairs.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma cadeira disponível</h3>
                    <p className="text-muted-foreground">Não há cadeiras ativas no momento.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableChairs.map((chair: Chair) => (
                      <button
                        key={chair.id}
                        onClick={() => handleChairSelect(chair)}
                        className={`
                          w-full p-3 border rounded-lg text-left transition-colors
                          ${selectedChair?.id === chair.id
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'hover:bg-accent hover:border-accent-foreground'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Building className="h-4 w-4" />
                          <span className="font-medium">{chair.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{chair.location}</div>
                        <div className="text-xs text-green-600 mt-1">Disponível</div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Selecione uma data primeiro</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seleção de Horário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Selecione um Horário
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedChair && selectedDate ? (
                availabilityLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Carregando horários...</span>
                  </div>
                ) : availabilityData?.timeSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum horário disponível</h3>
                    <p className="text-muted-foreground">Não há horários disponíveis para esta data e cadeira.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
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
                          p-3 border rounded-lg text-center transition-colors
                          ${!slot.available
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'hover:bg-accent hover:border-accent-foreground cursor-pointer'
                          }
                          ${selectedTimeSlot && 
                            format(selectedTimeSlot.startTime, 'HH:mm') === slot.startTime
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-background border-border'
                          }
                        `}
                      >
                        <div className="font-medium">{slot.startTime}</div>
                        <div className="text-xs text-muted-foreground">30 min</div>
                        {!slot.available && (
                          <div className="text-xs text-destructive mt-1">Ocupado</div>
                        )}
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Selecione uma cadeira primeiro</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Visualização dos Meus Agendamentos */
        <div className="space-y-6">
          {/* Próximos Agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Você não possui agendamentos futuros</p>
                  <Button onClick={() => setViewMode('calendar')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Nova Sessão
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Building className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">{booking.chair?.name}</div>
                            <div className="text-sm text-muted-foreground">{booking.chair?.location}</div>
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Data:</span>
                          <p className="font-medium">{formatDate(new Date(booking.start_time))}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Horário:</span>
                          <p className="font-medium">
                            {formatTime(new Date(booking.start_time))} - {formatTime(new Date(booking.end_time))}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tempo restante:</span>
                          <p className="font-medium text-primary">{getTimeUntilBooking(booking)}</p>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mb-3">
                          <span className="text-muted-foreground text-sm">Observações:</span>
                          <p className="text-sm mt-1">{booking.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {canCancelBooking(booking) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCancelBooking(booking)}
                            disabled={cancelBookingMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                        <Button size="sm" className="flex-1" onClick={() => setViewMode('calendar')}>
                          <Plus className="h-4 w-4 mr-1" />
                          Agendar Outra
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Sessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pastBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum histórico disponível</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Building className="h-4 w-4 text-primary" />
                          <div className="font-medium">{booking.chair?.name}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(new Date(booking.start_time))} às {formatTime(new Date(booking.start_time))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Confirmação de Agendamento */}
      {showBookingForm && selectedChair && selectedDate && selectedTimeSlot && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 border shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Confirmar Agendamento</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Data:</span>
                  <p className="font-medium">{formatDate(selectedDate)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Horário:</span>
                  <p className="font-medium">
                    {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cadeira:</span>
                  <p className="font-medium">{selectedChair.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Local:</span>
                  <p className="font-medium">{selectedChair.location}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Alguma observação especial..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="mt-1"
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
                className="flex-1"
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