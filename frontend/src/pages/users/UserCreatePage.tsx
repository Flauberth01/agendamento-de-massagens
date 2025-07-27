import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { 
  User, 
  ArrowLeft, 
  Save, 
  Loader2,
  Calendar,
  Phone,
  Mail,
  Building,

  Shield
} from 'lucide-react'

import { z } from 'zod'
import { userService } from '../../services/userService'
import { handleApiError } from '../../services/api'
import type { CreateUserRequest } from '../../types/user'

// Schema de validação para criação de usuário
const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(60, 'Nome deve ter no máximo 60 caracteres'),
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999'),
  function: z.string().min(1, 'Função é obrigatória'),
  position: z.string().min(1, 'Cargo é obrigatório'),
  registration: z.string().min(1, 'Matrícula é obrigatória'),
  sector: z.string().min(1, 'Setor é obrigatório'),
  gender: z.enum(['masculino', 'feminino', 'outro']),
  birth_date: z.date(),
  role: z.enum(['usuario', 'atendente', 'admin']),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Senhas não coincidem',
  path: ['confirm_password'],
})

type CreateUserForm = z.infer<typeof createUserSchema>

export const UserCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
    defaultValues: {
      role: 'usuario',
      gender: 'masculino'
    }
  })

  const onSubmit = async (data: CreateUserForm) => {
    setIsLoading(true)
    
    try {
      // Formatar dados para a API
      const userData: CreateUserRequest = {
        name: data.name,
        cpf: data.cpf.replace(/\D/g, ''), // Remover formatação do CPF
        email: data.email,
        phone: data.phone,
        password: data.password,
        requested_role: data.role,
        function: data.function,
        position: data.position,
        registration: data.registration,
        sector: data.sector,
        gender: data.gender,
        birth_date: data.birth_date,
      }

      // Chamar a API
      const createdUser = await userService.createUser(userData)
      
      toast.success('Usuário criado com sucesso!', {
        description: `${createdUser.name} foi adicionado ao sistema.`
      })
      
      // Redirecionar para a lista de usuários
      navigate('/users')
    } catch (error) {
      const apiError = handleApiError(error)
      toast.error('Erro ao criar usuário', {
        description: apiError.message
      })
      console.error('Erro ao criar usuário:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/users')
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Novo Usuário</h1>
          <p className="text-muted-foreground">
            Adicione um novo usuário ao sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome completo"
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  placeholder="123.456.789-00"
                  {...register('cpf')}
                  className={errors.cpf ? 'border-red-500' : ''}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-500">{errors.cpf.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@empresa.com"
                    {...register('email')}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    {...register('phone')}
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gênero *</Label>
                <Select onValueChange={(value) => setValue('gender', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="birth_date"
                    type="date"
                    {...register('birth_date', { 
                      setValueAs: (value) => value ? new Date(value) : undefined 
                    })}
                    className={`pl-10 ${errors.birth_date ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.birth_date && (
                  <p className="text-sm text-red-500">{errors.birth_date.message}</p>
                )}
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="function">Função *</Label>
                <Input
                  id="function"
                  placeholder="Ex: Analista, Desenvolvedor, Atendente"
                  {...register('function')}
                  className={errors.function ? 'border-red-500' : ''}
                />
                {errors.function && (
                  <p className="text-sm text-red-500">{errors.function.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Cargo *</Label>
                <Input
                  id="position"
                  placeholder="Ex: Analista de Sistemas"
                  {...register('position')}
                  className={errors.position ? 'border-red-500' : ''}
                />
                {errors.position && (
                  <p className="text-sm text-red-500">{errors.position.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration">Matrícula *</Label>
                <Input
                  id="registration"
                  placeholder="Ex: EMP001"
                  {...register('registration')}
                  className={errors.registration ? 'border-red-500' : ''}
                />
                {errors.registration && (
                  <p className="text-sm text-red-500">{errors.registration.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Setor *</Label>
                <Input
                  id="sector"
                  placeholder="Ex: Tecnologia da Informação"
                  {...register('sector')}
                  className={errors.sector ? 'border-red-500' : ''}
                />
                {errors.sector && (
                  <p className="text-sm text-red-500">{errors.sector.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Função no Sistema *</Label>
                <Select onValueChange={(value) => setValue('role', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuário</SelectItem>
                    <SelectItem value="atendente">Atendente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>



              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmar Senha *</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="Confirme a senha"
                {...register('confirm_password')}
                className={errors.confirm_password ? 'border-red-500' : ''}
              />
              {errors.confirm_password && (
                <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleBack}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!isValid || isLoading} className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Criar Usuário
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 