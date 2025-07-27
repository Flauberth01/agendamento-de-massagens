import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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


const createChairSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  location: z.string().min(1, 'Localização é obrigatória').max(100, 'Localização deve ter no máximo 100 caracteres'),
  status: z.enum(['ativa', 'inativa'])
});

type CreateChairFormData = z.infer<typeof createChairSchema>;

export default function ChairCreatePage() {
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { useCreateChair } = useChairs();
  const createMutation = useCreateChair();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateChairFormData>({
    resolver: zodResolver(createChairSchema),
    defaultValues: {
      status: 'ativa'
    }
  });

  const onSubmit = async (data: CreateChairFormData) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/chairs');
    } catch (error) {
      console.error('Erro ao criar cadeira:', error);
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
          <h1 className="text-3xl font-bold">Nova Cadeira</h1>
          <p className="text-muted-foreground">
            Adicione uma nova cadeira ao sistema
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

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Criar Cadeira
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
        title="Cancelar Criação"
        message="Tem certeza que deseja cancelar? Os dados preenchidos serão perdidos."
        confirmText="Sim, Cancelar"
        cancelText="Continuar Criando"
        variant="destructive"
      />
    </div>
  );
} 