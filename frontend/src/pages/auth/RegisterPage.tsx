import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { registerStep1Schema, type RegisterStep1Form } from '../../utils/validation'
import { ArrowLeft } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterStep1Form>({
    resolver: zodResolver(registerStep1Schema),
    mode: 'onChange',
  })

  const onSubmit = (data: RegisterStep1Form) => {
    // Salvar dados da etapa 1 no localStorage
    localStorage.setItem('register_step1', JSON.stringify(data))
    // Navegar para etapa 2
    navigate('/register/step2')
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/login" 
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar ao Login
            </Link>
            <div className="flex-1"></div>
          </div>
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <p className="text-gray-600">Etapa 1 de 2 - Dados Pessoais e Profissionais</p>
          
          {/* Progress bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cpf">CPF *</Label>
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
                <Label htmlFor="function">Função *</Label>
                <Input
                  id="function"
                  type="text"
                  placeholder="Ex: Analista"
                  {...register('function')}
                  className={errors.function ? 'border-red-500' : ''}
                />
                {errors.function && (
                  <p className="text-sm text-red-500 mt-1">{errors.function.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="position">Cargo *</Label>
                <Input
                  id="position"
                  type="text"
                  placeholder="Ex: Analista de Sistemas"
                  {...register('position')}
                  className={errors.position ? 'border-red-500' : ''}
                />
                {errors.position && (
                  <p className="text-sm text-red-500 mt-1">{errors.position.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="registration">Matrícula *</Label>
                <Input
                  id="registration"
                  type="text"
                  placeholder="Sua matrícula"
                  {...register('registration')}
                  className={errors.registration ? 'border-red-500' : ''}
                />
                {errors.registration && (
                  <p className="text-sm text-red-500 mt-1">{errors.registration.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sector">Setor *</Label>
                <Input
                  id="sector"
                  type="text"
                  placeholder="Ex: Tecnologia da Informação"
                  {...register('sector')}
                  className={errors.sector ? 'border-red-500' : ''}
                />
                {errors.sector && (
                  <p className="text-sm text-red-500 mt-1">{errors.sector.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@empresa.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-800"
              >
                Já tem uma conta? Entrar
              </Link>
              
              <Button 
                type="submit" 
                disabled={!isValid}
                className="px-8"
              >
                Próxima Etapa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 