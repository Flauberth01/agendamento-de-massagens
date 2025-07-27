import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';
import { format, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Chair } from '../../types/chair';
import type { AvailabilityTimeSlot } from '../../types/availability';

// Schema de validação
const bookingSchema = z.object({
  chair_id: z.number().min(1, 'Cadeira é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
  time_slot: z.string().min(1, 'Horário é obrigatório'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => Promise<void>;
  chairs: Chair[];
  availableSlots: AvailabilityTimeSlot[];
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export function BookingForm({ 
  onSubmit, 
  chairs, 
  availableSlots, 
  isLoading = false, 
  error, 
  className 
}: BookingFormProps) {
  const [filteredSlots, setFilteredSlots] = useState<AvailabilityTimeSlot[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const watchedDate = watch('date');
  const watchedChair = watch('chair_id');

  // Filtrar slots baseado na data e cadeira selecionadas
  useEffect(() => {
    if (watchedDate && watchedChair) {
      const filtered = availableSlots.filter(slot => {
        const slotDate = format(new Date(slot.startTime), 'yyyy-MM-dd');
        return slotDate === watchedDate && slot.chair_id === watchedChair;
      });
      setFilteredSlots(filtered);
    } else {
      setFilteredSlots([]);
    }
  }, [watchedDate, watchedChair, availableSlots]);

  const handleFormSubmit = async (data: BookingFormData) => {
    try {
      await onSubmit(data);
    } catch (err) {
      // Erro já tratado pelo componente pai
    }
  };

  const handleDateChange = (date: string) => {
    setValue('date', date);
    setValue('time_slot', ''); // Reset time slot when date changes
  };

  const handleChairChange = (chairId: string) => {
    setValue('chair_id', parseInt(chairId));
    setValue('time_slot', ''); // Reset time slot when chair changes
  };

  const handleTimeSlotChange = (timeSlot: string) => {
    setValue('time_slot', timeSlot);
  };

  // Gerar datas disponíveis (próximos 30 dias)
  const generateAvailableDates = () => {
    const dates = [];
    const today = startOfDay(new Date());
    
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      dates.push({
        value: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEEE, dd/MM/yyyy', { locale: ptBR }),
      });
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Calendar className="h-6 w-6" />
          Novo Agendamento
        </CardTitle>
        <CardDescription className="text-center">
          Selecione a data, cadeira e horário para sua sessão
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Select onValueChange={handleDateChange} disabled={isLoading}>
              <SelectTrigger className={errors.date ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione uma data" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date.value} value={date.value}>
                    {date.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Cadeira */}
          <div className="space-y-2">
            <Label htmlFor="chair_id">Cadeira</Label>
            <Select onValueChange={handleChairChange} disabled={isLoading}>
              <SelectTrigger className={errors.chair_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione uma cadeira" />
              </SelectTrigger>
              <SelectContent>
                {chairs.map((chair) => (
                  <SelectItem key={chair.id} value={chair.id.toString()}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {chair.name} - {chair.location}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.chair_id && (
              <p className="text-sm text-red-500">{errors.chair_id.message}</p>
            )}
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label htmlFor="time_slot">Horário</Label>
            <Select onValueChange={handleTimeSlotChange} disabled={isLoading || !watchedDate || !watchedChair}>
              <SelectTrigger className={errors.time_slot ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {filteredSlots.length > 0 ? (
                  filteredSlots.map((slot) => (
                    <SelectItem key={slot.startTime.toISOString()} value={slot.startTime.toISOString()}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {format(new Date(slot.startTime), 'HH:mm')} - {format(new Date(slot.endTime), 'HH:mm')}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Nenhum horário disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.time_slot && (
              <p className="text-sm text-red-500">{errors.time_slot.message}</p>
            )}
            {watchedDate && watchedChair && filteredSlots.length === 0 && (
              <p className="text-sm text-amber-600">
                Não há horários disponíveis para esta data e cadeira
              </p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Digite alguma observação ou informação adicional..."
              {...register('notes')}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Resumo do agendamento */}
          {watchedDate && watchedChair && watchedDate && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resumo do Agendamento
              </h4>
              <div className="space-y-1 text-sm">
                <p><strong>Data:</strong> {format(new Date(watchedDate), 'EEEE, dd/MM/yyyy', { locale: ptBR })}</p>
                <p><strong>Cadeira:</strong> {chairs.find(c => c.id === watchedChair)?.name}</p>
                <p><strong>Localização:</strong> {chairs.find(c => c.id === watchedChair)?.location}</p>
                <p><strong>Duração:</strong> 30 minutos</p>
              </div>
            </div>
          )}

          {/* Erro geral */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botão de submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !watchedDate || !watchedChair || !watch('time_slot')}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agendando...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Confirmar Agendamento
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 