import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Power, PowerOff, Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useChairs } from '../../hooks/useChairs';
import type { Chair } from '../../types/chair';

export default function ChairListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativa' | 'inativa'>('todos');
  const [filteredChairs, setFilteredChairs] = useState<Chair[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; chair: Chair | null }>({
    isOpen: false,
    chair: null
  });

  // Hooks para gerenciar cadeiras
  const { useAllChairs, useToggleChairStatus, useDeleteChair } = useChairs();
  const { data: chairsResponse, isLoading, error } = useAllChairs();
  const toggleStatusMutation = useToggleChairStatus();
  const deleteMutation = useDeleteChair();

  // Ensure chairs is always an array
  const chairs = Array.isArray(chairsResponse?.chairs) ? chairsResponse.chairs : [];

  // Debug: Log the response structure
  console.log('chairsResponse:', chairsResponse);
  console.log('chairs:', chairs);
  console.log('chairsResponse type:', typeof chairsResponse);
  console.log('chairsResponse.chairs type:', typeof chairsResponse?.chairs);

  // Filtrar cadeiras baseado nos filtros
  useEffect(() => {
    console.log('useEffect triggered with chairs:', chairs);
    let filtered = chairs;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(chair =>
        chair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chair.description && chair.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        chair.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(chair => chair.status === statusFilter);
    }

    // Ensure filtered is always an array
    if (!Array.isArray(filtered)) {
      console.error('filtered is not an array:', filtered);
      filtered = [];
    }

    console.log('filtered:', filtered);
    setFilteredChairs(filtered);
  }, [chairs, searchTerm, statusFilter]);

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

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('pt-BR');
  };

  const handleCreateChair = () => {
    navigate('/chairs/create');
  };

  const handleEditChair = (id: number) => {
    navigate(`/chairs/${id}/edit`);
  };

  const handleViewChair = (id: number) => {
    navigate(`/chairs/${id}`);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatusMutation.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao alternar status:', error);
    }
  };

  const handleDeleteChair = (chair: Chair) => {
    setDeleteDialog({ isOpen: true, chair });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.chair) return;
    
    try {
      await deleteMutation.mutateAsync(deleteDialog.chair.id);
      setDeleteDialog({ isOpen: false, chair: null });
    } catch (error) {
      console.error('Erro ao excluir cadeira:', error);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-500">Erro ao carregar cadeiras. Tente novamente.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Recarregar
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
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, descrição ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="todos">Todos os status</option>
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
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
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'todos' 
                  ? 'Nenhuma cadeira encontrada com os filtros aplicados' 
                  : 'Nenhuma cadeira cadastrada no sistema'
                }
              </p>
              {searchTerm || statusFilter !== 'todos' ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('todos');
                  }}
                  className="mt-2"
                >
                  Limpar Filtros
                </Button>
              ) : (
                <Button 
                  onClick={handleCreateChair}
                  className="mt-2"
                >
                  Criar Primeira Cadeira
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(filteredChairs) ? filteredChairs.map((chair) => (
                <div
                  key={chair.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{chair.name}</h3>
                      {getStatusBadge(chair.status)}
                    </div>
                    {chair.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {chair.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Localização:</strong> {chair.location}
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
                      title={chair.status === 'ativa' ? 'Desativar' : 'Ativar'}
                      disabled={toggleStatusMutation.isPending}
                    >
                      {chair.status === 'ativa' ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChair(chair)}
                      title="Excluir"
                      className="text-destructive hover:text-destructive"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Erro: dados de cadeiras inválidos</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, chair: null })}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a cadeira "${deleteDialog.chair?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
} 