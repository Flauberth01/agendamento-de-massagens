export type UserRole = 'usuario' | 'atendente' | 'admin';
export type UserStatus = 'pendente' | 'aprovado' | 'reprovado';
export type UserGender = 'masculino' | 'feminino' | 'outro';

export interface User {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password?: string; // Não retornado na API
  role: UserRole;
  requested_role: UserRole;
  status: UserStatus;
  function: string;
  position: string;
  registration: string;
  sector: string;
  gender: UserGender;
  birth_date?: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
  last_login?: string | Date;
  bookings?: any[]; // Usar any para evitar dependência circular
}

// DTOs para criação e atualização
export interface CreateUserRequest {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  requested_role: UserRole;
  function: string;
  position: string;
  registration: string;
  sector: string;
  gender: UserGender;
  birth_date?: Date;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  function?: string;
  position?: string;
  registration?: string;
  sector?: string;
  gender?: UserGender;
  birth_date?: Date;
}

export interface CreateUserResponse {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  requested_role: UserRole;
}

// Tipos para formulários
export interface LoginForm {
  cpf: string;
  password: string;
}

export interface RegisterStep1Form {
  name: string;
  cpf: string;
  function: string;
  position: string;
  registration: string;
  sector: string;
  email: string;
}

export interface RegisterStep2Form {
  phone: string;
  gender: UserGender;
  birth_date: Date;
  requested_role: UserRole;
  password: string;
  confirm_password: string;
}

// Tipos para autenticação
export interface AuthResponse {
  token: string;
  user: User;
  expires_at: Date;
}

export interface RefreshTokenResponse {
  token: string;
  expires_at: Date;
}

// Tipos para aprovação
export interface UserApprovalRequest {
  status: 'aprovado' | 'reprovado';
  notes?: string;
}

// Tipo para rejeição
export interface UserRejectionRequest {
  status: 'reprovado';
  reason?: string;
  notes?: string;
}

// Tipo para resposta de lista de usuários
export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 