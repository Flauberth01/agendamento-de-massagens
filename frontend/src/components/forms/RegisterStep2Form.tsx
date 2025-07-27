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

// Schema de validação para Etapa 2
const registerStep2Schema = z.object({
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone deve estar no formato (11) 99999-9999'),
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
  requested_role: z.enum(['usuario', 'atendente', 'admin']),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres'),
  confirm_password: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Senhas não coincidem',
  path: ['confirm_password'],
});

type RegisterStep2Data = z.infer<typeof registerStep2Schema>;

interface RegisterStep2FormProps {
  onSubmit: (data: RegisterStep2Data) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export function RegisterStep2Form({ 
  onSubmit, 
  onBack,
  isLoading = false, 
  error, 
  className 
}: RegisterStep2FormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterStep2Data>({
    resolver: zodResolver(registerStep2Schema),
  });

  const handleFormSubmit = async (data: RegisterStep2Data) => {
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
    setValue('requested_role', value as 'usuario' | 'atendente' | 'admin');
  };

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <User className="h-6 w-6" />
          Cadastro - Etapa 2
        </CardTitle>
        <CardDescription className="text-center">
          Dados complementares e senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
            <Label htmlFor="requested_role">Tipo de Usuário</Label>
            <Select onValueChange={handleRoleChange} disabled={isLoading}>
              <SelectTrigger className={errors.requested_role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tipo de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usuario">Usuário</SelectItem>
                <SelectItem value="atendente">Atendente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            {errors.requested_role && (
              <p className="text-sm text-red-500">{errors.requested_role.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmação de Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmar Senha</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Confirme sua senha"
              {...register('confirm_password')}
              className={errors.confirm_password ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.confirm_password && (
              <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
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
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Criar Conta
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 