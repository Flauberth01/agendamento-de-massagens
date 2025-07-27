import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chairService } from '../services/chairService';
import { toast } from 'sonner';

export const useChairs = () => {
  const queryClient = useQueryClient();

  // Queries
  const useAllChairs = () => {
    return useQuery({
      queryKey: ['chairs'],
      queryFn: () => chairService.getAllChairs(),
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  const useChairById = (id: number) => {
    return useQuery({
      queryKey: ['chairs', id],
      queryFn: () => chairService.getChairById(id),
      enabled: !!id,
    });
  };

  const useAvailableChairs = () => {
    return useQuery({
      queryKey: ['chairs', 'available'],
      queryFn: () => chairService.getAvailableChairs({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '18:00'
      }),
      staleTime: 2 * 60 * 1000, // 2 minutos
    });
  };

  const useChairStats = () => {
    return useQuery({
      queryKey: ['chairs', 'stats'],
      queryFn: chairService.getChairStats,
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  const useChairsWithTodayBookings = () => {
    return useQuery({
      queryKey: ['chairs', 'today-bookings'],
      queryFn: chairService.getChairsWithTodayBookings,
      staleTime: 1 * 60 * 1000, // 1 minuto
    });
  };

  const useChairBookings = (chairId: number, params?: {
    limit?: number
    offset?: number
  }) => {
    return useQuery({
      queryKey: ['chairs', chairId, 'bookings', params],
      queryFn: () => chairService.getChairBookings(chairId, params),
      enabled: !!chairId,
      staleTime: 2 * 60 * 1000, // 2 minutos
    });
  };

  // Mutations
  const useCreateChair = () => {
    return useMutation({
      mutationFn: chairService.createChair,
      onSuccess: () => {
        toast.success('Cadeira criada com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['chairs'] });
      },
      onError: (error) => {
        console.error('Erro ao criar cadeira:', error);
        toast.error('Erro ao criar cadeira. Tente novamente.');
      },
    });
  };

  const useUpdateChair = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: any }) => 
        chairService.updateChair(id, data),
      onSuccess: (_, { id }) => {
        toast.success('Cadeira atualizada com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['chairs'] });
        queryClient.invalidateQueries({ queryKey: ['chairs', id] });
      },
      onError: (error) => {
        console.error('Erro ao atualizar cadeira:', error);
        toast.error('Erro ao atualizar cadeira. Tente novamente.');
      },
    });
  };

  const useToggleChairStatus = () => {
    return useMutation({
      mutationFn: (id: number) => chairService.toggleChairStatus(id),
      onSuccess: (response, id) => {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ['chairs'] });
        queryClient.invalidateQueries({ queryKey: ['chairs', id] });
      },
      onError: (error) => {
        console.error('Erro ao alternar status da cadeira:', error);
        toast.error('Erro ao alternar status da cadeira. Tente novamente.');
      },
    });
  };

  const useDeleteChair = () => {
    return useMutation({
      mutationFn: chairService.deleteChair,
      onSuccess: () => {
        toast.success('Cadeira excluída com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['chairs'] });
      },
      onError: (error) => {
        console.error('Erro ao excluir cadeira:', error);
        toast.error('Erro ao excluir cadeira. Tente novamente.');
      },
    });
  };

  return {
    // Queries
    useAllChairs,
    useChairById,
    useAvailableChairs,
    useChairStats,
    useChairsWithTodayBookings,
    useChairBookings,
    
    // Mutations
    useCreateChair,
    useUpdateChair,
    useToggleChairStatus,
    useDeleteChair,
  };
}; 