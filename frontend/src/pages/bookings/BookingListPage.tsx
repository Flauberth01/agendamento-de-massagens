import React, { useState, useEffect } from 'react'
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
  Clock, 
  Search, 
  Filter, 
  Plus, 
  UserCheck,
  XCircle,
  Loader2,
  Building,
  CalendarDays
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { formatTimeUntilBooking } from '../../utils/formatters'

export const BookingListPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAttendant, user, isAuthenticated } = useAuth()
  const { useUserBookings, useCancelBooking, useMarkAttendance, useMarkAsNoShow } = useBookings()

  // Verificar se usuário está autenticado
  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  // Estados
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [chairFilter, setChairFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)
  const [showNoShowDialog, setShowNoShowDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Buscar agendamentos do usuário (sem filtro de status para buscar todos)
  const { data: bookingsResponse, isLoading, error } = useUserBookings()

  // Mutações
  const cancelBookingMutation = useCancelBooking()
  const markAttendanceMutation = useMarkAttendance()
  const markAsNoShowMutation = useMarkAsNoShow()

  const bookings = bookingsResponse?.data || []

  // Ordenar agendamentos por data de criação (mais recentes primeiro)
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return dateB - dateA // Ordem decrescente (mais recente primeiro)
  })

  // Aplicar filtros
  const filteredBookings = sortedBookings.filter(booking => {
    
    // Filtro por termo de busca
    if (searchTerm && 
        !booking.chair?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !booking.chair?.location?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) {
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

  // Paginação
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex)

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateFilter, chairFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Agendado</Badge>
      case 'presenca_confirmada':
        return <Badge variant="default" className="bg-orange-500 text-white">Presença Confirmada</Badge>
      case 'realizado':
        return <Badge variant="default" className="bg-green-500 text-white">Realizado</Badge>
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
    
    // Não pode cancelar se já foi marcada presença (presenca_confirmada, realizado ou falta)
    if (booking.status === 'presenca_confirmada' || booking.status === 'realizado' || booking.status === 'falta') {
      return false
    }
    
    // Não pode cancelar se o agendamento já passou
    if (bookingTime < now) {
      return false
    }
    
    // Atendentes e admins podem cancelar agendamentos ativos
    // Usuários regulares só podem cancelar até 3 horas antes
    if (isAttendant || user?.role === 'admin') {
      return booking.status === 'agendado'
    }
    
    return booking.status === 'agendado' && now < threeHoursBefore
  }

  const canRescheduleBooking = (booking: Booking) => {
    const now = new Date()
    const bookingTime = new Date(booking.start_time)
    
    // Apenas atendentes e admins podem reagendar
    if (!(isAttendant || user?.role === 'admin')) {
      return false
    }
    
    // Não pode reagendar se já foi marcada presença (presenca_confirmada, realizado ou falta)
    if (booking.status === 'presenca_confirmada' || booking.status === 'realizado' || booking.status === 'falta') {
      return false
    }
    
    // Não pode reagendar se já foi cancelado
    if (booking.status === 'cancelado') {
      return false
    }
    
    // Não pode reagendar se o agendamento já passou
    if (bookingTime < now) {
      return false
    }
    
    // Pode reagendar se o agendamento está agendado e ainda não aconteceu
    return booking.status === 'agendado' && now < bookingTime
  }

  const canConfirmPresence = (booking: Booking) => {
    // Apenas atendentes e admins podem confirmar presença
    if (!(isAttendant || user?.role === 'admin')) {
      return false
    }
    
    // Só pode confirmar presença em agendamentos agendados
    if (booking.status === 'agendado') {
      return true
    }
    
    return false
  }

  const canMarkNoShow = (booking: Booking) => {
    // Apenas atendentes e admins podem marcar falta
    if (!(isAttendant || user?.role === 'admin')) {
      return false
    }
    
    // Só pode marcar falta em agendamentos agendados que já passaram
    if (booking.status === 'agendado') {
      const now = new Date()
      const bookingTime = new Date(booking.start_time)
      return bookingTime < now // Agendamento já passou
    }
    
    return false
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
    // Para reagendamento rápido, podemos implementar um modal
    // Por enquanto, navegar para página de reagendamento
    navigate(`/bookings/reschedule/${booking.id}`)
  }

  const handleConfirmPresence = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowAttendanceDialog(true)
  }

  const handleMarkNoShow = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowNoShowDialog(true)
  }

  const handleNewBooking = () => {
    navigate('/bookings/create')
  }

  const handleCancelConfirm = async () => {
    if (!selectedBooking || !user) return
    
    try {
      await cancelBookingMutation.mutateAsync({ 
        id: selectedBooking.id, 
        reason: 'Cancelado pelo usuário'
      })
      setShowCancelDialog(false)
      setSelectedBooking(null)
      toast.success('Agendamento cancelado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao cancelar agendamento:', error)
      
      let errorMessage = 'Erro ao cancelar agendamento. Tente novamente.'
      
      if (error?.response?.data?.error) {
        const backendError = error.response.data.error
        
        if (backendError.includes('não encontrado')) {
          errorMessage = '❌ Agendamento não encontrado. Tente recarregar a página.'
        } else if (backendError.includes('não pode ser cancelado')) {
          errorMessage = '⚠️ Este agendamento não pode ser cancelado. Verifique as regras de cancelamento.'
        } else {
          errorMessage = `❌ ${backendError}`
        }
      }
      
      toast.error(errorMessage)
    }
  }

  const handleAttendanceConfirm = async () => {
    if (!selectedBooking || !user) return
    
    try {
      await markAttendanceMutation.mutateAsync({ 
        id: selectedBooking.id, 
        attended: true,
        markedBy: user.id
      })
      setShowAttendanceDialog(false)
      setSelectedBooking(null)
      toast.success('Presença confirmada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao confirmar presença:', error)
      
      let errorMessage = 'Erro ao confirmar presença. Tente novamente.'
      
      if (error?.response?.data?.error) {
        const backendError = error.response.data.error
        
        if (backendError.includes('não encontrado')) {
          errorMessage = '❌ Agendamento não encontrado. Tente recarregar a página.'
        } else if (backendError.includes('já foi confirmada')) {
          errorMessage = '⚠️ A presença já foi confirmada para este agendamento.'
        } else {
          errorMessage = `❌ ${backendError}`
        }
      }
      
      toast.error(errorMessage)
    }
  }

  const handleNoShowConfirm = async () => {
    if (!selectedBooking || !user) return
    
    try {
      await markAsNoShowMutation.mutateAsync({ 
        id: selectedBooking.id, 
        markedBy: user.id
      })
      setShowNoShowDialog(false)
      setSelectedBooking(null)
      toast.success('Falta marcada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao marcar falta:', error)
      
      // Mensagem amigável baseada no erro
      let errorMessage = 'Erro ao marcar falta. Tente novamente.'
      
      if (error?.response?.data?.error) {
        const backendError = error.response.data.error
        
        if (backendError.includes('já passaram')) {
          errorMessage = '⚠️ Só é possível marcar como falta agendamentos que já passaram. Aguarde o horário da sessão para marcar a falta.'
        } else if (backendError.includes('não encontrado')) {
          errorMessage = '❌ Agendamento não encontrado. Tente recarregar a página.'
        } else {
          errorMessage = `❌ ${backendError}`
        }
      }
      
      toast.error(errorMessage)
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
          {!isAttendant && user?.role !== 'admin' && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-1">ℹ️ Status dos Agendamentos:</h3>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• <strong>Agendado:</strong> Aguardando confirmação do atendente</li>
                <li>• <strong>Presença Confirmada:</strong> Presença confirmada - aguardando término da sessão</li>
                <li>• <strong>Realizado:</strong> Sessão realizada com sucesso</li>
                <li>• <strong>Cancelado:</strong> Agendamento cancelado</li>
                <li>• <strong>Falta:</strong> Não compareceu à sessão</li>
              </ul>
            </div>
          )}
        </div>
        {!isAttendant && (
          <Button onClick={() => handleNewBooking()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        )}
      </div>

      {/* Notificação de Confirmação - REMOVER pois não vamos mais confirmar agendamentos */}
      {/* {confirmedBookingId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">Agendamento Confirmado!</h3>
              <p className="text-sm text-green-700 mt-1">
                O status foi alterado para "Confirmado". O cliente receberá um email de confirmação.
              </p>
            </div>
            <button
              onClick={() => setConfirmedBookingId(null)}
              className="text-green-400 hover:text-green-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )} */}

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
                  placeholder="Buscar por cadeira, localização, cliente..."
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
                  <SelectItem value="presenca_confirmada">Presença Confirmada</SelectItem>
                  <SelectItem value="realizado">Realizado</SelectItem>
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
            {totalPages > 1 && (
              <span className="text-sm font-normal text-gray-500">
                - Página {currentPage} de {totalPages}
              </span>
            )}
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
                <Button onClick={() => handleNewBooking()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Primeira Sessão
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedBookings.map((booking) => (
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
                       
                       {/* Informações do Usuário */}
                       <div className="mb-3 p-2 bg-gray-50 rounded-md">
                         <div className="flex items-center gap-2 mb-1">
                           <UserCheck className="h-4 w-4 text-gray-500" />
                           <span className="text-sm font-medium text-gray-700">Cliente</span>
                         </div>
                         <div className="text-sm">
                           <p className="font-medium text-gray-900">
                             {booking.user?.name?.split(' ').slice(0, 2).join(' ') || 'Usuário não informado'}
                           </p>
                           <p className="text-gray-600 text-xs">{booking.user?.email || 'Email não informado'}</p>
                         </div>
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
                       
                       {/* Tempo restante para agendamentos futuros */}
                       {isUpcoming(booking) && (
                         <div className="mb-3 p-2 bg-blue-50 rounded-md">
                           <div className="flex items-center gap-2">
                             <Clock className="h-4 w-4 text-blue-600" />
                             <span className="text-sm font-medium text-blue-700">
                               {formatTimeUntilBooking(booking.start_time)}
                             </span>
                           </div>
                         </div>
                       )}

                       {booking.notes && (
                         <div className="mt-3">
                           <span className="text-gray-600 text-sm">Observações:</span>
                           <p className="text-sm mt-1">{booking.notes}</p>
                         </div>
                       )}
                     </div>

                     <div className="flex flex-col items-end gap-3 min-w-fit">
                       {/* Botões de Ação - Organizados por Prioridade */}
                       
                       {/* Ações Primárias (Atendentes/Admins) */}
                       {(canConfirmPresence(booking) || canMarkNoShow(booking)) && (
                         <div className="flex flex-col gap-2 w-full">
                           {canConfirmPresence(booking) && (
                             <Button
                               size="sm"
                               variant="default"
                               onClick={() => handleConfirmPresence(booking)}
                               className="bg-green-600 hover:bg-green-700 text-white w-full"
                             >
                               <UserCheck className="h-4 w-4 mr-2" />
                               Confirmar Presença
                             </Button>
                           )}

                           {canMarkNoShow(booking) && (
                             <Button
                               size="sm"
                               variant="destructive"
                               onClick={() => handleMarkNoShow(booking)}
                               className="bg-red-600 hover:bg-red-700 text-white w-full"
                             >
                               <XCircle className="h-4 w-4 mr-2" />
                               Marcar Falta
                             </Button>
                           )}
                         </div>
                       )}

                       {/* Ações Secundárias (Todos os Usuários) */}
                       {(canCancelBooking(booking) || canRescheduleBooking(booking)) && (
                         <div className="flex gap-2">
                           {canCancelBooking(booking) && (
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => handleCancelBooking(booking)}
                               className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
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
                               className="text-blue-600 border-blue-200 hover:text-blue-700 hover:bg-blue-50"
                             >
                               <CalendarDays className="h-4 w-4 mr-1" />
                               Reagendar
                             </Button>
                           )}
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredBookings.length)} de {filteredBookings.length} agendamentos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
        title="Confirmar Presença"
        message="Tem certeza que deseja confirmar a presença deste cliente?"
        onConfirm={handleAttendanceConfirm}
        confirmText="Confirmar Presença"
        cancelText="Cancelar"
      />

      {/* Diálogo de Confirmação de Falta */}
      <ConfirmDialog
        isOpen={showNoShowDialog}
        onClose={() => setShowNoShowDialog(false)}
        title="Marcar Falta"
        message="Tem certeza que deseja marcar este cliente como falta?"
        onConfirm={handleNoShowConfirm}
        confirmText="Marcar Falta"
        cancelText="Cancelar"
        variant="destructive"
      />

    </div>
  )
} 