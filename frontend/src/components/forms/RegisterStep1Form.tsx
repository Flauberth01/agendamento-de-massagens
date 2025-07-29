import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, User, Building } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useEffect, useState } from 'react';
import { formatCPF } from '@/utils/formatters';
import { useAuth } from '@/stores/authStore';
import { registerStep1Schema, type RegisterStep1Form } from '@/utils/validation';
import { userService } from '@/services/userService';

type RegisterStep1Data = RegisterStep1Form;

interface RegisterStep1FormProps {
  onSubmit: (data: RegisterStep1Data) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export function RegisterStep1Form({ 
  onSubmit, 
  isLoading = false, 
  error, 
  className 
}: RegisterStep1FormProps) {
  const { clearErrorOnInput } = useAuth();
  const [cpfError, setCpfError] = useState<string>('');
  const [isCheckingCpf, setIsCheckingCpf] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1Schema),
  });

  // Observar mudanças no CPF para aplicar formatação e validação
  const cpfValue = watch('cpf');
  
  useEffect(() => {
    if (cpfValue && cpfValue.length > 0) {
      const formatted = formatCPF(cpfValue);
      if (formatted !== cpfValue) {
        setValue('cpf', formatted);
      }
      // Limpar erro quando usuário digita
      clearErrorOnInput();
      setCpfError('');
      
      // Validar CPF único quando o CPF estiver completo
      if (formatted.length === 14) {
        validateCPFUnique(formatted);
      }
    }
  }, [cpfValue, setValue, clearErrorOnInput]);

  const validateCPFUnique = async (cpf: string) => {
    setIsCheckingCpf(true);
    setCpfError('');
    
    try {
      const { exists } = await userService.checkCPFExists(cpf);
      if (exists) {
        setCpfError('CPF já está cadastrado no sistema');
        setError('cpf', { message: 'CPF já está cadastrado no sistema' });
      } else {
        clearErrors('cpf');
      }
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      // Em caso de erro, permitir que o backend valide
    } finally {
      setIsCheckingCpf(false);
    }
  };

  const handleFormSubmit = async (data: RegisterStep1Data) => {
    // Verificar CPF novamente antes de submeter
    if (data.cpf) {
      try {
        const { exists } = await userService.checkCPFExists(data.cpf);
        if (exists) {
          setCpfError('CPF já está cadastrado no sistema');
          setError('cpf', { message: 'CPF já está cadastrado no sistema' });
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar CPF:', error);
      }
    }
    
    try {
      await onSubmit(data);
    } catch (err) {
      // Erro já tratado pelo componente pai
    }
  };

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <User className="h-6 w-6" />
          Cadastro - Etapa 1
        </CardTitle>
        <CardDescription className="text-center">
          Dados pessoais e profissionais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite seu nome completo"
              {...register('name', {
                onChange: () => clearErrorOnInput()
              })}
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
            <div className="relative">
              <Input
                id="cpf"
                type="text"
                placeholder="123.456.789-09"
                maxLength={14}
                {...register('cpf', {
                  onChange: () => clearErrorOnInput()
                })}
                className={errors.cpf ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {isCheckingCpf && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                </div>
              )}
            </div>
            {errors.cpf && (
              <p className="text-sm text-red-500">{errors.cpf.message}</p>
            )}
            {cpfError && (
              <p className="text-sm text-red-500">{cpfError}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@empresa.com"
              {...register('email', {
                onChange: () => clearErrorOnInput()
              })}
              className={errors.email ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Função */}
          <div className="space-y-2">
            <Label htmlFor="function">Função</Label>
            <Input
              id="function"
              type="text"
              placeholder="Ex: Analista"
              {...register('function', {
                onChange: () => clearErrorOnInput()
              })}
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
              {...register('position', {
                onChange: () => clearErrorOnInput()
              })}
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
              placeholder="Digite sua matrícula"
              {...register('registration', {
                onChange: () => clearErrorOnInput()
              })}
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
              {...register('sector', {
                onChange: () => clearErrorOnInput()
              })}
              className={errors.sector ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.sector && (
              <p className="text-sm text-red-500">{errors.sector.message}</p>
            )}
          </div>

          {/* Erro geral */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botão de submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isCheckingCpf}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Building className="mr-2 h-4 w-4" />
                Continuar para Etapa 2
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 