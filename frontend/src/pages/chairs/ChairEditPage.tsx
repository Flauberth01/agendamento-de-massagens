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

const editChairSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição deve ter no máximo 500 caracteres'),
  status: z.enum(['ativa', 'inativa'])
});

type EditChairFormData = z.infer<typeof editChairSchema>;

interface Chair {
  id: string;
  name: string;
  description: string;
  status: 'ativa' | 'inativa';
  created_at: string;
  updated_at: string;
}

export default function ChairEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [chair, setChair] = useState<Chair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EditChairFormData>({
    resolver: zodResolver(editChairSchema)
  });

  useEffect(() => {
    // Simular carregamento de dados
    const mockChair: Chair = {
      id: id || '1',
      name: 'Cadeira Principal',
      description: 'Cadeira principal do consultório, localizada na sala 1. Equipada com todos os instrumentos necessários para atendimento odontológico.',
      status: 'ativa',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    };

    setTimeout(() => {
      setChair(mockChair);
      reset({
        name: mockChair.name,
        description: mockChair.description,
        status: mockChair.status
      });
      setIsLoading(false);
    }, 1000);
  }, [id, reset]);

  const onSubmit = async (data: EditChairFormData) => {
    setIsSaving(true);
    
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Dados atualizados da cadeira:', data);
      
      // Aqui seria feita a chamada real para a API
      // await chairService.updateChair(id!, data);
      
      alert('Cadeira atualizada com sucesso!');
      navigate(`/chairs/${id}`);
    } catch (error) {
      console.error('Erro ao atualizar cadeira:', error);
      alert('Erro ao atualizar cadeira. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/chairs/${id}`);
  };

  const handleCancel = () => {
    if (confirm('Tem certeza que deseja cancelar? As alterações serão perdidas.')) {
      handleBack();
    }
  };

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
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descreva a cadeira, localização, características especiais..."
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
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
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
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
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
    </div>
  );
} 