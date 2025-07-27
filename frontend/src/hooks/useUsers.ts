import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/userService'
import type { 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserApprovalRequest 
} from '@/types/user'

export const useUsers = () => {
  const queryClient = useQueryClient()

  // Listar usuários
  const useUsersList = (page = 1, limit = 10, search = '') => {
    return useQuery({
      queryKey: ['users', page, limit, search],
      queryFn: () => userService.getAllUsers({ page, limit, search }),
      staleTime: 5 * 60 * 1000, // 5 minutos
    })
  }

  // Buscar usuário por ID
  const useUserById = (id: number) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: () => userService.getUserById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutos
    })
  }

  // Usuários pendentes
  const usePendingUsers = () => {
    return useQuery({
      queryKey: ['users', 'pending'],
      queryFn: () => userService.getPendingUsers(),
      staleTime: 2 * 60 * 1000, // 2 minutos
    })
  }

  // Criar usuário
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  // Atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
  })

  // Deletar usuário
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  // Aprovar usuário
  const approveUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserApprovalRequest }) =>
      userService.approveUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'pending'] })
    },
  })

  // Rejeitar usuário
  const rejectUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserApprovalRequest }) =>
      userService.approveUser(id, { ...data, status: 'reprovado' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'pending'] })
    },
  })

  return {
    // Queries
    useUsersList,
    useUserById,
    usePendingUsers,

    // Mutations
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,

    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,

    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
    isDeletingUser: deleteUserMutation.isPending,

    approveUser: approveUserMutation.mutate,
    approveUserAsync: approveUserMutation.mutateAsync,
    isApprovingUser: approveUserMutation.isPending,

    rejectUser: rejectUserMutation.mutate,
    rejectUserAsync: rejectUserMutation.mutateAsync,
    isRejectingUser: rejectUserMutation.isPending,

    // Errors
    createUserError: createUserMutation.error,
    updateUserError: updateUserMutation.error,
    deleteUserError: deleteUserMutation.error,
    approveUserError: approveUserMutation.error,
    rejectUserError: rejectUserMutation.error,
  }
} 