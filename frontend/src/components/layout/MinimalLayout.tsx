import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { 
  LogOut, 
  Menu,
  Home,
  Calendar,
  Plus,
  Users,
  UserCheck,
  Clock
} from 'lucide-react'
import { formatName } from '@/utils/formatters'

interface MinimalLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export const MinimalLayout: React.FC<MinimalLayoutProps> = ({ 
  children, 
  showSidebar = true 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, isLoggingOut, isAdmin, isAttendant } = useAuth()
  const location = useLocation()

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    logout()
  }

  const navigationItems = [
    {
      label: 'Dashboard',
      href: isAdmin ? '/dashboard/operational' : isAttendant ? '/dashboard/operational' : '/dashboard',
      icon: Home,
      show: true
    },
    {
      label: 'Gerenciamento de Sessões',
      href: '/bookings',
      icon: Calendar,
      show: true
    },

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
      label: 'Horários',
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
    
    // Para outras rotas, usa a lógica padrão
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {showSidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMenuToggle}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            
            <h1 className="text-sm font-medium text-gray-900">
              Agendamento
            </h1>
          </div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-8">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {formatName(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-gray-900">
                    {user.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <>
            {/* Overlay para mobile */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={handleSidebarClose}
              />
            )}

            <aside className={cn(
              "fixed left-0 top-0 z-50 h-full w-48 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
              <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                {filteredItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isLinkActive(item.href)
                  
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={handleSidebarClose}
                      className={cn(
                        "flex items-center space-x-2 px-2 py-1.5 rounded text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className={cn(
          "flex-1 min-h-screen",
          showSidebar ? "lg:ml-48" : ""
        )}>
          <div className="p-3 lg:p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 