import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'

import { 
  Calendar, 
  Clock, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin
} from 'lucide-react'
import { format, addDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { bookingService } from '../../services/bookingService'
import { handleApiError } from '../../services/api'



export const BookingReschedulePage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const bookingId = parseInt(id || '0')
  const queryClient = useQueryClient()

  // Estados
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Buscar agendamento atual
  const { data: currentBooking, isLoading: bookingLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.getBookingById(bookingId),
    enabled: !!bookingId,
  })

  // Extrair os dados do agendamento
  const bookingData = (currentBooking as any)?.data || currentBooking

  // Buscar opções de reagendamento quando data é selecionada
  const { data: rescheduleOptions, isLoading: optionsLoading } = useQuery({
    queryKey: ['reschedule-options', bookingId, selectedDate],
    queryFn: () => {
      if (!bookingId || !selectedDate) return null
      return bookingService.getRescheduleOptions(bookingId, format(selectedDate, 'yyyy-MM-dd'))
    },
    enabled: !!bookingId && !!selectedDate,
    staleTime: 1 * 60 * 1000,
  })

  // Mutação para reagendar
  const rescheduleMutation = useMutation({
    mutationFn: async (data: { start_time: Date }) => {
      return bookingService.rescheduleBookingDateTime(bookingId, data.start_time)
    },
    onSuccess: () => {
      toast.success('Sessão reagendada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
      queryClient.invalidateQueries({ queryKey: ['reschedule-options'] })
      
      navigate('/bookings')
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error('Erro ao reagendar sessão', {
        description: apiError.message
      })
    }
  })

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
        setBookingNotes(bookingData.notes || '')
      } catch (error) {
        console.error('Erro ao inicializar dados do agendamento:', error)
      }
    }
  }, [bookingData])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime('')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleConfirmReschedule = () => {
    if (!selectedTime) {
      toast.error('Selecione um horário')
      return
    }

    setShowConfirmDialog(true)
  }

  const handleRescheduleConfirm = async () => {
    if (!selectedTime) return

    // Combinar data selecionada com horário selecionado
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const newStartTime = new Date(selectedDate)
    newStartTime.setHours(hours, minutes, 0, 0)

    const rescheduleData = {
      start_time: newStartTime
    }

    rescheduleMutation.mutate(rescheduleData)
  }

  const formatTime = (time: string) => {
    try {
      if (!time || typeof time !== 'string') {
        return '--:--'
      }
      
      // If time is already in HH:mm format, just return it
      if (/^\d{1,2}:\d{2}$/.test(time)) {
        const [hours, minutes] = time.split(':').map(Number)
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      }
      
      // If it's a Date object or ISO string, format it
      if (time.includes('T') || time.includes('-')) {
        const date = new Date(time)
        if (!isNaN(date.getTime())) {
          return format(date, 'HH:mm')
        }
      }
      
      return '--:--'
    } catch (error) {
      console.error('Erro ao formatar horário:', error, time)
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

  const generateAvailableDates = () => {
    const dates = []
    const today = startOfDay(new Date())
    
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i)
      dates.push({
        value: date,
        label: format(date, 'dd/MM', { locale: ptBR }),
        dayName: getDayName(date)
      })
    }
    
    return dates
  }

  if (bookingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Agendamento não encontrado</h2>
          <p className="text-gray-600 mb-4">O agendamento solicitado não foi encontrado.</p>
          <Button onClick={() => navigate('/bookings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Agendamentos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/bookings')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Reagendar Sessão</h1>
          <p className="text-gray-600">Altere a data e horário da sessão</p>
        </div>
      </div>

      {/* Dados da sessão atual */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Sessão Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Data Atual</Label>
              <p className="text-lg font-medium">
                {bookingData.start_time ? formatDate(new Date(bookingData.start_time)) : '--/--/----'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Horário Atual</Label>
              <p className="text-lg font-medium">
                {bookingData.start_time ? formatTime(bookingData.start_time) : '--:--'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Cadeira</Label>
              <p className="text-lg font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {bookingData.chair?.name || 'Cadeira não especificada'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <p className="text-lg font-medium">
                {bookingData.status === 'agendado' ? 'Agendado' : 
                 bookingData.status === 'confirmado' ? 'Confirmado' : 
                 bookingData.status === 'realizado' ? 'Realizado' : 
                 bookingData.status === 'cancelado' ? 'Cancelado' : 
                 bookingData.status === 'falta' ? 'Falta' : bookingData.status}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de nova data */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Nova Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
                      {date.dayName}
                    </span>
                    <span className="text-sm">
                      {date.label}
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

      {/* Seleção de novo horário */}
      {selectedDate && rescheduleOptions && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Novo Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            {optionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : !rescheduleOptions.available_slots || rescheduleOptions.available_slots.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum horário disponível para esta data</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {rescheduleOptions.available_slots.map((time: string, index: number) => (
                  <Button
                    key={index}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    onClick={() => handleTimeSelect(time)}
                    className="h-auto p-3 flex flex-col"
                  >
                    <span className="text-sm font-medium">
                      {formatTime(time)}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {selectedTime && (
        <Card className="mb-6">
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
      {selectedTime && (
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
                    {formatDate(selectedDate)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Novo Horário</Label>
                  <p className="text-lg font-medium">
                    {selectedTime ? formatTime(selectedTime) : '--:--'}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleConfirmReschedule}
                  disabled={rescheduleMutation.isPending}
                  className="w-full"
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

      {/* Dialog de confirmação */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Confirmar Reagendamento"
        message={`Tem certeza que deseja reagendar a sessão para ${formatDate(selectedDate)} às ${selectedTime ? formatTime(selectedTime) : '--:--'}?`}
        onConfirm={handleRescheduleConfirm}
        confirmText="Sim, Reagendar"
        cancelText="Cancelar"
      />
    </div>
  )
} 