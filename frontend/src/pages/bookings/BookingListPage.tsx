import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { useBookings } from '../../hooks/useBookings'
import { useAuth } from '../../hooks/useAuth'
import type { Booking } from '../../types/booking'

import { 
  Calendar, 
  Plus,
  Search,
  Filter,
  Loader2,
  XCircle,
  Building,
  Clock,
  UserCheck,
  CalendarDays
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const BookingListPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAttendant, user, isAuthenticated } = useAuth()
  const { useUserBookings, useCancelBooking, useMarkAttendance } = useBookings()

  // Verificar se usuário está autenticado
  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  // Estados
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [chairFilter, setChairFilter] = useState<string>('')
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Buscar agendamentos do usuário (sem filtro de status para buscar todos)
  const { data: bookingsResponse, isLoading, error } = useUserBookings()

  // Mutações
  const cancelBookingMutation = useCancelBooking()
  const markAttendanceMutation = useMarkAttendance()

  const bookings = bookingsResponse?.data || []
  

  
  // Aplicar filtros
  const filteredBookings = bookings.filter(booking => {
    // Filtro por termo de busca
    if (searchTerm && !booking.chair?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !booking.chair?.location?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Filtro por status
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false
    }
    
    // Filtro por data
    if (dateFilter) {
      const bookingDate = format(new Date(booking.start_time), 'yyyy-MM-dd')
      if (bookingDate !== dateFilter) {
        return false
      }
    }
    
    // Filtro por cadeira
    if (chairFilter && !booking.chair?.name?.toLowerCase().includes(chairFilter.toLowerCase())) {
      return false
    }
    
    return true
  })

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

  const formatDate = (dateTime: Date | string) => {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime
    return format(date, 'dd/MM/yyyy', { locale: ptBR })
  }

  const formatTime = (dateTime: Date | string) => {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime
    return format(date, 'HH:mm', { locale: ptBR })
  }

  const canCancelBooking = (booking: Booking) => {
    const now = new Date()
    const bookingTime = new Date(booking.start_time)
    const threeHoursBefore = new Date(bookingTime.getTime() - 3 * 60 * 60 * 1000)
    
    return booking.status === 'agendado' && now < threeHoursBefore
  }

  const canRescheduleBooking = (booking: Booking) => {
    const now = new Date()
    const bookingTime = new Date(booking.start_time)
    
    // Pode reagendar se o agendamento está agendado e ainda não aconteceu
    // ou se aconteceu há menos de 2 horas (para permitir reagendamento de sessões recentes)
    const twoHoursAfter = new Date(bookingTime.getTime() + 2 * 60 * 60 * 1000)
    
    return booking.status === 'agendado' && now < twoHoursAfter
  }

  const canConfirmPresence = (booking: Booking) => {
    const now = new Date()
    const bookingTime = new Date(booking.start_time)
    
    // Pode confirmar presença se o agendamento está confirmado e a sessão já começou
    // (permite marcar presença mesmo após o horário da sessão)
    return booking.status === 'confirmado' && now >= bookingTime
  }

  const isUpcoming = (booking: Booking) => {
    const now = new Date()
    const bookingTime = new Date(booking.start_time)
    return bookingTime > now
  }

  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowCancelDialog(true)
  }

  const handleRescheduleBooking = (booking: Booking) => {
    // Navegar para página de reagendamento
    navigate(`/bookings/reschedule/${booking.id}`)
  }

  const handleConfirmPresence = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowAttendanceDialog(true)
  }



  const handleNewBooking = () => {
    navigate('/bookings/create')
  }

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return
    
    try {
      await cancelBookingMutation.mutateAsync({ 
        id: selectedBooking.id, 
        reason: 'Cancelado pelo usuário' 
      })
      setShowCancelDialog(false)
      setSelectedBooking(null)
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
    }
  }

  const handleAttendanceConfirm = async () => {
    if (!selectedBooking) return
    
    try {
      await markAttendanceMutation.mutateAsync({ 
        id: selectedBooking.id, 
        attended: true 
      })
      setShowAttendanceDialog(false)
      setSelectedBooking(null)
    } catch (error) {
      console.error('Erro ao confirmar presença:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar agendamentos
          </h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Sessões</h1>
          <p className="text-gray-600">Gerencie suas sessões de massagem</p>
        </div>
        {!isAttendant && (
          <Button onClick={handleNewBooking}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por cadeira, localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="falta">Falta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Data
              </label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filtrar por data"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Cadeira
              </label>
              <Input
                placeholder="Filtrar por cadeira"
                value={chairFilter}
                onChange={(e) => setChairFilter(e.target.value)}
              />
            </div>
            
          </div>
        </CardContent>
      </Card>



      {/* Lista de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Todas as Sessões ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma sessão encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || dateFilter || chairFilter
                  ? 'Tente ajustar os filtros de busca'
                  : 'Você ainda não possui sessões agendadas'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && !dateFilter && !chairFilter && !isAttendant && (
                <Button onClick={handleNewBooking}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Primeira Sessão
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                                 <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                   <div className="flex items-start gap-4">
                     <div className="flex-1">
                       <div className="flex items-center gap-3 mb-3">
                         <Building className="h-5 w-5 text-blue-500" />
                         <div>
                           <h3 className="font-medium">{booking.chair?.name}</h3>
                           <p className="text-sm text-gray-600">{booking.chair?.location}</p>
                         </div>
                         {isUpcoming(booking) && (
                           <Badge variant="outline" className="bg-blue-50 text-blue-700">
                             <Clock className="h-3 w-3 mr-1" />
                             Próxima
                           </Badge>
                         )}
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                         <div>
                           <span className="text-gray-600">Data:</span>
                           <p className="font-medium">{formatDate(booking.start_time)}</p>
                         </div>
                         <div>
                           <span className="text-gray-600">Horário:</span>
                           <p className="font-medium">
                             {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                           </p>
                         </div>
                         <div>
                           <span className="text-gray-600">Status:</span>
                           <div className="mt-1">{getStatusBadge(booking.status)}</div>
                         </div>
                       </div>

                       {booking.notes && (
                         <div className="mt-3">
                           <span className="text-gray-600 text-sm">Observações:</span>
                           <p className="text-sm mt-1">{booking.notes}</p>
                         </div>
                       )}
                     </div>

                     <div className="flex flex-col items-end gap-2 min-w-fit">
                        {/* Botões de ação baseados no status */}
                       <div className="flex gap-2">
                         {canCancelBooking(booking) && (
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleCancelBooking(booking)}
                             className="text-red-600 hover:text-red-700 hover:bg-red-50"
                           >
                             <XCircle className="h-4 w-4 mr-1" />
                             Cancelar
                           </Button>
                         )}

                         {canRescheduleBooking(booking) && (
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleRescheduleBooking(booking)}
                             className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                           >
                             <CalendarDays className="h-4 w-4 mr-1" />
                             Reagendar
                           </Button>
                         )}
                       </div>

                       {canConfirmPresence(booking) && (
                         <Button
                           size="sm"
                           variant="default"
                           onClick={() => handleConfirmPresence(booking)}
                           className="bg-green-600 hover:bg-green-700 text-white"
                         >
                           <UserCheck className="h-4 w-4 mr-1" />
                           Confirmar Presença
                         </Button>
                       )}
                     </div>
                   </div>
                 </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação de Cancelamento */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelConfirm}
        title="Cancelar Sessão"
        message="Tem certeza que deseja cancelar esta sessão? Esta ação não pode ser desfeita."
        confirmText="Sim, Cancelar"
        cancelText="Não, Manter"
        variant="destructive"
      />

      {/* Diálogo de Confirmação de Presença */}
      <ConfirmDialog
        isOpen={showAttendanceDialog}
        onClose={() => setShowAttendanceDialog(false)}
        onConfirm={handleAttendanceConfirm}
        title="Confirmar Presença"
        message="Confirmar que o cliente compareceu à sessão?"
        confirmText="Sim, Confirmar"
        cancelText="Cancelar"
        variant="default"
      />
    </div>
  )
} 