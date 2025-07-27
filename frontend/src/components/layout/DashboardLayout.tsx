import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { cn } from '@/utils/cn'

interface DashboardLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  variant?: 'default' | 'minimal'
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  showSidebar = true,
  variant = 'default'
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  // Para variante minimal, não mostrar sidebar
  const shouldShowSidebar = showSidebar && variant !== 'minimal'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        onMenuToggle={handleMenuToggle}
        showMenuButton={shouldShowSidebar}
        variant={variant}
      />

      <div className="flex">
        {/* Sidebar */}
        {shouldShowSidebar && (
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={handleSidebarClose}
          />
        )}

        {/* Main content */}
        <main className={cn(
          "flex-1 min-h-screen",
          shouldShowSidebar ? "lg:ml-56" : ""
        )}>
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 