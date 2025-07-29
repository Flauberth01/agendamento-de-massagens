# Documentação do Frontend

Esta documentação descreve a estrutura, componentes e funcionalidades do frontend do Sistema de Agendamento.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias](#tecnologias)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Componentes](#componentes)
5. [Páginas](#páginas)
6. [Estado Global](#estado-global)
7. [Roteamento](#roteamento)
8. [API Integration](#api-integration)
9. [Estilização](#estilização)
10. [Testes](#testes)

## 🌐 Visão Geral

O frontend é uma aplicação React/TypeScript que fornece uma interface moderna e responsiva para o Sistema de Agendamento.

### Características Principais

- **Interface Responsiva**: Adaptável para desktop, tablet e mobile
- **Design Moderno**: UI/UX intuitiva e acessível
- **Performance Otimizada**: Lazy loading e code splitting
- **Acessibilidade**: WCAG 2.1 compliant
- **PWA Ready**: Progressive Web App capabilities

## 🚀 Tecnologias

### Core
- **React 18**: Framework principal
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e dev server

### UI/UX
- **Tailwind CSS**: Framework CSS utilitário
- **Headless UI**: Componentes acessíveis
- **React Hook Form**: Gerenciamento de formulários
- **React Query**: Cache e sincronização de dados

### Estado e Roteamento
- **Zustand**: Gerenciamento de estado
- **React Router**: Roteamento client-side
- **Axios**: Cliente HTTP

### Desenvolvimento
- **ESLint**: Linting de código
- **Prettier**: Formatação de código
- **Vitest**: Framework de testes
- **Testing Library**: Testes de componentes

## 📁 Estrutura do Projeto

```
frontend/
├── public/                 # Arquivos estáticos
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/            # Componentes base
│   │   ├── forms/         # Componentes de formulário
│   │   ├── layout/        # Componentes de layout
│   │   └── common/        # Componentes comuns
│   ├── pages/             # Páginas da aplicação
│   │   ├── auth/          # Páginas de autenticação
│   │   ├── dashboard/     # Dashboard
│   │   ├── appointments/  # Gestão de consultas
│   │   ├── patients/      # Gestão de pacientes
│   │   └── professionals/ # Gestão de profissionais
│   ├── hooks/             # Custom hooks
│   ├── services/          # Serviços de API
│   ├── stores/            # Estado global (Zustand)
│   ├── types/             # Definições de tipos
│   ├── utils/             # Utilitários
│   ├── styles/            # Estilos globais
│   ├── App.tsx            # Componente raiz
│   ├── main.tsx           # Ponto de entrada
│   └── router.tsx         # Configuração de rotas
├── tests/                 # Testes
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🧩 Componentes

### Componentes Base (UI)

#### Button
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

<Button variant="primary" size="md" onClick={handleClick}>
  Salvar
</Button>
```

#### Input
```tsx
interface InputProps {
  label?: string;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  error={errors.email}
  value={email}
  onChange={setEmail}
/>
```

#### Modal
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

<Modal isOpen={isModalOpen} onClose={closeModal} title="Nova Consulta">
  <AppointmentForm onSubmit={handleSubmit} />
</Modal>
```

### Componentes de Formulário

#### AppointmentForm
```tsx
interface AppointmentFormProps {
  initialData?: Appointment;
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
}

<AppointmentForm
  initialData={appointment}
  onSubmit={handleSubmit}
  onCancel={closeModal}
/>
```

#### PatientForm
```tsx
interface PatientFormProps {
  mode: 'create' | 'edit';
  initialData?: Patient;
  onSubmit: (data: PatientFormData) => void;
}

<PatientForm
  mode="create"
  onSubmit={handleSubmit}
/>
```

### Componentes de Layout

#### Sidebar
```tsx
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

<Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} user={user} />
```

#### Header
```tsx
interface HeaderProps {
  user: User;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

<Header user={user} onLogout={handleLogout} onToggleSidebar={toggleSidebar} />
```

## 📄 Páginas

### Autenticação

#### Login
- **Rota**: `/login`
- **Funcionalidades**:
  - Formulário de login
  - Validação de campos
  - Redirecionamento após login
  - Lembrar credenciais

#### Register
- **Rota**: `/register`
- **Funcionalidades**:
  - Formulário de registro
  - Validação de dados
  - Seleção de perfil

### Dashboard

#### Dashboard Principal
- **Rota**: `/dashboard`
- **Funcionalidades**:
  - Resumo de consultas
  - Gráficos de estatísticas
  - Ações rápidas
  - Notificações

### Consultas

#### Lista de Consultas
- **Rota**: `/appointments`
- **Funcionalidades**:
  - Lista paginada
  - Filtros avançados
  - Busca
  - Ações em lote

#### Nova Consulta
- **Rota**: `/appointments/new`
- **Funcionalidades**:
  - Formulário completo
  - Seleção de profissional
  - Verificação de disponibilidade
  - Validação de horários

#### Detalhes da Consulta
- **Rota**: `/appointments/:id`
- **Funcionalidades**:
  - Informações detalhadas
  - Histórico de alterações
  - Ações (editar, cancelar, reagendar)

### Pacientes

#### Lista de Pacientes
- **Rota**: `/patients`
- **Funcionalidades**:
  - Lista com paginação
  - Busca e filtros
  - Exportação de dados
  - Ações em lote

#### Cadastro de Paciente
- **Rota**: `/patients/new`
- **Funcionalidades**:
  - Formulário completo
  - Validação de CPF
  - Upload de documentos
  - Histórico médico

#### Perfil do Paciente
- **Rota**: `/patients/:id`
- **Funcionalidades**:
  - Informações pessoais
  - Histórico de consultas
  - Documentos
  - Observações médicas

### Profissionais

#### Lista de Profissionais
- **Rota**: `/professionals`
- **Funcionalidades**:
  - Lista com filtros
  - Busca por especialidade
  - Status ativo/inativo
  - Agenda de cada profissional

#### Cadastro de Profissional
- **Rota**: `/professionals/new`
- **Funcionalidades**:
  - Formulário completo
  - Seleção de especialidade
  - Configuração de agenda
  - Upload de documentos

## 🗂️ Estado Global

### Auth Store
```tsx
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  }
}));
```

### Appointments Store
```tsx
interface AppointmentsStore {
  appointments: Appointment[];
  isLoading: boolean;
  filters: AppointmentFilters;
  
  fetchAppointments: () => Promise<void>;
  createAppointment: (data: AppointmentFormData) => Promise<void>;
  updateAppointment: (id: number, data: AppointmentFormData) => Promise<void>;
  deleteAppointment: (id: number) => Promise<void>;
  setFilters: (filters: AppointmentFilters) => void;
}
```

### Patients Store
```tsx
interface PatientsStore {
  patients: Patient[];
  isLoading: boolean;
  filters: PatientFilters;
  
  fetchPatients: () => Promise<void>;
  createPatient: (data: PatientFormData) => Promise<void>;
  updatePatient: (id: number, data: PatientFormData) => Promise<void>;
  deletePatient: (id: number) => Promise<void>;
  setFilters: (filters: PatientFilters) => void;
}
```

## 🛣️ Roteamento

### Configuração de Rotas
```tsx
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />
      },
      {
        path: '/appointments',
        children: [
          { index: true, element: <AppointmentsList /> },
          { path: 'new', element: <NewAppointment /> },
          { path: ':id', element: <AppointmentDetails /> },
          { path: ':id/edit', element: <EditAppointment /> }
        ]
      },
      {
        path: '/patients',
        children: [
          { index: true, element: <PatientsList /> },
          { path: 'new', element: <NewPatient /> },
          { path: ':id', element: <PatientDetails /> },
          { path: ':id/edit', element: <EditPatient /> }
        ]
      },
      {
        path: '/professionals',
        children: [
          { index: true, element: <ProfessionalsList /> },
          { path: 'new', element: <NewProfessional /> },
          { path: ':id', element: <ProfessionalDetails /> },
          { path: ':id/edit', element: <EditProfessional /> }
        ]
      }
    ]
  },
  {
    path: '/auth',
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> }
    ]
  }
]);
```

### Proteção de Rotas
```tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
};
```

## 🔌 API Integration

### Configuração do Axios
```tsx
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

