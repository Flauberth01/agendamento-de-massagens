import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { useChairs } from '../../hooks/useChairs';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';


const editChairSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  location: z.string().min(1, 'Localização é obrigatória').max(100, 'Localização deve ter no máximo 100 caracteres'),
  status: z.enum(['ativa', 'inativa'])
});

type EditChairFormData = z.infer<typeof editChairSchema>;

export default function ChairEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const chairId = parseInt(id || '0');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { useChairById, useUpdateChair } = useChairs();
  const { data: chair, isLoading, error } = useChairById(chairId);
  const updateMutation = useUpdateChair();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EditChairFormData>({
    resolver: zodResolver(editChairSchema)
  });

  // Preencher formulário quando os dados da cadeira forem carregados
  useEffect(() => {
    if (chair) {
      reset({
        name: chair.name,
        description: chair.description || '',
        location: chair.location,
        status: chair.status
      });
    }
  }, [chair, reset]);

  const onSubmit = async (data: EditChairFormData) => {
    try {
      await updateMutation.mutateAsync({ id: chairId, data });
      navigate('/chairs');
    } catch (error) {
      console.error('Erro ao atualizar cadeira:', error);
    }
  };

  const handleBack = () => {
    navigate('/chairs');
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    handleBack();
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erro ao carregar cadeira</h1>
          <p className="text-muted-foreground mt-2">A cadeira não foi encontrada ou ocorreu um erro.</p>
          <Button onClick={() => navigate('/chairs')} className="mt-4">
            Voltar à lista
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando dados da cadeira...</p>
        </div>
      </div>
    );
  }

  if (!chair) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Cadeira não encontrada</h1>
          <Button onClick={() => navigate('/chairs')} className="mt-4">
            Voltar à lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Cadeira</h1>
          <p className="text-muted-foreground">
            Modifique as informações da cadeira
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações da Cadeira</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Cadeira *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: Cadeira Principal"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização *</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Ex: Térreo - Sala 1"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descreva a cadeira, características especiais, observações..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register('status')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
              </select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Criado em</h4>
                <p className="mt-1">{new Date(chair.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Última atualização</h4>
                <p className="mt-1">{new Date(chair.updated_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={confirmCancel}
        title="Cancelar Edição"
        message="Tem certeza que deseja cancelar? As alterações não salvas serão perdidas."
        confirmText="Sim, Cancelar"
        cancelText="Continuar Editando"
        variant="destructive"
      />
    </div>
  );
} 