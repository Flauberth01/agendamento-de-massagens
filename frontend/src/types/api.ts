// Tipos base para respostas da API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Tipos para dashboard
export interface DashboardStats {
  total_users: number;
  total_chairs: number;
  total_bookings: number;
  today_bookings: number;
  pending_approvals: number;
  active_chairs: number;
}

export interface AttendantDashboard {
  today_sessions: number;
  confirmed_sessions: number;
  pending_sessions: number;
  pending_approvals: number;
  today_bookings: any[]; // Usar any para evitar dependência circular
  pending_users: any[]; // Usar any para evitar dependência circular
  chair_occupancy: any[]; // Usar any para evitar dependência circular
}

export interface AdminDashboard extends AttendantDashboard {
  system_stats: DashboardStats;
  all_chairs: any[]; // Usar any para evitar dependência circular
  all_users: any[]; // Usar any para evitar dependência circular
}

// Tipos para filtros e consultas
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UserQueryParams extends QueryParams {
  status?: string;
  role?: string;
  sector?: string;
}

export interface BookingQueryParams extends QueryParams {
  user_id?: number;
  chair_id?: number;
  date?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

// Tipos para notificações
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Tipos para formulários
export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormError[];
  isSubmitting: boolean;
  isValid: boolean;
} 