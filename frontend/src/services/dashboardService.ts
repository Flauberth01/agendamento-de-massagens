import { api } from './api'

export interface DashboardStats {
  totalUsers: number
  totalChairs: number
  totalBookings: number
  activeBookings: number
  pendingApprovals: number
  todaySessions: number
  monthlyGrowth: number
}

export interface RecentActivity {
  id: number
  type: 'booking' | 'user' | 'chair' | 'approval'
  description: string
  timestamp: string
  user?: string
}

export interface AttendantDashboardData {
  todaySessions: number
  confirmedSessions: number
  pendingSessions: number
  pendingApprovals: number
  todayBookings: any[]
  pendingUsers: any[]
  chairOccupancy: any[]
}

export const dashboardService = {
  // Dashboard do administrador
  async getAdminDashboard(): Promise<{
    stats: DashboardStats
    recentActivity: RecentActivity[]
  }> {
    const response = await api.get('/api/dashboard/admin')
    return response.data
  },

  // Dashboard do atendente
  async getAttendantDashboard(): Promise<AttendantDashboardData> {
    const response = await api.get('/api/dashboard/attendant')
    return response.data
  },

  // Sessões por data
  async getSessionsByDate(date: string): Promise<any[]> {
    const response = await api.get(`/api/dashboard/sessions/date/${date}`)
    return response.data
  },

  // Ocupação das cadeiras
  async getChairOccupancy(): Promise<any[]> {
    const response = await api.get('/api/dashboard/chairs/occupancy')
    return response.data
  },

  // Estatísticas de comparecimento
  async getAttendanceStats(): Promise<any> {
    const response = await api.get('/api/dashboard/stats/attendance')
    return response.data
  },

  // Aprovações pendentes
  async getPendingApprovals(): Promise<any[]> {
    const response = await api.get('/api/dashboard/pending-approvals')
    return response.data
  },

  // Enviar lembretes de teste
  async sendTestReminders(): Promise<void> {
    await api.post('/api/dashboard/test-reminders')
  }
} 