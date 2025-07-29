export type BookingStatus = 'agendado' | 'cancelado' | 'realizado' | 'falta';

export interface Booking {
  id: number;
  user_id: number;
  chair_id: number;
  start_time: Date;
  end_time: Date;
  status: BookingStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  user?: any; // Usar any para evitar dependência circular
  chair?: any; // Usar any para evitar dependência circular
}

// DTOs para criação e atualização
export interface CreateBookingRequest {
  chair_id: number;
  start_time: Date;
  notes?: string;
}

export interface UpdateBookingRequest {
  start_time?: Date;
  notes?: string;
}

export interface RescheduleBookingRequest {
  start_time: Date;
  chair_id?: number;
}

// Tipos para agendamento
export interface TimeSlot {
  start_time: Date;
  end_time: Date;
  available: boolean;
  booking_id?: number;
}

export interface BookingSummary {
  booking: Booking;
  user: any; // Usar any para evitar dependência circular
  chair: any; // Usar any para evitar dependência circular
  can_cancel: boolean;
  can_reschedule: boolean;
}

// Tipos para filtros
export interface BookingFilters {
  user_id?: number;
  chair_id?: number;
  date?: Date;
  status?: BookingStatus;
  start_date?: Date;
  end_date?: Date;
}

// Tipos para estatísticas
export interface BookingStats {
  total: number;
  today: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  no_show: number;
}

// Tipos para dashboard
export interface TodayBookings {
  confirmed: Booking[];
  pending: Booking[];
  completed: Booking[];
  cancelled: Booking[];
}

// Tipo para resposta de lista de agendamentos
export interface BookingListResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 