// Configurações da aplicação
export const APP_CONFIG = {
  name: 'Sistema de Agendamento',
  version: '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
} as const;

// Roles de usuário
export const USER_ROLES = {
  USUARIO: 'usuario',
  ATENDENTE: 'atendente',
  ADMIN: 'admin',
} as const;

// Status de usuário
export const USER_STATUS = {
  PENDENTE: 'pendente',
  APROVADO: 'aprovado',
  REPROVADO: 'reprovado',
} as const;

// Status de agendamento
export const BOOKING_STATUS = {
  AGENDADO: 'agendado',
  CONFIRMADO: 'confirmado',
  CANCELADO: 'cancelado',
  CONCLUIDO: 'concluido',
  FALTA: 'falta',
} as const;

// Status de cadeira
export const CHAIR_STATUS = {
  ATIVA: 'ativa',
  INATIVA: 'inativa',
} as const;

// Gêneros
export const GENDERS = {
  MASCULINO: 'masculino',
  FEMININO: 'feminino',
  OUTRO: 'outro',
} as const;

// Dias da semana
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
] as const;

// Configurações de agendamento
export const BOOKING_CONFIG = {
  SESSION_DURATION_MINUTES: 30,
  MIN_CANCEL_HOURS: 3,
  MAX_ACTIVE_BOOKINGS: 1,
} as const;

// Configurações de paginação
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

// Configurações de validação
export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 60,
  MAX_DESCRIPTION_LENGTH: 255,
  MAX_NOTES_LENGTH: 500,
} as const;

// Configurações de tempo
export const TIME_CONFIG = {
  TOKEN_EXPIRY_HOURS: 24,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
  SESSION_TIMEOUT_MINUTES: 30,
} as const;

// Configurações de notificações
export const NOTIFICATION_CONFIG = {
  SUCCESS_DURATION: 5000,
  ERROR_DURATION: 8000,
  WARNING_DURATION: 6000,
  INFO_DURATION: 4000,
} as const;

// Configurações de cores para status
export const STATUS_COLORS = {
  [BOOKING_STATUS.AGENDADO]: 'bg-blue-100 text-blue-800',
  [BOOKING_STATUS.CONFIRMADO]: 'bg-green-100 text-green-800',
  [BOOKING_STATUS.CANCELADO]: 'bg-red-100 text-red-800',
  [BOOKING_STATUS.CONCLUIDO]: 'bg-purple-100 text-purple-800',
  [BOOKING_STATUS.FALTA]: 'bg-orange-100 text-orange-800',
  [USER_STATUS.PENDENTE]: 'bg-yellow-100 text-yellow-800',
  [USER_STATUS.APROVADO]: 'bg-green-100 text-green-800',
  [USER_STATUS.REPROVADO]: 'bg-red-100 text-red-800',
  [CHAIR_STATUS.ATIVA]: 'bg-green-100 text-green-800',
  [CHAIR_STATUS.INATIVA]: 'bg-gray-100 text-gray-800',
} as const;

// Configurações de ícones para status
export const STATUS_ICONS = {
  [BOOKING_STATUS.AGENDADO]: 'calendar',
  [BOOKING_STATUS.CONFIRMADO]: 'check-circle',
  [BOOKING_STATUS.CANCELADO]: 'x-circle',
  [BOOKING_STATUS.CONCLUIDO]: 'check-square',
  [BOOKING_STATUS.FALTA]: 'alert-circle',
  [USER_STATUS.PENDENTE]: 'clock',
  [USER_STATUS.APROVADO]: 'check-circle',
  [USER_STATUS.REPROVADO]: 'x-circle',
  [CHAIR_STATUS.ATIVA]: 'check-circle',
  [CHAIR_STATUS.INATIVA]: 'x-circle',
} as const;

// Configurações de rotas
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_STEP2: '/register/step2',
  DASHBOARD: '/dashboard',
  BOOKINGS: '/bookings',
  USERS: '/users',
  CHAIRS: '/chairs',
  AVAILABILITY: '/availability',
  PROFILE: '/profile',
} as const;

// Configurações de permissões
export const PERMISSIONS = {
  MANAGE_USERS: [USER_ROLES.ATENDENTE, USER_ROLES.ADMIN],
  MANAGE_CHAIRS: [USER_ROLES.ADMIN],
  MANAGE_AVAILABILITY: [USER_ROLES.ADMIN],
  APPROVE_ATTENDANTS: [USER_ROLES.ADMIN],
  VIEW_ALL_BOOKINGS: [USER_ROLES.ATENDENTE, USER_ROLES.ADMIN],
  MANAGE_BOOKINGS: [USER_ROLES.ATENDENTE, USER_ROLES.ADMIN],
} as const; 