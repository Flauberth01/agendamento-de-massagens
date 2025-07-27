import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MoreHorizontal, User, Mail, Phone, Building, Edit, Trash2, Eye, Plus, Shield } from 'lucide-react';
import type { User as UserType } from '@/types/user';

interface UserListProps {
  users: UserType[];
  onEdit?: (user: UserType) => void;
  onDelete?: (userId: number) => void;
  onView?: (user: UserType) => void;
  onAdd?: () => void;
  isLoading?: boolean;
  error?: string;
  userRole?: 'usuario' | 'atendente' | 'admin';
}

export function UserList({
  users,
  onEdit,
  onDelete,
  onView,
  onAdd,
  isLoading = false,
  error,
  userRole = 'usuario'
}: UserListProps) {
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>(users);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    let filtered = [...users];

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cpf.includes(searchTerm) ||
        user.function.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.sector.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Aplicar filtro de setor
    if (sectorFilter !== 'all') {
      filtered = filtered.filter(user => user.sector === sectorFilter);
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'sector':
          return a.sector.localeCompare(b.sector);
        case 'created':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter, sectorFilter, sortBy]);

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { variant: 'destructive' as const, label: 'Administrador', icon: Shield },
      atendente: { variant: 'default' as const, label: 'Atendente', icon: User },
      usuario: { variant: 'secondary' as const, label: 'Usuário', icon: User }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.usuario;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aprovado: { variant: 'default' as const, label: 'Aprovado' },
      pendente: { variant: 'secondary' as const, label: 'Pendente' },
      reprovado: { variant: 'destructive' as const, label: 'Reprovado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canEdit = (user: UserType) => {
    if (userRole === 'admin') return true;
    if (userRole === 'atendente') return user.role !== 'admin';
    return false;
  };

  const canDelete = (user: UserType) => {
    if (userRole === 'admin') return user.role !== 'admin'; // Admin não pode deletar outro admin
    return false;
  };

  const canAdd = () => {
    return userRole === 'admin' || userRole === 'atendente';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Obter setores únicos para o filtro
  const uniqueSectors = Array.from(new Set(users.map(user => user.sector)));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando usuários...</div>
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
            <User className="h-5 w-5" />
            Lista de Usuários
          </CardTitle>
          {onAdd && canAdd() && (
            <Button onClick={onAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
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
                placeholder="Buscar por nome, email, CPF, função ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as funções</SelectItem>
              <SelectItem value="usuario">Usuário</SelectItem>
              <SelectItem value="atendente">Atendente</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="reprovado">Reprovado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os setores</SelectItem>
              {uniqueSectors.map(sector => (
                <SelectItem key={sector} value={sector}>
                  {sector}
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
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="role">Função</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="sector">Setor</SelectItem>
              <SelectItem value="created">Data de criação (mais antiga)</SelectItem>
              <SelectItem value="created-desc">Data de criação (mais recente)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de usuários */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{user.name}</h3>
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{user.sector}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>CPF: {user.cpf}</span>
                      <span>Matrícula: {user.registration}</span>
                      <span>Cargo: {user.position}</span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(user)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                    )}
                    {onEdit && canEdit(user) && (
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onDelete && canDelete(user) && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(user.id)}
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
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">{filteredUsers.length}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {filteredUsers.filter(u => u.role === 'usuario').length}
              </div>
              <div className="text-muted-foreground">Usuários</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {filteredUsers.filter(u => u.role === 'atendente').length}
              </div>
              <div className="text-muted-foreground">Atendentes</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {filteredUsers.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-muted-foreground">Admins</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {filteredUsers.filter(u => u.status === 'aprovado').length}
              </div>
              <div className="text-muted-foreground">Aprovados</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {filteredUsers.filter(u => u.status === 'pendente').length}
              </div>
              <div className="text-muted-foreground">Pendentes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 