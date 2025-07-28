import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { 
  Home,
  Calendar,
  Plus,
  Users,
  UserCheck,
  Clock
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { isAdmin, isAttendant } = useAuth()
  const location = useLocation()

  const navigationItems = [
    // Dashboard
    {
      label: 'Dashboard',
      href: isAdmin ? '/admin/dashboard' : isAttendant ? '/attendant/dashboard' : '/dashboard',
      icon: Home,
      show: true
    },
    // Usuário específico
    {
      label: 'Agendar Sessão',
      href: '/users/booking',
      icon: Calendar,
      show: !isAttendant && !isAdmin
    },
    {
      label: 'Gerenciamento de Sessões',
      href: '/bookings',
      icon: Calendar,
      show: isAttendant || isAdmin
    },
    {
      label: 'Novo Agendamento',
      href: '/bookings/create',
      icon: Plus,
      show: isAttendant || isAdmin
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
    }
  ]

  const filteredItems = navigationItems.filter(item => item.show)

  // Função para verificar se o link está ativo
  const isLinkActive = (href: string) => {
    // Rotas que devem ter ativação exata (não sub-rotas)
    const exactRoutes = [
      '/bookings',
      '/bookings/create',
      '/users',
      '/users/pending'
    ]
    
    if (exactRoutes.includes(href)) {
      return location.pathname === href
    }
    
    // Para outras rotas, usa a lógica padrão do NavLink
    return location.pathname.startsWith(href)
  }

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
        "fixed left-0 top-0 z-50 h-full w-56 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {filteredItems.map((item) => {
              const Icon = item.icon
              const isActive = isLinkActive(item.href)
              
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
} 