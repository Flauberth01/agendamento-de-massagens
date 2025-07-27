import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, MoreHorizontal, MapPin, Edit, Trash2, Eye, Plus } from 'lucide-react';
import type { Chair } from '../../types/chair';

interface ChairListProps {
  chairs: Chair[];
  onEdit?: (chair: Chair) => void;
  onDelete?: (chairId: number) => void;
  onView?: (chair: Chair) => void;
  onAdd?: () => void;
  isLoading?: boolean;
  error?: string;
  userRole?: 'usuario' | 'atendente' | 'admin';
}

export function ChairList({
  chairs,
  onEdit,
  onDelete,
  onView,
  onAdd,
  isLoading = false,
  error,
  userRole = 'usuario'
}: ChairListProps) {
  const [filteredChairs, setFilteredChairs] = useState<Chair[]>(chairs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    let filtered = [...chairs];

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(chair =>
        chair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chair.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chair.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(chair => chair.status === statusFilter);
    }

    // Aplicar filtro de localização
    if (locationFilter !== 'all') {
      filtered = filtered.filter(chair => chair.location === locationFilter);
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'location':
          return a.location.localeCompare(b.location);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'created':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredChairs(filtered);
  }, [chairs, searchTerm, statusFilter, locationFilter, sortBy]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativa: { variant: 'default' as const, label: 'Ativa' },
      inativa: { variant: 'secondary' as const, label: 'Inativa' },
      manutencao: { variant: 'destructive' as const, label: 'Manutenção' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativa;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canEdit = () => {
    return userRole === 'admin' || userRole === 'atendente';
  };

  const canDelete = () => {
    return userRole === 'admin';
  };

  const canAdd = () => {
    return userRole === 'admin' || userRole === 'atendente';
  };

  // Obter localizações únicas para o filtro
  const uniqueLocations = Array.from(new Set(chairs.map(chair => chair.location)));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando cadeiras...</div>
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Lista de Cadeiras
          </CardTitle>
          {onAdd && canAdd() && (
            <Button onClick={onAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Cadeira
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, localização ou descrição..."
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
              <SelectItem value="ativa">Ativa</SelectItem>
              <SelectItem value="inativa">Inativa</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Localização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as localizações</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
              <SelectItem value="location">Localização</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="created">Data de criação (mais antiga)</SelectItem>
              <SelectItem value="created-desc">Data de criação (mais recente)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de cadeiras */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredChairs.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Nenhuma cadeira encontrada
            </div>
          ) : (
            filteredChairs.map((chair) => (
              <Card key={chair.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{chair.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{chair.location}</span>
                      </div>
                      {getStatusBadge(chair.status)}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(chair)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                        )}
                        {onEdit && canEdit() && (
                          <DropdownMenuItem onClick={() => onEdit(chair)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {onDelete && canDelete() && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(chair.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {chair.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {chair.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>ID: {chair.id}</span>
                    <span>
                      Criada em {new Date(chair.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {chair.updated_at && chair.updated_at !== chair.created_at && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Atualizada em {new Date(chair.updated_at).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Estatísticas */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">{filteredChairs.length}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {filteredChairs.filter(c => c.status === 'ativa').length}
              </div>
              <div className="text-muted-foreground">Ativas</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {filteredChairs.filter(c => c.status === 'inativa').length}
              </div>
              <div className="text-muted-foreground">Inativas</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {filteredChairs.filter(c => c.status === 'inativa').length}
              </div>
              <div className="text-muted-foreground">Inativas</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 