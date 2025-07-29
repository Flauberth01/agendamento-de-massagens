import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { registerStep1Schema, type RegisterStep1Form } from '../../utils/validation'
import { ArrowLeft, User, Mail, Building, IdCard, Users, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { formatCPF } from '../../utils/formatters'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterStep1Form>({
    resolver: zodResolver(registerStep1Schema),
    mode: 'onChange',
  })

  // Observar mudanças no CPF para aplicar formatação
  const cpfValue = watch('cpf');
  
  useEffect(() => {
    if (cpfValue && cpfValue.length > 0) {
      const formatted = formatCPF(cpfValue);
      if (formatted !== cpfValue) {
        setValue('cpf', formatted);
      }
    }
  }, [cpfValue, setValue]);

  const onSubmit = (data: RegisterStep1Form) => {
    // Salvar dados da etapa 1 no localStorage
    localStorage.setItem('register_step1', JSON.stringify(data))
    // Navegar para etapa 2
    navigate('/register/step2')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
          <p className="text-gray-600">Etapa 1 de 2 - Dados Pessoais e Profissionais</p>
        </div>

        {/* Card de Registro */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Navegação */}
            <div className="flex items-center justify-between mb-6">
              <Link 
                to="/login" 
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Login
              </Link>
              
              {/* Progress bar */}
              <div className="flex-1 mx-8">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-1/2 transition-all duration-300"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span className="font-medium text-blue-600">Etapa 1</span>
                  <span>Etapa 2</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                {/* Nome Completo */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nome Completo *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      className={`pl-10 h-12 text-base ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                    CPF *
                  </Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="123.456.789-09"
                      maxLength={14}
                      className={`pl-10 h-12 text-base ${errors.cpf ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      {...register('cpf')}
                    />
                  </div>
                  {errors.cpf && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.cpf.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@empresa.com"
                      className={`pl-10 h-12 text-base ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Função */}
                <div className="space-y-2">
                  <Label htmlFor="function" className="text-sm font-medium text-gray-700">
                    Função *
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="function"
                      type="text"
                      placeholder="Ex: Analista"
                      className={`pl-10 h-12 text-base ${errors.function ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      {...register('function')}
                    />
                  </div>
                  {errors.function && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.function.message}
                    </p>
                  )}
                </div>

                {/* Cargo */}
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                    Cargo *
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="position"
                      type="text"
                      placeholder="Ex: Analista de Sistemas"
                      className={`pl-10 h-12 text-base ${errors.position ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      {...register('position')}
                    />
                  </div>
                  {errors.position && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.position.message}
                    </p>
                  )}
                </div>

                {/* Matrícula */}
                <div className="space-y-2">
                  <Label htmlFor="registration" className="text-sm font-medium text-gray-700">
                    Matrícula *
                  </Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="registration"
                      type="text"
                      placeholder="Sua matrícula"
                      className={`pl-10 h-12 text-base ${errors.registration ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      {...register('registration')}
                    />
                  </div>
                  {errors.registration && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.registration.message}
                    </p>
                  )}
                </div>

                {/* Setor */}
                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-sm font-medium text-gray-700">
                    Setor *
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="sector"
                      type="text"
                      placeholder="Ex: Tecnologia da Informação"
                      className={`pl-10 h-12 text-base ${errors.sector ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                      {...register('sector')}
                    />
                  </div>
                  {errors.sector && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.sector.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-between items-center pt-6">
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Já tem uma conta? Entrar
                </Link>
                
                <Button 
                  type="submit" 
                  disabled={!isValid}
                  className="h-12 px-8 text-base font-medium bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Próxima Etapa
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 