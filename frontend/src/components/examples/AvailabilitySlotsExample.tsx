import React, { useState } from 'react'
import { useAvailability } from '@/hooks/useAvailability'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
                <input
                  type="date"
                  value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                  className="px-3 py-2 border rounded-md"
                />
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
  "data": ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "00:00"]
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 