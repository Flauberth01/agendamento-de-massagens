import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Power, PowerOff, Trash2, Calendar, Clock, User, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useChairs } from '../../hooks/useChairs';
import type { Chair } from '../../types/chair';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';

interface Booking {
  id: string;
  user_name: string;
  date: string;
  time_slot: string;
  status: 'confirmado' | 'pendente' | 'cancelado' | 'concluido';
}

export default function ChairDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const chairId = parseInt(id || '0');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const { useChairById, useToggleChairStatus, useDeleteChair } = useChairs();
  const { data: chair, isLoading, error } = useChairById(chairId);
  const toggleStatusMutation = useToggleChairStatus();
  const deleteMutation = useDeleteChair();

  // Simular agendamentos (em um sistema real, isso viria da API)
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        user_name: 'João Silva',
        date: '2024-01-25',
        time_slot: '09:00 - 09:30',
        status: 'confirmado'
      },
      {
        id: '2',
        user_name: 'Maria Santos',
        date: '2024-01-25',
        time_slot: '10:00 - 10:30',
        status: 'pendente'
      },
      {
        id: '3',
        user_name: 'Pedro Costa',
        date: '2024-01-26',
        time_slot: '14:00 - 14:30',
        status: 'confirmado'
      }
    ];
    setBookings(mockBookings);
  }, []);

  const getStatusBadge = (status: string) => {
    return status === 'ativa' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Ativa
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        Inativa
      </Badge>
    );
  };

  const getBookingStatusBadge = (status: string) => {
    const statusConfig = {
      confirmado: { label: 'Confirmado', className: 'bg-green-100 text-green-800' },
      pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
      concluido: { label: 'Concluído', className: 'bg-blue-100 text-blue-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('pt-BR');
  };

  const handleBack = () => {
    navigate('/chairs');
  };

  const handleEdit = () => {
    navigate(`/chairs/${chairId}/edit`);
  };

  const handleToggleStatus = async () => {
    if (!chair) return;
    
    try {
      const newStatus = chair.status === 'ativa' ? false : true;
      await toggleStatusMutation.mutateAsync({ id: chairId, active: newStatus });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!chair) return;
    
    try {
      await deleteMutation.mutateAsync(chairId);
      navigate('/chairs');
    } catch (error) {
      console.error('Erro ao excluir cadeira:', error);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erro ao carregar cadeira</h1>
          <p className="text-muted-foreground mt-2">A cadeira não foi encontrada ou ocorreu um erro.</p>
          <Button onClick={() => navigate('/chairs')} className="mt-4">
            Voltar à lista
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando dados da cadeira...</p>
        </div>
      </div>
    );
  }

  if (!chair) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Cadeira não encontrada</h1>
          <Button onClick={() => navigate('/chairs')} className="mt-4">
            Voltar à lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{chair.name}</h1>
            <p className="text-muted-foreground">
              Detalhes da cadeira
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={toggleStatusMutation.isPending}
            className="flex items-center gap-2"
          >
            {chair.status === 'ativa' ? (
              <>
                <PowerOff className="h-4 w-4" />
                Desativar
              </>
            ) : (
              <>
                <Power className="h-4 w-4" />
                Ativar
              </>
            )}
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações da Cadeira */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Cadeira</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              {getStatusBadge(chair.status)}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Localização:</span>
              </div>
              <p className="pl-6">{chair.location}</p>
            </div>
            
            {chair.description && (
              <div className="space-y-2">
                <span className="font-medium text-sm">Descrição:</span>
                <p className="text-sm text-muted-foreground">{chair.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Criado em</h4>
                <p className="mt-1 text-sm">{formatDate(chair.created_at)}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Última atualização</h4>
                <p className="mt-1 text-sm">{formatDate(chair.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
                <div className="text-sm text-muted-foreground">Total de Agendamentos</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'confirmado').length}
                </div>
                <div className="text-sm text-muted-foreground">Confirmados</div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'pendente').length}
              </div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agendamentos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendamentos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{booking.user_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(booking.date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{booking.time_slot}</span>
                    </div>
                  </div>
                  
                  {getBookingStatusBadge(booking.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a cadeira "${chair?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
} 