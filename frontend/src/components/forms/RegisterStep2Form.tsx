import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, User, Shield } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useEffect } from 'react';
import { formatPhone } from '@/utils/formatters';
import { useAuth } from '@/stores/authStore';
import { registerStep2Schema, type RegisterStep2Form } from '@/utils/validation';

type RegisterStep2Data = RegisterStep2Form;

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
  const { clearErrorOnInput } = useAuth();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterStep2Data>({
    resolver: zodResolver(registerStep2Schema),
  });

  // Observar mudanças no telefone para aplicar formatação
  const phoneValue = watch('phone');
  
  useEffect(() => {
    if (phoneValue && phoneValue.length > 0) {
      const formatted = formatPhone(phoneValue);
      if (formatted !== phoneValue) {
        setValue('phone', formatted);
      }
      // Limpar erro quando usuário digita
      clearErrorOnInput();
    }
  }, [phoneValue, setValue, clearErrorOnInput]);

  const handleFormSubmit = async (data: RegisterStep2Data) => {
    try {
      await onSubmit(data);
    } catch (err) {
      // Erro já tratado pelo componente pai
    }
  };

  const handleGenderChange = (value: string) => {
    setValue('gender', value as 'masculino' | 'feminino' | 'outro');
    clearErrorOnInput();
  };

  const handleRoleChange = (value: string) => {
    setValue('requested_role', value as 'usuario' | 'atendente' | 'admin');
    clearErrorOnInput();
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
              maxLength={15}
              {...register('phone', {
                onChange: () => clearErrorOnInput()
              })}
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
              {...register('birth_date', {
                onChange: () => clearErrorOnInput()
              })}
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
              {...register('password', {
                onChange: () => clearErrorOnInput()
              })}
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
              {...register('confirm_password', {
                onChange: () => clearErrorOnInput()
              })}
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