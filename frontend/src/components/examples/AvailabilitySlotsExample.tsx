import React, { useState } from 'react'
import { useAvailability } from '@/hooks/useAvailability'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AvailabilitySlotsExampleProps {
  chairId: number
}

export const AvailabilitySlotsExample: React.FC<AvailabilitySlotsExampleProps> = ({ chairId }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<'single' | 'next15'>('single')

  const { useAvailableSlots, useNext15DaysAvailableSlots } = useAvailability()

  // Query para data específica
  const {
    data: singleDayData,
    isLoading: isLoadingSingle,
    error: singleError
  } = useAvailableSlots(chairId, selectedDate || new Date())

  // Query para próximos 15 dias
  const {
    data: next15DaysData,
    isLoading: isLoadingNext15,
    error: next15Error
  } = useNext15DaysAvailableSlots(chairId)

  const formatTime = (time: string) => {
    return time
  }

  const renderSingleDaySlots = () => {
    if (isLoadingSingle) {
      return <div className="text-center py-4">Carregando horários...</div>
    }

    if (singleError) {
      return <div className="text-red-500 py-4">Erro ao carregar horários: {singleError.message}</div>
    }

    if (!singleDayData?.data || singleDayData.data.length === 0) {
      return <div className="text-gray-500 py-4">Nenhum horário disponível para esta data</div>
    }

    return (
      <div className="grid grid-cols-3 gap-2">
        {singleDayData.data.map((time, index) => (
          <Badge key={index} variant="secondary" className="text-center py-2">
            {formatTime(time)}
          </Badge>
        ))}
      </div>
    )
  }

  const renderNext15DaysSlots = () => {
    if (isLoadingNext15) {
      return <div className="text-center py-4">Carregando próximos 15 dias...</div>
    }

    if (next15Error) {
      return <div className="text-red-500 py-4">Erro ao carregar dados: {next15Error.message}</div>
    }

    if (!next15DaysData || Object.keys(next15DaysData).length === 0) {
      return <div className="text-gray-500 py-4">Nenhum horário disponível nos próximos 15 dias</div>
    }

    return (
      <div className="space-y-4">
        {Object.entries(next15DaysData).map(([date, slots]) => (
          <div key={date} className="border rounded-lg p-3">
            <div className="font-medium mb-2">
              {format(new Date(date), 'EEEE, dd/MM/yyyy', { locale: ptBR })}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {slots.map((time, index) => (
                <Badge key={index} variant="outline" className="text-xs text-center">
                  {formatTime(time)}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Horários Disponíveis - Cadeira {chairId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button
              variant={viewMode === 'single' ? 'default' : 'outline'}
              onClick={() => setViewMode('single')}
            >
              Data Específica
            </Button>
            <Button
              variant={viewMode === 'next15' ? 'default' : 'outline'}
              onClick={() => setViewMode('next15')}
            >
              Próximos 15 Dias
            </Button>
          </div>

          {viewMode === 'single' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Selecionar Data:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {selectedDate && (
                <div>
                  <h4 className="font-medium mb-2">
                    Horários disponíveis para {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                  </h4>
                  {renderSingleDaySlots()}
                </div>
              )}
            </div>
          )}

          {viewMode === 'next15' && (
            <div>
              <h4 className="font-medium mb-4">Próximos 15 dias com horários disponíveis</h4>
              {renderNext15DaysSlots()}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Endpoint para data específica:</strong>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                GET /api/availabilities/chair/{chairId}/available-slots?date=YYYY-MM-DD
              </code>
            </div>
            <div>
              <strong>Endpoint para próximos 15 dias:</strong>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                GET /api/availabilities/chair/{chairId}/next-15-days
              </code>
            </div>
            <div>
              <strong>Resposta exemplo:</strong>
              <pre className="block bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`{
  "chair_id": 1,
  "date": "2024-01-15",
  "data": ["08:00", "08:30", "09:00", "09:30"]
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 