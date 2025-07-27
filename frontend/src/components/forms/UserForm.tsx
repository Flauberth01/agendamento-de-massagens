import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, User, Shield } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { User as UserType } from '@/types';

// Schema de validação
const userSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos numéricos'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone deve estar no formato (11) 99999-9999'),
  function: z
    .string()
    .min(1, 'Função é obrigatória')
    .max(50, 'Função deve ter no máximo 50 caracteres'),
  position: z
    .string()
    .min(1, 'Cargo é obrigatório')
    .max(100, 'Cargo deve ter no máximo 100 caracteres'),
  registration: z
    .string()
    .min(1, 'Matrícula é obrigatória')
    .max(20, 'Matrícula deve ter no máximo 20 caracteres'),
  sector: z
    .string()
    .min(1, 'Setor é obrigatório')
    .max(100, 'Setor deve ter no máximo 100 caracteres'),
  gender: z.enum(['masculino', 'feminino', 'outro']),
  birth_date: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 100;
    }, 'Data de nascimento deve ser válida (idade entre 18 e 100 anos)'),
  role: z.enum(['usuario', 'atendente', 'admin']),
  status: z.enum(['pendente', 'aprovado', 'reprovado']),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres')
    .optional(),
  confirm_password: z
    .string()
    .optional(),
}).refine((data) => {
  // Se password está presente, confirm_password deve ser igual
  if (data.password && data.password.length > 0) {
    return data.password === data.confirm_password;
  }
  return true;
}, {
  message: 'Senhas não coincidem',
  path: ['confirm_password'],
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: UserType; // Para edição
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
  isEdit?: boolean;
}

export function UserForm({ 
  user, 
  onSubmit, 
  onCancel,
  isLoading = false, 
  error, 
  className,
  isEdit = false
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user ? {
      name: user.name,
      cpf: user.cpf,
      email: user.email,
      phone: user.phone,
      function: user.function,
      position: user.position,
      registration: user.registration,
      sector: user.sector,
      gender: user.gender,
      birth_date: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
      role: user.role,
      status: user.status,
    } : undefined,
  });

  const watchedPassword = watch('password');

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
    } catch (err) {
      // Erro já tratado pelo componente pai
    }
  };

  const handleGenderChange = (value: string) => {
    setValue('gender', value as 'masculino' | 'feminino' | 'outro');
  };

  const handleRoleChange = (value: string) => {
    setValue('role', value as 'usuario' | 'atendente' | 'admin');
  };

  const handleStatusChange = (value: string) => {
    setValue('status', value as 'pendente' | 'aprovado' | 'reprovado');
  };

  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <User className="h-6 w-6" />
          {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
        </CardTitle>
        <CardDescription className="text-center">
          {isEdit ? 'Edite as informações do usuário' : 'Preencha as informações do novo usuário'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite o nome completo"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="12345678909"
                {...register('cpf')}
                className={errors.cpf ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.cpf && (
                <p className="text-sm text-red-500">{errors.cpf.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Função */}
            <div className="space-y-2">
              <Label htmlFor="function">Função</Label>
              <Input
                id="function"
                type="text"
                placeholder="Ex: Analista"
                {...register('function')}
                className={errors.function ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.function && (
                <p className="text-sm text-red-500">{errors.function.message}</p>
              )}
            </div>

            {/* Cargo */}
            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                type="text"
                placeholder="Ex: Analista de Sistemas"
                {...register('position')}
                className={errors.position ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.position && (
                <p className="text-sm text-red-500">{errors.position.message}</p>
              )}
            </div>

            {/* Matrícula */}
            <div className="space-y-2">
              <Label htmlFor="registration">Matrícula</Label>
              <Input
                id="registration"
                type="text"
                placeholder="Digite a matrícula"
                {...register('registration')}
                className={errors.registration ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.registration && (
                <p className="text-sm text-red-500">{errors.registration.message}</p>
              )}
            </div>

            {/* Setor */}
            <div className="space-y-2">
              <Label htmlFor="sector">Setor</Label>
              <Input
                id="sector"
                type="text"
                placeholder="Ex: Tecnologia da Informação"
                {...register('sector')}
                className={errors.sector ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.sector && (
                <p className="text-sm text-red-500">{errors.sector.message}</p>
              )}
            </div>

            {/* Gênero */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gênero</Label>
              <Select onValueChange={handleGenderChange} disabled={isLoading}>
                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
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

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                {...register('birth_date')}
                className={errors.birth_date ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.birth_date && (
                <p className="text-sm text-red-500">{errors.birth_date.message}</p>
              )}
            </div>

            {/* Tipo de Usuário */}
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Usuário</Label>
              <Select onValueChange={handleRoleChange} disabled={isLoading}>
                <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o tipo de usuário" />
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

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={handleStatusChange} disabled={isLoading}>
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="reprovado">Reprovado</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            {/* Senha (apenas para criação ou se fornecida) */}
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite a senha"
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* Confirmação de Senha */}
            {(!isEdit || watchedPassword) && (
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar Senha</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Confirme a senha"
                  {...register('confirm_password')}
                  className={errors.confirm_password ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.confirm_password && (
                  <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Erro geral */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  {isEdit ? 'Atualizar Usuário' : 'Criar Usuário'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 