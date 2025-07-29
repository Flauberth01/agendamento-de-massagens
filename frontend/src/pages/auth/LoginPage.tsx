import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { loginSchema, type LoginForm } from '../../utils/validation'
import { useAuth } from '../../stores/authStore'
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Lock, User } from 'lucide-react'
import { formatCPF } from '../../utils/formatters'

export const LoginPage: React.FC = () => {

  const location = useLocation()
  const navigate = useNavigate()
  const { login, isLoading, error, clearError, user, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  // Verificar se há mensagem de sucesso do registro
  const successMessage = location.state?.message

  // Effect para redirecionar quando o usuário for autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          navigate('/dashboard/admin', { replace: true })
          break
        case 'atendente':
          navigate('/dashboard/attendant', { replace: true })
          break
        case 'usuario':
        default:
          navigate('/dashboard', { replace: true })
          break
      }
    }
  }, [isAuthenticated, user, navigate])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  // Observar mudanças no CPF para aplicar formatação
  const cpfValue = watch('cpf');
  
  useEffect(() => {
    if (cpfValue && cpfValue.length > 0) {
      const formatted = formatCPF(cpfValue);
      if (formatted !== cpfValue) {
        setValue('cpf', formatted);
      }
      // Limpar erro quando usuário digita
      clearError();
    }
  }, [cpfValue, setValue, clearError]);

  const onSubmit = async (data: LoginForm) => {
    clearError()
    await login(data)
    // O redirecionamento é feito pelo useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Agendamento</h1>
          <p className="text-gray-600">Acesse sua conta</p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-green-700">{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-sm text-red-700 font-medium">{error}</span>
                  {error.includes('não foi aprovado') && (
                    <div className="mt-3 text-xs text-red-600 space-y-1">
                      <p>• Seu cadastro está sendo analisado</p>
                      <p>• Você receberá uma notificação quando for aprovado</p>
                      <p>• Em caso de dúvidas, entre em contato com o administrador</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* CPF */}
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                  CPF
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="123.456.789-09"
                    maxLength={14}
                    className={`pl-10 h-12 text-base ${errors.cpf ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    {...register('cpf', {
                      onChange: () => clearError()
                    })}
                  />
                </div>
                {errors.cpf && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.cpf.message}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    className={`pl-10 pr-12 h-12 text-base ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    {...register('password', {
                      onChange: () => clearError()
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Botão de Login */}
              <Button 
                type="submit"
                className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Credenciais de Teste */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-medium mb-2">Credenciais de teste:</p>
              <div className="space-y-1 text-xs text-blue-600">
                <p><span className="font-medium">Admin:</span> 12345678909 / 123456</p>
                <p><span className="font-medium">Atendente:</span> 98765432100 / 123456</p>
                <p><span className="font-medium">Cliente:</span> 11144477735 / 123456</p>
              </div>
            </div>

            {/* Link para Registro */}
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">Não tem uma conta? </span>
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Cadastre-se
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 