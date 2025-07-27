import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Building,
  UserCheck,
  UserX
} from 'lucide-react'
import { format } from 'date-fns'
import { userService } from '../../services/userService'
import { handleApiError } from '../../services/api'
import type { User as UserType, UpdateUserRequest } from '../../types/user'

export const UserEditPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const userId = parseInt(id || '0')

  // Estados do formulário
  const [formData, setFormData] = useState<UpdateUserRequest>({
    name: '',
    email: '',
    phone: '',
    function: '',
    position: '',
    registration: '',
    sector: '',
    gender: 'masculino',
    birth_date: undefined
  })

  // Buscar dados do usuário
  const { data: user, isLoading: isLoadingUser, error: userError } = useQuery<UserType>({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Mutação para atualizar usuário
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser(userId, data),
    onSuccess: (updatedUser) => {
      toast.success('Usuário atualizado com sucesso!', {
        description: `${updatedUser.name} foi atualizado no sistema.`
      })
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate('/users')
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error('Erro ao atualizar usuário', {
        description: apiError.message
      })
    }
  })

  // Carregar dados do usuário no formulário
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        function: user.function,
        position: user.position,
        registration: user.registration,
        sector: user.sector,
        gender: user.gender,
        birth_date: user.birth_date ? new Date(user.birth_date) : undefined
      })
    }
  }, [user])

  const handleInputChange = (field: keyof UpdateUserRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações básicas
    if (!formData.name?.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    
    if (!formData.email?.trim()) {
      toast.error('Email é obrigatório')
      return
    }

    updateMutation.mutate(formData)
  }

  const handleBack = () => {
    navigate('/users')
  }

  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd')
  }

  if (userError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserX className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar usuário</h3>
          <p className="text-muted-foreground mb-4">
            {handleApiError(userError).message}
          </p>
          <Button onClick={handleBack}>
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados do usuário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Usuário</h1>
            <p className="text-muted-foreground">
              Atualize as informações do usuário {user?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Digite o email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date ? formatDate(formData.birth_date) : ''}
                  onChange={(e) => handleInputChange('birth_date', e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="function">Função</Label>
                <Input
                  id="function"
                  value={formData.function}
                  onChange={(e) => handleInputChange('function', e.target.value)}
                  placeholder="Ex: Analista"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Ex: Analista de Sistemas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration">Matrícula</Label>
                <Input
                  id="registration"
                  value={formData.registration}
                  onChange={(e) => handleInputChange('registration', e.target.value)}
                  placeholder="Ex: EMP001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Setor</Label>
                <Input
                  id="sector"
                  value={formData.sector}
                  onChange={(e) => handleInputChange('sector', e.target.value)}
                  placeholder="Ex: Tecnologia da Informação"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Sistema (Somente Leitura) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input value={user?.cpf} disabled />
              </div>
              <div className="space-y-2">
                <Label>Função no Sistema</Label>
                <Input value={user?.role} disabled />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Input value={user?.status} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={handleBack}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  )
} 