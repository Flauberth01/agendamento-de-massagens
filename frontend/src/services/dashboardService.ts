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

export interface OperationalDashboardStats {
  totalSessionsToday: number
  confirmedSessionsToday: number
  pendingApprovals: number
  totalChairs: number
  activeChairs: number
  attendanceRate: number
  cancellationRate: number
}

export interface Session {
  id: number
  user: {
    name: string
    cpf: string
  }
  chair: {
    name: string
    location: string
  }
  start_time: string
  end_time: string
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido' | 'falta'
}

export interface PendingUser {
  id: number
  name: string
  email: string
  requested_role: string
  created_at: string
}

export interface ChairOccupancy {
  chair_id: number
  chair_name: string
  total_sessions: number
  completed_sessions: number
  cancelled_sessions: number
  no_show_sessions: number
  occupancy_rate: number
}

export interface OperationalDashboardData {
  stats: OperationalDashboardStats
  todaySessions: Session[]
  pendingUsers: PendingUser[]
  chairOccupancy: ChairOccupancy[]
}

export interface RecentActivity {
  id: number
  type: 'booking' | 'user' | 'chair' | 'approval'
  description: string
  timestamp: string
  user?: string
}

export const dashboardService = {
  // Dashboard operacional unificado (para admin e atendente)
  async getOperationalDashboard(): Promise<OperationalDashboardData> {
    const response = await api.get('/api/dashboard/operational')
    return response.data
  },

  // Dashboard do administrador
  async getAdminDashboard(): Promise<{
    stats: DashboardStats
    recentActivity: RecentActivity[]
  }> {
    const response = await api.get('/api/dashboard/admin')
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