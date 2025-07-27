import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { cn } from '@/utils/cn'

interface DashboardLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  showSidebar = true 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        onMenuToggle={handleMenuToggle}
        showMenuButton={showSidebar}
      />

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={handleSidebarClose}
          />
        )}

        {/* Main content */}
        <main className={cn(
          "flex-1 min-h-screen",
          showSidebar ? "lg:ml-56" : ""
        )}>
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 