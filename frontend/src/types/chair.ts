export type ChairStatus = 'ativa' | 'inativa';

export interface Chair {
  id: number;
  name: string;
  description?: string;
  location: string;
  status: ChairStatus;
  created_at: Date;
  updated_at: Date;
  bookings?: any[]; // Usar any para evitar dependência circular
  availabilities?: any[]; // Usar any para evitar dependência circular
}

// DTOs para criação e atualização
export interface CreateChairRequest {
  name: string;
  description?: string;
  location: string;
  status?: ChairStatus;
}

export interface UpdateChairRequest {
  name?: string;
  description?: string;
  location?: string;
  status?: ChairStatus;
}

// Tipos para estatísticas
export interface ChairStats {
  total: number;
  active: number;
  inactive: number;
  total_bookings: number;
  today_bookings: number;
}

export interface ChairOccupancy {
  chair_id: number;
  chair_name: string;
  total_slots: number;
  occupied_slots: number;
  occupancy_rate: number;
  today_bookings: any[]; // Usar any para evitar dependência circular
}

// Tipo para resposta de lista de cadeiras
export interface ChairListResponse {
  chairs: Chair[];
  total: number;
  limit: number;
  offset: number;
} 