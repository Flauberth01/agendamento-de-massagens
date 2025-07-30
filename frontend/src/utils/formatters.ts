import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para formatar CPF
export const formatCPF = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }
};

// Função para formatar telefone
export const formatPhone = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

// Função para limpar formatação do CPF
export const cleanCPF = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Função para limpar formatação do telefone
export const cleanPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Função para validar CPF
export const validateCPF = (cpf: string): boolean => {
  const cleanCpf = cleanCPF(cpf);
  
  if (cleanCpf.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCpf)) {
    return false;
  }

  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;

  // Verifica o primeiro dígito
  if (parseInt(cleanCpf[9]) !== firstDigit) {
    return false;
  }

  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf[i]) * (11 - i);
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;

  // Verifica o segundo dígito
  return parseInt(cleanCpf[10]) === secondDigit;
};

// Função para validar telefone
export const validatePhone = (phone: string): boolean => {
  const cleanPhoneNumber = cleanPhone(phone);
  return cleanPhoneNumber.length >= 10 && cleanPhoneNumber.length <= 11;
};

// Formatação de datas
export const formatDate = (date: Date | string, pattern: string = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern, { locale: ptBR });
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm', { locale: ptBR });
};

export const formatDateInput = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

export const formatTimeInput = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
};

// Formatação de status
export const formatUserStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
  };
  return statusMap[status] || status;
};

export const formatBookingStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    cancelado: 'Cancelado',
    concluido: 'Concluído',
    falta: 'Falta',
  };
  return statusMap[status] || status;
};

export const formatChairStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    ativa: 'Ativa',
    inativa: 'Inativa',
  };
  return statusMap[status] || status;
};

export const formatUserRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    usuario: 'Usuário',
    atendente: 'Atendente',
    admin: 'Administrador',
  };
  return roleMap[role] || role;
};

export const formatGender = (gender: string): string => {
  const genderMap: Record<string, string> = {
    masculino: 'Masculino',
    feminino: 'Feminino',
    outro: 'Outro',
  };
  return genderMap[gender] || gender;
};

// Formatação de dia da semana
export const formatDayOfWeek = (day: number): string => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[day] || 'Inválido';
};

// Formatação de moeda
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Formatação de porcentagem
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Formatação de duração
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}min`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}min`;
};

// Formatação de texto
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Formatação de nome para avatar
export const formatName = (name: string): string => {
  if (!name) return '';
  
  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}; 

// Formatação de tempo restante até agendamento
export const formatTimeUntilBooking = (bookingTime: Date | string): string => {
  const now = new Date()
  const bookingDate = typeof bookingTime === 'string' ? new Date(bookingTime) : bookingTime
  const diffInMs = bookingDate.getTime() - now.getTime()
  
  if (diffInMs <= 0) {
    return 'Agendamento já passou'
  }
  
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const remainingMinutes = diffInMinutes % 60
  
  if (diffInHours > 0) {
    if (remainingMinutes > 0) {
      return `Faltam ${diffInHours}h${remainingMinutes}min`
    } else {
      return `Faltam ${diffInHours}h`
    }
  } else {
    return `Faltam ${diffInMinutes}min`
  }
}

// Verificar se pode cancelar agendamento (até 3 horas antes)
export const canCancelBooking = (bookingTime: Date | string, status: string): boolean => {
  if (status !== 'agendado') return false
  
  const now = new Date()
  const bookingDate = typeof bookingTime === 'string' ? new Date(bookingTime) : bookingTime
  const threeHoursBefore = new Date(bookingDate.getTime() - 3 * 60 * 60 * 1000)
  
  return now < threeHoursBefore
}

// Obter tempo restante em minutos
export const getTimeUntilBookingInMinutes = (bookingTime: Date | string): number => {
  const now = new Date()
  const bookingDate = typeof bookingTime === 'string' ? new Date(bookingTime) : bookingTime
  const diffInMs = bookingDate.getTime() - now.getTime()
  
  return Math.floor(diffInMs / (1000 * 60))
} 