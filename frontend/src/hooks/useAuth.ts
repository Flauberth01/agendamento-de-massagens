import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import type { LoginForm, RegisterStep1Form, RegisterStep2Form, AuthResponse } from '@/types/user'

export const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, setUser, logout: logoutStore } = useAuthStore()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => authService.login(data),
    onSuccess: (response: AuthResponse) => {
      setUser(response.user)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      
      // Redirecionar baseado no role
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (response.user.role === 'atendente') {
        navigate('/attendant/dashboard')
      } else {
        navigate('/dashboard')
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error)
    }
  })

  // Register step 1 mutation
  const registerStep1Mutation = useMutation({
    mutationFn: (data: RegisterStep1Form) => authService.registerStep1(data),
    onSuccess: () => {
      navigate('/register/step2')
    }
  })

  // Register step 2 mutation
  const registerStep2Mutation = useMutation({
    mutationFn: (data: RegisterStep2Form) => authService.registerStep2(data),
    onSuccess: () => {
      navigate('/login', { 
        state: { message: 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador.' }
      })
    }
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Usar o logout do store que já faz a chamada da API
      await logoutStore()
      return { success: true }
    },
    onSuccess: () => {
      // Cancelar todas as requisições pendentes
      queryClient.cancelQueries()
      
      // Limpar cache e navegar
      queryClient.clear()
      
      // Limpar qualquer estado residual
      sessionStorage.clear()
      
      // Navegar para login
      navigate('/login', { replace: true })
    },
    onError: () => {
      // Cancelar todas as requisições pendentes
      queryClient.cancelQueries()
      
      // Mesmo com erro, limpar cache e navegar
      queryClient.clear()
      
      // Limpar qualquer estado residual
      sessionStorage.clear()
      
      // Navegar para login
      navigate('/login', { replace: true })
    }
  })

  // Refresh token mutation
  const refreshMutation = useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: () => {
      // Token será atualizado automaticamente pelo interceptor do axios
    },
    onError: () => {
      logoutStore()
      queryClient.clear()
      navigate('/login')
    }
  })

  // Verificar se usuário está autenticado
  const isAuthenticated = !!user && !!user.id

  // Verificar se usuário está aprovado
  const isApproved = user?.status === 'aprovado'

  // Verificar se usuário pode fazer login
  const canLogin = isAuthenticated && isApproved

  // Verificar permissões por role
  const hasRole = (role: string | string[]) => {
    if (!user) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role)
  }

  const isAdmin = hasRole('admin')
  const isAttendant = hasRole(['admin', 'atendente'])
  const isUser = hasRole(['admin', 'atendente', 'usuario'])

  return {
    // State
    user,
    isAuthenticated,
    isApproved,
    canLogin,
    isAdmin,
    isAttendant,
    isUser,
    hasRole,

    // Mutations
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,

    registerStep1: registerStep1Mutation.mutate,
    registerStep1Async: registerStep1Mutation.mutateAsync,
    isRegisteringStep1: registerStep1Mutation.isPending,

    registerStep2: registerStep2Mutation.mutate,
    registerStep2Async: registerStep2Mutation.mutateAsync,
    isRegisteringStep2: registerStep2Mutation.isPending,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    refresh: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,

    // Errors
    loginError: loginMutation.error,
    registerStep1Error: registerStep1Mutation.error,
    registerStep2Error: registerStep2Mutation.error,
    logoutError: logoutMutation.error,
    refreshError: refreshMutation.error,
  }
} 