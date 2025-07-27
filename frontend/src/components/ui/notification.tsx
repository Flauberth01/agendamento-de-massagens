import React from 'react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'
import { X, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

interface NotificationProps {
  type: NotificationType
  title: string
  description?: string
  onClose?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  showClose?: boolean
}

const notificationIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle
}

const notificationVariants = {
  info: 'default',
  success: 'default',
  warning: 'destructive',
  error: 'destructive'
} as const

export const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  description,
  onClose,
  action,
  showClose = true
}) => {
  const Icon = notificationIcons[type]
  const variant = notificationVariants[type]

  return (
    <Alert variant={variant} className="border-l-4 border-l-blue-500">
      <Icon className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>{title}</span>
        {showClose && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </AlertTitle>
      {description && (
        <AlertDescription className="mt-2">
          {description}
          {action && (
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="mt-2"
            >
              {action.label}
            </Button>
          )}
        </AlertDescription>
      )}
    </Alert>
  )
}

// Componente específico para lembretes de agendamento
interface BookingReminderProps {
  booking: {
    id: number
    chair: { name: string; location: string }
    start_time: string
    end_time: string
  }
  onViewDetails: () => void
  onCancel: () => void
  onClose: () => void
}

export const BookingReminder: React.FC<BookingReminderProps> = ({
  booking,
  onViewDetails,
  onCancel,
  onClose
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Alert className="border-l-4 border-l-blue-500 bg-blue-50">
      <Clock className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">
        Lembrete de Agendamento
      </AlertTitle>
      <AlertDescription className="mt-2 text-blue-700">
        <div className="space-y-2">
          <p>
            Você tem uma sessão agendada para <strong>{formatDate(booking.start_time)}</strong> às{' '}
            <strong>{formatTime(booking.start_time)}</strong>
          </p>
          <div className="text-sm">
            <p><strong>Cadeira:</strong> {booking.chair.name}</p>
            <p><strong>Local:</strong> {booking.chair.location}</p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
            >
              Ver Detalhes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

// Componente para avisos de cancelamento
interface CancellationWarningProps {
  onConfirm: () => void
  onCancel: () => void
  deadline: Date
}

export const CancellationWarning: React.FC<CancellationWarningProps> = ({
  onConfirm,
  onCancel,
  deadline
}) => {
  const formatDeadline = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Alert variant="destructive" className="border-l-4 border-l-red-500">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Cancelamento com Antecedência</AlertTitle>
      <AlertDescription className="mt-2">
        <p>
          Para cancelar sua sessão, você deve fazê-lo com pelo menos 3 horas de antecedência.
        </p>
        <p className="mt-2 text-sm">
          <strong>Prazo para cancelamento:</strong> {formatDeadline(deadline)}
        </p>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onConfirm}
          >
            Confirmar Cancelamento
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            Manter Agendamento
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
} 