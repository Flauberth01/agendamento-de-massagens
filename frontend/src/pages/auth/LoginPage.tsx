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
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

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
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    clearError()
    await login(data)
    // O redirecionamento é feito pelo useEffect
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
          <p className="text-gray-600">Acesse sua conta</p>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div className="flex-1">
                <span className="text-sm text-red-700">{error}</span>
                {error.includes('não foi aprovado') && (
                  <div className="mt-2 text-xs text-red-600">
                    <p>• Seu cadastro está sendo analisado</p>
                    <p>• Você receberá uma notificação quando for aprovado</p>
                    <p>• Em caso de dúvidas, entre em contato com o administrador</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                {...register('cpf')}
                className={errors.cpf ? 'border-red-500' : ''}
              />
              {errors.cpf && (
                <p className="text-sm text-red-500 mt-1">{errors.cpf.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" /> Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Credenciais de teste:</strong><br/>
              Admin: 12345678909 / 123456<br/>
              Atendente: 98765432100 / 123456<br/>
              Cliente: 11144477735 / 123456
            </p>
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">Não tem uma conta?</span>{' '}
            <Link to="/register" className="text-blue-600 hover:underline">Cadastre-se</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 