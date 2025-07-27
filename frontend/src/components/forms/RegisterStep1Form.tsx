import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, User, Building } from 'lucide-react';
import { cn } from '@/utils/cn';

// Schema de validação para Etapa 1
const registerStep1Schema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos numéricos'),
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
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido'),
});

type RegisterStep1Data = z.infer<typeof registerStep1Schema>;

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1Schema),
  });

  const handleFormSubmit = async (data: RegisterStep1Data) => {
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
              placeholder="seu.email@empresa.com"
              {...register('email')}
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
              placeholder="Digite sua matrícula"
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
            disabled={isLoading}
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