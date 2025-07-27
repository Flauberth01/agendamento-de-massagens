import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { 
  Home,
  Calendar,
  Users,
  Clock,
  Settings,
  BarChart3,
  UserCheck,
  Plus
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user, isAdmin, isAttendant } = useAuth()

  const navigationItems = [
    // Dashboard
    {
      label: 'Dashboard',
      href: isAdmin ? '/admin/dashboard' : isAttendant ? '/attendant/dashboard' : '/dashboard',
      icon: Home,
      show: true
    },
    {
      label: 'Meus Agendamentos',
      href: '/bookings',
      icon: Calendar,
      show: true
    },
    {
      label: 'Novo Agendamento',
      href: '/bookings/create',
      icon: Plus,
      show: true
    },
    // Admin/Atendente only
    {
      label: 'Usuários',
      href: '/users',
      icon: Users,
      show: isAttendant
    },
    {
      label: 'Aprovações',
      href: '/users/pending',
      icon: UserCheck,
      show: isAttendant
    },
    {
      label: 'Cadeiras',
      href: '/chairs',
      icon: Users,
      show: isAdmin
    },
    {
      label: 'Disponibilidade',
      href: '/availability',
      icon: Clock,
      show: isAdmin
    },
    {
      label: 'Relatórios',
      href: '/reports',
      icon: BarChart3,
      show: isAttendant
    },
    {
      label: 'Configurações',
      href: '/settings',
      icon: Settings,
      show: isAdmin
    }
  ]

  const filteredItems = navigationItems.filter(item => item.show)

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">A</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Sistema
              </h2>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <span className="sr-only">Fechar menu</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.role === 'admin' ? 'Administrador' : 
                     user.role === 'atendente' ? 'Atendente' : 'Usuário'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) => cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p>Versão 1.0.0</p>
              <p>Sistema de Agendamento</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
} 