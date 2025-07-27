import { z } from 'zod';

// Schema para CPF
const cpfSchema = z
  .string()
  .min(11, 'CPF deve ter 11 dígitos')
  .max(14, 'CPF deve ter no máximo 14 caracteres')
  .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido');

// Schema para telefone
const phoneSchema = z
  .string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone deve ter no máximo 15 caracteres')
  .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999');

// Schema para login
export const loginSchema = z.object({
  cpf: cpfSchema,
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Schema para registro - Etapa 1
export const registerStep1Schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(60, 'Nome deve ter no máximo 60 caracteres'),
  cpf: cpfSchema,
  function: z.string().min(1, 'Função é obrigatória'),
  position: z.string().min(1, 'Cargo é obrigatório'),
  registration: z.string().min(1, 'Matrícula é obrigatória'),
  sector: z.string().min(1, 'Setor é obrigatório'),
  email: z.string().email('Email inválido'),
});

// Schema para registro - Etapa 2
export const registerStep2Schema = z.object({
  phone: phoneSchema,
  gender: z.enum(['masculino', 'feminino', 'outro']),
  birth_date: z.date(),
  requested_role: z.enum(['usuario', 'atendente', 'admin']),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Senhas não coincidem',
  path: ['confirm_password'],
});

// Schema para criação de agendamento
export const createBookingSchema = z.object({
  chair_id: z.number().min(1, 'Selecione uma cadeira'),
  start_time: z.date(),
  notes: z.string().optional(),
});

// Schema para criação de cadeira
export const createChairSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  location: z.string().min(2, 'Localização deve ter pelo menos 2 caracteres').max(100, 'Localização deve ter no máximo 100 caracteres'),
  status: z.enum(['ativa', 'inativa']),
});

// Schema para criação de disponibilidade
export const createAvailabilitySchema = z.object({
  chair_id: z.number().min(1, 'Selecione uma cadeira'),
  day_of_week: z.number().min(0).max(6, 'Dia da semana inválido'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM'),
  valid_from: z.date().optional(),
  valid_to: z.date().optional(),
  is_active: z.boolean().default(true),
}).refine((data) => {
  const start = data.start_time;
  const end = data.end_time;
  return start < end;
}, {
  message: 'Horário de fim deve ser posterior ao horário de início',
  path: ['end_time'],
});

// Schema para atualização de usuário
export const updateUserSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  email: z.string().email().optional(),
  phone: phoneSchema.optional(),
  function: z.string().optional(),
  position: z.string().optional(),
  registration: z.string().optional(),
  sector: z.string().optional(),
  gender: z.enum(['masculino', 'feminino', 'outro']).optional(),
  birth_date: z.date().optional(),
});

// Schema para criação de usuário (admin)
export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(60, 'Nome deve ter no máximo 60 caracteres'),
  cpf: cpfSchema,
  email: z.string().email('Email inválido'),
  phone: phoneSchema,
  function: z.string().min(1, 'Função é obrigatória'),
  position: z.string().min(1, 'Cargo é obrigatório'),
  registration: z.string().min(1, 'Matrícula é obrigatória'),
  sector: z.string().min(1, 'Setor é obrigatório'),
  gender: z.enum(['masculino', 'feminino', 'outro']),
  birth_date: z.date(),
  role: z.enum(['usuario', 'atendente', 'admin']),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirm_password: z.string(),
  status: z.enum(['pendente', 'aprovado', 'reprovado']),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Senhas não coincidem',
  path: ['confirm_password'],
});

// Schema para aprovação de usuário
export const userApprovalSchema = z.object({
  status: z.enum(['aprovado', 'reprovado']),
  notes: z.string().optional(),
});

// Tipos inferidos dos schemas
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterStep1Form = z.infer<typeof registerStep1Schema>;
export type RegisterStep2Form = z.infer<typeof registerStep2Schema>;
export type CreateBookingForm = z.infer<typeof createBookingSchema>;
export type CreateChairForm = z.infer<typeof createChairSchema>;
export type CreateAvailabilityForm = z.infer<typeof createAvailabilitySchema>;
export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;
export type UserApprovalForm = z.infer<typeof userApprovalSchema>; 