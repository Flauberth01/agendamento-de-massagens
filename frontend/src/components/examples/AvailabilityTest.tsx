import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { availabilityService } from '@/services/availabilityService'


export const AvailabilityTest: React.FC = () => {
  const [selectedChairId, setSelectedChairId] = useState<number>(1)
  const [selectedDate, setSelectedDate] = useState<string>('2024-01-15')

  // Test single day availability
  const {
    data: singleDayData,
    isLoading: isLoadingSingle,
    error: singleError,
    refetch: refetchSingle
  } = useQuery({
    queryKey: ['availability-test-single', selectedChairId, selectedDate],
    queryFn: () => availabilityService.getAvailableSlots({
      chairId: selectedChairId,
      date: selectedDate
    }),
    enabled: !!selectedChairId && !!selectedDate,
    staleTime: 1 * 60 * 1000,
  })

  // Test next 15 days availability
  const {
    data: next15DaysData,
    isLoading: isLoadingNext15,
    error: next15Error,
    refetch: refetchNext15
  } = useQuery({
    queryKey: ['availability-test-next15', selectedChairId],
    queryFn: () => availabilityService.getNext15DaysAvailableSlots(selectedChairId),
    enabled: !!selectedChairId,
    staleTime: 1 * 60 * 1000,
  })

  const handleTestSingle = () => {
    refetchSingle()
  }

  const handleTestNext15 = () => {
    refetchNext15()
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Teste de Disponibilidade - API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex gap-4 items-center">
            <div>
              <label className="text-sm font-medium">Cadeira ID:</label>
              <input
                type="number"
                value={selectedChairId}
                onChange={(e) => setSelectedChairId(parseInt(e.target.value) || 1)}
                className="ml-2 px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="ml-2 px-2 py-1 border rounded"
              />
            </div>
          </div>

          {/* Single Day Test */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Teste - Data Específica</h3>
            <Button onClick={handleTestSingle} disabled={isLoadingSingle} className="mb-4">
              {isLoadingSingle && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Testar /api/availabilities/chair/{selectedChairId}/available-slots
            </Button>

            {singleError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro: {singleError.message}
                </AlertDescription>
              </Alert>
            )}

            {singleDayData && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Resposta:</strong> {JSON.stringify(singleDayData, null, 2)}
                </div>
                {singleDayData.data && singleDayData.data.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Horários Disponíveis:</div>
                    <div className="flex flex-wrap gap-2">
                      {singleDayData.data.map((time, index) => (
                        <Badge key={index} variant="secondary">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Next 15 Days Test */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Teste - Próximos 15 Dias</h3>
            <Button onClick={handleTestNext15} disabled={isLoadingNext15} className="mb-4">
              {isLoadingNext15 && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Testar /api/availabilities/chair/{selectedChairId}/next-15-days
            </Button>

            {next15Error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro: {next15Error.message}
                </AlertDescription>
              </Alert>
            )}

            {next15DaysData && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Resposta:</strong> {JSON.stringify(next15DaysData, null, 2)}
                </div>
                {Object.keys(next15DaysData).length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Datas com Horários:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(next15DaysData).map(([date, times]) => (
                        <div key={date} className="border rounded p-2">
                          <div className="text-xs font-medium">{date}</div>
                          <div className="text-xs text-gray-600">
                            {times.length} horários: {times.slice(0, 3).join(', ')}
                            {times.length > 3 && '...'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 