### Serviços de API
```tsx
// appointments.service.ts
export const appointmentsService = {
  getAll: (params?: AppointmentFilters) => 
    api.get('/appointments', { params }),
  
  getById: (id: number) => 
    api.get(`/appointments/${id}`),
  
  create: (data: AppointmentFormData) => 
    api.post('/appointments', data),
  
  update: (id: number, data: AppointmentFormData) => 
    api.put(`/appointments/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/appointments/${id}`),
  
  cancel: (id: number) => 
    api.post(`/appointments/${id}/cancel`),
  
  reschedule: (id: number, data: RescheduleData) => 
    api.post(`/appointments/${id}/reschedule`, data)
};
```

### React Query Integration
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Hook para buscar consultas
export const useAppointments = (filters?: AppointmentFilters) => {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => appointmentsService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para criar consulta
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: appointmentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Consulta criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar consulta');
    }
  });
};
```

## 🎨 Estilização

### Tailwind CSS Configuration
```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ]
};
```

### Componentes Estilizados
```tsx
// components/ui/Button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## 🧪 Testes

### Configuração de Testes
```tsx
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

### Exemplo de Teste de Componente
```tsx
// components/AppointmentForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppointmentForm } from './AppointmentForm';

describe('AppointmentForm', () => {
  it('should render form fields', () => {
    render(<AppointmentForm onSubmit={jest.fn()} onCancel={jest.fn()} />);
    
    expect(screen.getByLabelText(/paciente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/profissional/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/horário/i)).toBeInTheDocument();
  });
  
  it('should call onSubmit when form is submitted', async () => {
    const mockSubmit = jest.fn();
    render(<AppointmentForm onSubmit={mockSubmit} onCancel={jest.fn()} />);
    
    fireEvent.click(screen.getByText(/salvar/i));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });
});
```

### Teste de Hook
```tsx
// hooks/useAppointments.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppointments } from './useAppointments';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAppointments', () => {
  it('should fetch appointments', async () => {
    const { result } = renderHook(() => useAppointments(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

## 📱 Responsividade

### Breakpoints
```css
/* Tailwind breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

### Componentes Responsivos
```tsx
const ResponsiveLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar - oculto em mobile */}
      <aside className="hidden lg:block w-64">
        <Sidebar />
      </aside>
      
      {/* Conteúdo principal */}
      <main className="flex-1 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
```

## ♿ Acessibilidade

### ARIA Labels
```tsx
<button
  aria-label="Fechar modal"
  aria-describedby="modal-description"
  onClick={onClose}
>
  <XIcon className="w-5 h-5" />
</button>
```

### Navegação por Teclado
```tsx
const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);
  
  return (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  );
};
```

## 🚀 Performance

### Lazy Loading
```tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Appointments = lazy(() => import('./pages/Appointments'));

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
      </Routes>
    </Suspense>
  );
};
```

### Memoização
```tsx
const ExpensiveComponent = memo(({ data }: { data: ComplexData }) => {
  const processedData = useMemo(() => {
    return processComplexData(data);
  }, [data]);
  
  return <div>{processedData}</div>;
});
```

## 📦 Build e Deploy

### Scripts de Build
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix"
  }
}
```

### Variáveis de Ambiente
```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Sistema de Agendamento
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

## 📞 Suporte

Para dúvidas sobre o frontend:
- Consulte a documentação dos componentes
- Verifique os testes para exemplos de uso
- Abra uma issue no GitHub
- Entre em contato: [seu-email@exemplo.com]