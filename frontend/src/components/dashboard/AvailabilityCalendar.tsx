import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Chair } from '../../types/chair';
import type { AvailabilityTimeSlot } from '../../types/availability';
import type { Booking } from '../../types/booking';

interface AvailabilityCalendarProps {
  chairs: Chair[];
  availability: AvailabilityTimeSlot[];
  bookings: Booking[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onTimeSlotSelect?: (date: Date, timeSlot: string, chairId: number) => void;
  isLoading?: boolean;
  error?: string;
  userRole?: 'usuario' | 'atendente' | 'admin';
}

export function AvailabilityCalendar({
  chairs,
  availability,
  bookings,
  selectedDate = new Date(),
  onTimeSlotSelect,
  isLoading = false,
  error
}: AvailabilityCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState<Date>(selectedDate);
  const [selectedChair, setSelectedChair] = useState<number | 'all'>('all');

  // Horários de funcionamento (8h às 18h)
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Obter dias da semana atual
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Segunda-feira
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Domingo
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filtrar cadeiras ativas
  const activeChairs = chairs.filter(chair => chair.status === 'ativa');

  // Obter disponibilidade para uma data e cadeira específicas
  const getAvailabilityForDateAndChair = (date: Date, chairId: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.filter(slot => 
      format(slot.startTime, 'yyyy-MM-dd') === dateStr && 
      slot.chair_id === chairId
    );
  };

  // Verificar se um horário está disponível
  const isTimeSlotAvailable = (date: Date, timeSlot: string, chairId: number) => {
    const dayAvailability = getAvailabilityForDateAndChair(date, chairId);
    const slot = dayAvailability.find(s => 
      format(s.startTime, 'HH:mm') === timeSlot
    );
    return slot?.available ?? false;
  };

  // Verificar se há agendamento para um horário
  const getBookingForTimeSlot = (date: Date, timeSlot: string, chairId: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.find(booking => 
      format(new Date(booking.start_time), 'yyyy-MM-dd') === dateStr &&
      booking.chair_id === chairId &&
      format(new Date(booking.start_time), 'HH:mm') === timeSlot
    );
  };

  // Obter status de um horário
  const getTimeSlotStatus = (date: Date, timeSlot: string, chairId: number) => {
    const booking = getBookingForTimeSlot(date, timeSlot, chairId);
    if (booking) {
      return {
        status: 'booked' as const,
        booking,
        label: `${booking.user.name}`
      };
    }

    const isAvailable = isTimeSlotAvailable(date, timeSlot, chairId);
    if (isAvailable) {
      return {
        status: 'available' as const,
        label: 'Disponível'
      };
    }

    return {
      status: 'unavailable' as const,
      label: 'Indisponível'
    };
  };

  // Navegar para a semana anterior
  const goToPreviousWeek = () => {
    setCurrentWeek(subDays(currentWeek, 7));
  };

  // Navegar para a próxima semana
  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  // Ir para hoje
  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  // Obter classes CSS para um dia
  const getDayClasses = (date: Date) => {
    const baseClasses = 'p-2 text-center border-r border-b min-h-[60px]';
    
    if (isToday(date)) {
      return `${baseClasses} bg-blue-50 border-blue-200`;
    }
    if (isTomorrow(date)) {
      return `${baseClasses} bg-green-50 border-green-200`;
    }
    if (isYesterday(date)) {
      return `${baseClasses} bg-gray-50 border-gray-200`;
    }
    
    return `${baseClasses} bg-white`;
  };

  // Obter classes CSS para um horário
  const getTimeSlotClasses = (status: 'available' | 'booked' | 'unavailable') => {
    const baseClasses = 'p-1 text-xs rounded cursor-pointer transition-colors';
    
    switch (status) {
      case 'available':
        return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`;
      case 'booked':
        return `${baseClasses} bg-red-100 text-red-800 cursor-not-allowed`;
      case 'unavailable':
        return `${baseClasses} bg-gray-100 text-gray-500 cursor-not-allowed`;
      default:
        return baseClasses;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando calendário...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Disponibilidade
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={selectedChair.toString()} onValueChange={(value) => setSelectedChair(value === 'all' ? 'all' : parseInt(value))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar cadeira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cadeiras</SelectItem>
                {activeChairs.map(chair => (
                  <SelectItem key={chair.id} value={chair.id.toString()}>
                    {chair.name} - {chair.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm font-medium">
            {format(weekStart, 'dd/MM/yyyy', { locale: ptBR })} - {format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-4 w-4 text-red-600" />
            <span>Ocupado</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <span>Indisponível</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Cabeçalho com dias da semana */}
            <div className="grid grid-cols-8 border border-gray-200 rounded-t-lg">
              <div className="p-2 text-center font-medium bg-gray-50 border-r">
                Horário
              </div>
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="p-2 text-center font-medium bg-gray-50 border-r">
                  <div className="text-sm font-semibold">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={`text-xs ${isToday(day) ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                    {format(day, 'dd/MM')}
                  </div>
                </div>
              ))}
            </div>

            {/* Linhas de horários */}
            {timeSlots.map((timeSlot) => (
              <div key={timeSlot} className="grid grid-cols-8 border-l border-r border-b border-gray-200">
                <div className="p-2 text-center text-sm font-medium bg-gray-50 border-r flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {timeSlot}
                </div>
                
                {weekDays.map((day) => (
                  <div key={`${day.toISOString()}-${timeSlot}`} className={getDayClasses(day)}>
                    {selectedChair === 'all' ? (
                      // Mostrar todas as cadeiras
                      <div className="space-y-1">
                        {activeChairs.map(chair => {
                          const status = getTimeSlotStatus(day, timeSlot, chair.id);
                          return (
                            <div
                              key={chair.id}
                              className={getTimeSlotClasses(status.status)}
                              onClick={() => {
                                if (status.status === 'available' && onTimeSlotSelect) {
                                  onTimeSlotSelect(day, timeSlot, chair.id);
                                }
                              }}
                              title={`${chair.name} - ${status.label}`}
                            >
                              <div className="font-medium">{chair.name}</div>
                              {status.status === 'booked' && (
                                <div className="text-xs truncate">{status.booking?.user.name}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Mostrar apenas a cadeira selecionada
                      (() => {
                        const chair = activeChairs.find(c => c.id === selectedChair);
                        if (!chair) return null;
                        
                        const status = getTimeSlotStatus(day, timeSlot, chair.id);
                        return (
                          <div
                            className={getTimeSlotClasses(status.status)}
                            onClick={() => {
                              if (status.status === 'available' && onTimeSlotSelect) {
                                onTimeSlotSelect(day, timeSlot, chair.id);
                              }
                            }}
                            title={`${chair.name} - ${status.label}`}
                          >
                            <div className="font-medium">{status.label}</div>
                            {status.status === 'booked' && (
                              <div className="text-xs truncate">{status.booking?.user.name}</div>
                            )}
                          </div>
                        );
                      })()
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas da semana */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">
                {activeChairs.length * timeSlots.length * 7}
              </div>
              <div className="text-muted-foreground">Total de horários</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">
                                 {activeChairs.length * timeSlots.length * 7 - bookings.filter(b => 
                   weekDays.some(day => isSameDay(new Date(b.start_time), day))
                 ).length}
              </div>
              <div className="text-muted-foreground">Disponíveis</div>
            </div>
            <div className="text-center">
                             <div className="font-semibold text-red-600">
                 {bookings.filter(b => 
                   weekDays.some(day => isSameDay(new Date(b.start_time), day))
                 ).length}
               </div>
              <div className="text-muted-foreground">Ocupados</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {activeChairs.length}
              </div>
              <div className="text-muted-foreground">Cadeiras ativas</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 