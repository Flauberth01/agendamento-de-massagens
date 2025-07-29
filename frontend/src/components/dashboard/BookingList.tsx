import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, MoreHorizontal, Calendar, Clock, User, MapPin, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Booking } from '@/types/booking';

interface BookingListProps {
  bookings: Booking[];
  onEdit?: (booking: Booking) => void;
  onDelete?: (bookingId: number) => void;
  onView?: (booking: Booking) => void;
  isLoading?: boolean;
  error?: string;
  userRole?: 'usuario' | 'atendente' | 'admin';
}

export function BookingList({
  bookings,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  error,
  userRole = 'usuario'
}: BookingListProps) {
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(bookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  useEffect(() => {
    let filtered = [...bookings];

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.chair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Aplicar filtro de data
    if (dateFilter !== 'all') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(booking => {
            const bookingDate = new Date(booking.start_time);
            return bookingDate.toDateString() === today.toDateString();
          });
          break;
        case 'tomorrow':
          filtered = filtered.filter(booking => {
            const bookingDate = new Date(booking.start_time);
            return bookingDate.toDateString() === tomorrow.toDateString();
          });
          break;
        case 'week':
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          filtered = filtered.filter(booking => {
            const bookingDate = new Date(booking.start_time);
            return bookingDate >= today && bookingDate <= weekFromNow;
          });
          break;
        case 'past':
          filtered = filtered.filter(booking => {
            const bookingDate = new Date(booking.start_time);
            return bookingDate < today;
          });
          break;
      }
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
        case 'date-desc':
          return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
        case 'user':
          return a.user.name.localeCompare(b.user.name);
        case 'chair':
          return a.chair.name.localeCompare(b.chair.name);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, dateFilter, sortBy]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmado: { variant: 'default' as const, label: 'Confirmado' },
      cancelado: { variant: 'destructive' as const, label: 'Cancelado' },
      pendente: { variant: 'secondary' as const, label: 'Pendente' },
      realizado: { variant: 'outline' as const, label: 'Realizado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canEdit = (booking: Booking) => {
    if (userRole === 'admin') return true;
    if (userRole === 'atendente') return true;
    if (userRole === 'usuario') return booking.user.id === 1; // Assumindo que o usuário logado tem ID 1
    return false;
  };

  const canDelete = (booking: Booking) => {
    if (userRole === 'admin') return true;
    if (userRole === 'atendente') return true;
    if (userRole === 'usuario') return booking.user.id === 1 && booking.status === 'agendado';
    return false;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando agendamentos...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Lista de Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuário, cadeira ou observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="realizado">Realizado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as datas</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="tomorrow">Amanhã</SelectItem>
              <SelectItem value="week">Próxima semana</SelectItem>
              <SelectItem value="past">Passado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Data (mais antiga)</SelectItem>
              <SelectItem value="date-desc">Data (mais recente)</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="chair">Cadeira</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de agendamentos */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum agendamento encontrado
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{booking.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.chair.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(booking.start_time), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(booking.start_time), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}</span>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  {booking.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {booking.notes}
                    </p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(booking)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                    )}
                    {onEdit && canEdit(booking) && (
                      <DropdownMenuItem onClick={() => onEdit(booking)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onDelete && canDelete(booking) && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(booking.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>

        {/* Estatísticas */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">{filteredBookings.length}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {filteredBookings.filter(b => b.status === 'agendado').length}
              </div>
              <div className="text-muted-foreground">Agendados</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {filteredBookings.filter(b => b.status === 'confirmado').length}
              </div>
              <div className="text-muted-foreground">Confirmados</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {filteredBookings.filter(b => b.status === 'realizado').length}
              </div>
              <div className="text-muted-foreground">Realizados</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 