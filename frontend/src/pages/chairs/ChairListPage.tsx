import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Power, PowerOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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

export default function ChairListPage() {
  const navigate = useNavigate();
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [filteredChairs, setFilteredChairs] = useState<Chair[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const mockChairs: Chair[] = [
      {
        id: '1',
        name: 'Cadeira 1',
        description: 'Cadeira principal do consultório',
        status: 'ativo',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Cadeira 2',
        description: 'Cadeira secundária',
        status: 'ativo',
        created_at: '2024-01-16T14:30:00Z',
        updated_at: '2024-01-16T14:30:00Z'
      },
      {
        id: '3',
        name: 'Cadeira 3',
        description: 'Cadeira de emergência',
        status: 'inativo',
        created_at: '2024-01-17T09:15:00Z',
        updated_at: '2024-01-17T09:15:00Z'
      }
    ];

    setTimeout(() => {
      setChairs(mockChairs);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = chairs;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(chair =>
        chair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chair.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(chair => chair.status === statusFilter);
    }

    setFilteredChairs(filtered);
  }, [chairs, searchTerm, statusFilter]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleCreateChair = () => {
    navigate('/chairs/create');
  };

  const handleEditChair = (id: string) => {
    navigate(`/chairs/${id}/edit`);
  };

  const handleViewChair = (id: string) => {
    navigate(`/chairs/${id}`);
  };

  const handleToggleStatus = (id: string) => {
    setChairs(prev => prev.map(chair => 
      chair.id === id 
        ? { ...chair, status: chair.status === 'ativo' ? 'inativo' : 'ativo' }
        : chair
    ));
  };

  const handleDeleteChair = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta cadeira?')) {
      setChairs(prev => prev.filter(chair => chair.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando cadeiras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Cadeiras</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as cadeiras do sistema
          </p>
        </div>
        <Button onClick={handleCreateChair} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Cadeira
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Cadeiras ({filteredChairs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredChairs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma cadeira encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredChairs.map((chair) => (
                <div
                  key={chair.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{chair.name}</h3>
                      {getStatusBadge(chair.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {chair.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Criado em: {formatDate(chair.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewChair(chair.id)}
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditChair(chair.id)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(chair.id)}
                      title={chair.status === 'ativo' ? 'Desativar' : 'Ativar'}
                    >
                      {chair.status === 'ativo' ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChair(chair.id)}
                      title="Excluir"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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