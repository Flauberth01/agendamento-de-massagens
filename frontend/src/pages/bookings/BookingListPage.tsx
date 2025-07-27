import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

import { 
  Calendar, 
 
  Plus,
  Search,
  Filter,
  Loader2,
  XCircle,
  Eye,
  Building
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Booking {
  id: number
  chair: {
    name: string
    location: string
  }
  start_time: string
  end_time: string
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido' | 'falta'
  notes?: string
  created_at: string
}

export const BookingListPage: React.FC = () => {
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      const mockBookings: Booking[] = [
        {
          id: 1,
          chair: { name: 'Cadeira 1', location: 'Sala de Massagem A' },
          start_time: '2024-01-16T14:00:00Z',
          end_time: '2024-01-16T14:30:00Z',
          status: 'agendado',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          chair: { name: 'Cadeira 2', location: 'Sala de Massagem B' },
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T10:30:00Z',
          status: 'concluido',
          created_at: '2024-01-14T15:00:00Z'
        },
        {
          id: 3,
          chair: { name: 'Cadeira 1', location: 'Sala de Massagem A' },
          start_time: '2024-01-12T16:00:00Z',
          end_time: '2024-01-12T16:30:00Z',
          status: 'concluido',
          created_at: '2024-01-11T14:00:00Z'
        },
        {
          id: 4,
          chair: { name: 'Cadeira 3', location: 'Sala de Massagem C' },
          start_time: '2024-01-10T09:00:00Z',
          end_time: '2024-01-10T09:30:00Z',
          status: 'cancelado',
          created_at: '2024-01-09T16:00:00Z'
        }
      ]

      setBookings(mockBookings)
      setFilteredBookings(mockBookings)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filtrar agendamentos
  useEffect(() => {
    let filtered = bookings

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.chair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.chair.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }, [bookings, searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Badge variant="secondary">Agendado</Badge>
      case 'confirmado':
        return <Badge variant="default">Confirmado</Badge>
      case 'concluido':
        return <Badge variant="default" className="bg-green-500">Concluído</Badge>
      case 'falta':
        return <Badge variant="destructive">Falta</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }



  const formatDate = (dateTime: string) => {
    return format(new Date(dateTime), 'dd/MM/yyyy', { locale: ptBR })
  }

  const formatTime = (dateTime: string) => {
    return format(new Date(dateTime), 'HH:mm', { locale: ptBR })
  }

  const handleCancelBooking = (bookingId: number) => {
    // Implementar cancelamento de agendamento
    console.log('Cancelar agendamento:', bookingId)
  }

  const handleViewBooking = (bookingId: number) => {
    // Implementar visualização de detalhes
    console.log('Ver agendamento:', bookingId)
  }

  const handleNewBooking = () => {
    navigate('/bookings/create')
  }

  const canCancelBooking = (booking: Booking) => {
    const now = new Date()
    const bookingTime = new Date(booking.start_time)
    const threeHoursBefore = new Date(bookingTime.getTime() - 3 * 60 * 60 * 1000)
    
    return booking.status === 'agendado' && now < threeHoursBefore
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h1>
          <p className="text-gray-600">Gerencie suas sessões de massagem</p>
        </div>
        <Button onClick={handleNewBooking}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Agendamentos ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Você ainda não possui agendamentos'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={handleNewBooking}>
                  <Plus className="h-4 w-4 mr-2" />
                  Fazer Primeiro Agendamento
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="font-medium">{booking.chair.name}</h3>
                          <p className="text-sm text-gray-600">{booking.chair.location}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewBooking(booking.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      
                      {canCancelBooking(booking) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
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
    </div>
  )
} 