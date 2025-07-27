import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Power, PowerOff, Trash2, Calendar, Clock, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface Chair {
  id: string;
  name: string;
  description: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

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
  const [chair, setChair] = useState<Chair | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const mockChair: Chair = {
      id: id || '1',
      name: 'Cadeira Principal',
      description: 'Cadeira principal do consultório, localizada na sala 1. Equipada com todos os instrumentos necessários para atendimento odontológico.',
      status: 'ativo',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    };

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

    setTimeout(() => {
      setChair(mockChair);
      setBookings(mockBookings);
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const getStatusBadge = (status: string) => {
    return status === 'ativo' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        Inativo
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };



  const handleBack = () => {
    navigate('/chairs');
  };

  const handleEdit = () => {
    navigate(`/chairs/${id}/edit`);
  };

  const handleToggleStatus = () => {
    if (chair) {
      setChair(prev => prev ? {
        ...prev,
        status: prev.status === 'ativo' ? 'inativo' : 'ativo'
      } : null);
    }
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta cadeira?')) {
      navigate('/chairs');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando detalhes da cadeira...</p>
        </div>
      </div>
    );
  }

  if (!chair) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Cadeira não encontrada</h1>
          <Button onClick={handleBack} className="mt-4">
            Voltar à lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{chair.name}</h1>
          <p className="text-muted-foreground">
            Detalhes da cadeira
          </p>
        </div>
        <div className="flex gap-2">
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
            className="flex items-center gap-2"
          >
            {chair.status === 'ativo' ? (
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
            variant="outline"
            onClick={handleDelete}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
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
            <CardTitle className="flex items-center gap-2">
              Informações da Cadeira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{chair.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(chair.status)}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Descrição</h4>
              <p className="mt-1">{chair.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Criado em</h4>
                <p className="mt-1">{formatDate(chair.created_at)}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Última atualização</h4>
                <p className="mt-1">{formatDate(chair.updated_at)}</p>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === 'pendente').length}
                </div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {bookings.filter(b => b.status === 'concluido').length}
                </div>
                <div className="text-sm text-muted-foreground">Concluídos</div>
              </div>
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
                      <span>{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.time_slot}</span>
                    </div>
                  </div>
                  
                  <div>
                    {getBookingStatusBadge(booking.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 