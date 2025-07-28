import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { availabilityService } from '@/services/availabilityService'
import type { 
  CreateAvailabilityRequest, 
  UpdateAvailabilityRequest
} from '@/types/availability'

export const useAvailability = () => {
  const queryClient = useQueryClient()

  // Listar disponibilidades
  const useAvailabilitiesList = (page = 1, limit = 10) => {
    return useQuery({
      queryKey: ['availabilities', page, limit],
      queryFn: () => availabilityService.getAllAvailabilities({ page, limit }),
      staleTime: 5 * 60 * 1000, // 5 minutos
    })
  }

  // Buscar disponibilidade por ID
  const useAvailabilityById = (id: number) => {
    return useQuery({
      queryKey: ['availability', id],
      queryFn: () => availabilityService.getAvailabilityById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutos
    })
  }

  // Disponibilidades por cadeira
  const useAvailabilitiesByChair = (chairId: number) => {
    return useQuery({
      queryKey: ['availabilities', 'chair', chairId],
      queryFn: () => availabilityService.getAvailabilitiesByChair(chairId),
      enabled: !!chairId,
      staleTime: 2 * 60 * 1000, // 2 minutos
    })
  }

  // Slots disponíveis por cadeira
  const useAvailableSlots = (chairId: number, date: Date) => {
    return useQuery({
      queryKey: ['availability', 'slots', chairId, date.toISOString().split('T')[0]],
      queryFn: () => availabilityService.getAvailableSlots({ 
        chairId, 
        date: date.toISOString().split('T')[0] 
      }),
      enabled: !!chairId && !!date,
      staleTime: 1 * 60 * 1000, // 1 minuto
    })
  }

  // Próximos 15 dias disponíveis por cadeira
  const useNext15DaysAvailableSlots = (chairId: number) => {
    return useQuery({
      queryKey: ['availability', 'next-15-days', chairId],
      queryFn: () => availabilityService.getNext15DaysAvailableSlots(chairId),
      enabled: !!chairId,
      staleTime: 5 * 60 * 1000, // 5 minutos
    })
  }

  // Estatísticas de disponibilidade
  const useAvailabilityStats = () => {
    return useQuery({
      queryKey: ['availability', 'stats'],
      queryFn: () => availabilityService.getAvailabilityStats(),
      staleTime: 5 * 60 * 1000, // 5 minutos
    })
  }

  // Criar disponibilidade
  const createAvailabilityMutation = useMutation({
    mutationFn: (data: CreateAvailabilityRequest) => availabilityService.createAvailability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] })
    },
  })

  // Atualizar disponibilidade
  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAvailabilityRequest }) =>
      availabilityService.updateAvailability(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] })
      queryClient.invalidateQueries({ queryKey: ['availability', id] })
    },
  })

  // Deletar disponibilidade
  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id: number) => availabilityService.deleteAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] })
    },
  })

  // Ativar disponibilidade
  const activateAvailabilityMutation = useMutation({
    mutationFn: (id: number) => availabilityService.activateAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] })
    },
  })

  // Desativar disponibilidade
  const deactivateAvailabilityMutation = useMutation({
    mutationFn: (id: number) => availabilityService.deactivateAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] })
    },
  })

  // Definir período de validade
  const setValidityPeriodMutation = useMutation({
    mutationFn: ({ id, validFrom, validTo }: { id: number; validFrom?: Date; validTo?: Date }) =>
      availabilityService.setValidityPeriod(id, {
        validFrom: validFrom?.toISOString(),
        validTo: validTo?.toISOString()
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] })
      queryClient.invalidateQueries({ queryKey: ['availability', id] })
    },
  })

  return {
    // Queries
    useAvailabilitiesList,
    useAvailabilityById,
    useAvailabilitiesByChair,
    useAvailableSlots,
    useNext15DaysAvailableSlots,
    useAvailabilityStats,

    // Mutations
    createAvailability: createAvailabilityMutation.mutate,
    createAvailabilityAsync: createAvailabilityMutation.mutateAsync,
    isCreatingAvailability: createAvailabilityMutation.isPending,

    updateAvailability: updateAvailabilityMutation.mutate,
    updateAvailabilityAsync: updateAvailabilityMutation.mutateAsync,
    isUpdatingAvailability: updateAvailabilityMutation.isPending,

    deleteAvailability: deleteAvailabilityMutation.mutate,
    deleteAvailabilityAsync: deleteAvailabilityMutation.mutateAsync,
    isDeletingAvailability: deleteAvailabilityMutation.isPending,

    activateAvailability: activateAvailabilityMutation.mutate,
    activateAvailabilityAsync: activateAvailabilityMutation.mutateAsync,
    isActivatingAvailability: activateAvailabilityMutation.isPending,

    deactivateAvailability: deactivateAvailabilityMutation.mutate,
    deactivateAvailabilityAsync: deactivateAvailabilityMutation.mutateAsync,
    isDeactivatingAvailability: deactivateAvailabilityMutation.isPending,

    setValidityPeriod: setValidityPeriodMutation.mutate,
    setValidityPeriodAsync: setValidityPeriodMutation.mutateAsync,
    isSettingValidityPeriod: setValidityPeriodMutation.isPending,

    // Errors
    createAvailabilityError: createAvailabilityMutation.error,
    updateAvailabilityError: updateAvailabilityMutation.error,
    deleteAvailabilityError: deleteAvailabilityMutation.error,
    activateAvailabilityError: activateAvailabilityMutation.error,
    deactivateAvailabilityError: deactivateAvailabilityMutation.error,
    setValidityPeriodError: setValidityPeriodMutation.error,
  }
} 