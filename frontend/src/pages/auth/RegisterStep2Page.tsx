import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { registerStep2Schema, type RegisterStep2Form } from '../../utils/validation'
import { useAuth } from '../../stores/authStore'
import { Loader2, ArrowLeft, AlertCircle, CheckCircle, Phone, Calendar, Shield, Lock, Eye, EyeOff } from 'lucide-react'
import { formatPhone } from '../../utils/formatters'

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
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterStep2Form>({
    resolver: zodResolver(registerStep2Schema),
    mode: 'onChange',
  })

  // Observar mudanças no telefone para aplicar formatação
  const phoneValue = watch('phone');
  
  useEffect(() => {
    if (phoneValue && phoneValue.length > 0) {
      const formatted = formatPhone(phoneValue);
      if (formatted !== phoneValue) {
        setValue('phone', formatted);
      }
    }
  }, [phoneValue, setValue]);

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
      // Converter a data para o formato esperado pelo backend
      birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Carregando dados...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
          <p className="text-gray-600">Etapa 2 de 2 - Dados Complementares</p>
        </div>

        {/* Card de Registro */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Navegação */}
            <div className="flex items-center justify-between mb-6">
              <Link 
                to="/register" 
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
              
              {/* Progress bar */}
              <div className="flex-1 mx-8">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-full transition-all duration-300"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Etapa 1</span>
                  <span className="font-medium text-blue-600">Etapa 2</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-sm text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Telefone *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="text"
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      className={`pl-10 h-12 text-base ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      {...register('phone')}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Gênero */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                    Gênero *
                  </Label>
                  <Select onValueChange={(value) => handleSelectChange('gender', value)}>
                    <SelectTrigger className={`h-12 text-base ${errors.gender ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}>
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                {/* Data de Nascimento */}
                <div className="space-y-2">
                  <Label htmlFor="birth_date" className="text-sm font-medium text-gray-700">
                    Data de Nascimento *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="birth_date"
                      type="date"
                      className={`pl-10 h-12 text-base ${errors.birth_date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      {...register('birth_date')}
                    />
                  </div>
                  {errors.birth_date && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.birth_date.message}
                    </p>
                  )}
                </div>

                {/* Tipo de Conta */}
                <div className="space-y-2">
                  <Label htmlFor="requested_role" className="text-sm font-medium text-gray-700">
                    Tipo de Conta *
                  </Label>
                  <Select onValueChange={(value) => handleSelectChange('requested_role', value)}>
                    <SelectTrigger className={`h-12 text-base ${errors.requested_role ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}>
                      <SelectValue placeholder="Selecione o tipo de conta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usuario">Usuário</SelectItem>
                      <SelectItem value="atendente">Atendente</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.requested_role && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.requested_role.message}
                    </p>
                  )}
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Senha *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      className={`pl-10 pr-12 h-12 text-base ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      {...register('password')}
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

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">
                    Confirmar Senha *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua senha"
                      className={`pl-10 pr-12 h-12 text-base ${errors.confirm_password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      {...register('confirm_password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.confirm_password.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Informações Importantes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-3">Informações Importantes</h4>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Contas de usuário são aprovadas automaticamente</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Contas de atendente precisam de aprovação de um administrador</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Contas de administrador precisam de aprovação especial</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Você receberá um email quando sua conta for aprovada</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-between items-center pt-6">
                <Link 
                  to="/register" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Voltar à Etapa 1
                </Link>
                
                <Button 
                  type="submit" 
                  disabled={!isValid || isLoading}
                  className="h-12 px-8 text-base font-medium bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
    </div>
  )
} 