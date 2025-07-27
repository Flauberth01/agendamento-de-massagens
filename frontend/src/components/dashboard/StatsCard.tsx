import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          icon: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200'
        }
      case 'warning':
        return {
          icon: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200'
        }
      case 'danger':
        return {
          icon: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200'
        }
      default:
        return {
          icon: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Card className={cn('border-l-4', styles.border, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', styles.bg)}>
          <Icon className={cn('h-4 w-4', styles.icon)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {value}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-500 ml-1">
              vs. mês anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente para estatísticas em grid
interface StatsGridProps {
  children: React.ReactNode
  className?: string
}

export const StatsGrid: React.FC<StatsGridProps> = ({ children, className }) => {
  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
      className
    )}>
      {children}
    </div>
  )
}

// Componente para estatísticas em lista
interface StatsListProps {
  children: React.ReactNode
  className?: string
}

export const StatsList: React.FC<StatsListProps> = ({ children, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  )
} 