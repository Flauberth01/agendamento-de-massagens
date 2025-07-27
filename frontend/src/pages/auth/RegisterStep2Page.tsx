import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { registerStep2Schema, type RegisterStep2Form } from '../../utils/validation'
import { useAuth } from '../../stores/authStore'
import { Loader2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'

export const RegisterStep2Page: React.FC = () => {
  const navigate = useNavigate()
  const { register: registerUser, isLoading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step1Data, setStep1Data] = useState<any>(null)

  const {
    register,
    handleSubmit,
    setValue,

    formState: { errors, isValid },
  } = useForm<RegisterStep2Form>({
    resolver: zodResolver(registerStep2Schema),
    mode: 'onChange',
  })

  // Carregar dados da etapa 1
  useEffect(() => {
    const step1 = localStorage.getItem('register_step1')
    if (!step1) {
      navigate('/register')
      return
    }
    setStep1Data(JSON.parse(step1))
  }, [navigate])

  const onSubmit = async (data: RegisterStep2Form) => {
    clearError()
    
    // Combinar dados das duas etapas
    const userData = {
      ...step1Data,
      ...data,
    }

    const success = await registerUser(userData)
    
    if (success) {
      // Limpar dados temporários
      localStorage.removeItem('register_step1')
      // Redirecionar para login com mensagem de sucesso
      navigate('/login', { 
        state: { 
          message: 'Conta criada com sucesso! Aguarde a aprovação de um administrador.' 
        } 
      })
    }
  }

  const handleSelectChange = (field: keyof RegisterStep2Form, value: string) => {
    setValue(field, value as any)
  }

  if (!step1Data) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando dados...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/register" 
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Link>
            <div className="flex-1"></div>
          </div>
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <p className="text-gray-600">Etapa 2 de 2 - Dados Complementares</p>
          
          {/* Progress bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-full"></div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="(11) 99999-9999"
                  {...register('phone')}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">Gênero *</Label>
                <Select onValueChange={(value) => handleSelectChange('gender', value)}>
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
                  <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="birth_date">Data de Nascimento *</Label>
                <Input
                  id="birth_date"
                  type="date"
                  {...register('birth_date', {
                    setValueAs: (value) => value ? new Date(value) : undefined,
                  })}
                  className={errors.birth_date ? 'border-red-500' : ''}
                />
                {errors.birth_date && (
                  <p className="text-sm text-red-500 mt-1">{errors.birth_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="requested_role">Tipo de Conta *</Label>
                <Select onValueChange={(value) => handleSelectChange('requested_role', value)}>
                  <SelectTrigger className={errors.requested_role ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o tipo de conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuário</SelectItem>
                    <SelectItem value="atendente">Atendente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {errors.requested_role && (
                  <p className="text-sm text-red-500 mt-1">{errors.requested_role.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
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

              <div>
                <Label htmlFor="confirm_password">Confirmar Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    {...register('confirm_password')}
                    className={errors.confirm_password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirm_password.message}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Informações Importantes</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Contas de usuário são aprovadas automaticamente</li>
                    <li>• Contas de atendente precisam de aprovação de um administrador</li>
                    <li>• Contas de administrador precisam de aprovação especial</li>
                    <li>• Você receberá um email quando sua conta for aprovada</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-800"
              >
                Voltar à Etapa 1
              </Link>
              
              <Button 
                type="submit" 
                disabled={!isValid || isLoading}
                className="px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando Conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 