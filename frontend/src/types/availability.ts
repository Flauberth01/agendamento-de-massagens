export interface AvailabilityTimeSlot {
  startTime: Date;
  endTime: Date;
  chair_id: number;
  available: boolean;
  booking_id?: number;
}

export interface Availability {
  id: number;
  chair_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  valid_from?: Date;
  valid_to?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PaginatedAvailabilitiesResponse {
  data: Availability[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    page: number;
  };
}

export interface CreateAvailabilityRequest {
  chair_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  valid_from?: string;
  valid_to?: string;
  is_active?: boolean;
}

export interface UpdateAvailabilityRequest {
  chair_id?: number;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  valid_from?: string;
  valid_to?: string;
  is_active?: boolean;
}

export interface AvailabilityFilters {
  chair_id?: number;
  date?: Date;
  start_date?: Date;
  end_date?: Date;
  available?: boolean;
}

export interface AvailabilityStats {
  total_slots: number;
  available_slots: number;
  occupied_slots: number;
  availability_rate: number;
}

export interface DailyAvailability {
  date: Date;
  time_slots: AvailabilityTimeSlot[];
}

export interface ChairAvailability {
  chair_id: number;
  chair_name: string;
  daily_availabilities: DailyAvailability[];
} 