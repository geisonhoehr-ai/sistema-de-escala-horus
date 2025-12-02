import {
  Military,
  Scale,
  User,
  Unavailability,
  UnavailabilityTypeDefinition,
  Notification,
  Configuration,
} from '@/types'

export const mockUnavailabilityTypes: UnavailabilityTypeDefinition[] = [
  { id: 'type-1', name: 'Férias', description: 'Férias regulamentares' },
  {
    id: 'type-2',
    name: 'Dispensa Médica',
    description: 'Afastamento por motivo de saúde',
  },
  { id: 'type-3', name: 'Missão', description: 'Em missão oficial' },
]

export const mockMilitary: Military[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    rank: 'Capitão',
    unit: '1º Batalhão',
    status: 'Active',
    email: 'carlos.silva@exemplo.com',
    phone: '(11) 99999-1111',
    associatedScales: ['scale-1'],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=1',
  },
  {
    id: '2',
    name: 'Ana Souza',
    rank: 'Tenente',
    unit: 'Comando Geral',
    status: 'Active',
    email: 'ana.souza@exemplo.com',
    phone: '(11) 99999-2222',
    associatedScales: ['scale-1'],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=female&seed=2',
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    rank: 'Sargento',
    unit: 'Logística',
    status: 'Active',
    email: 'pedro.oliveira@exemplo.com',
    phone: '(11) 99999-3333',
    associatedScales: ['scale-1'],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=3',
  },
]

export const mockScales: Scale[] = [
  {
    id: 'scale-1',
    name: 'Escala Oficial de Dia',
    description: 'Escala diária para oficiais de dia ao regimento.',
    associatedMilitaryIds: ['1', '2', '3'],
    services: [],
    reservations: [],
  },
]

export const mockUnavailabilities: Unavailability[] = [
  {
    id: 'u1',
    militaryId: '1',
    unavailabilityTypeId: 'type-1',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    reasonDetails: 'Férias anuais',
  },
]

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    message: 'Escala de Dezembro publicada',
    type: 'info',
    read: false,
    createdAt: new Date(),
  },
  {
    id: 'n2',
    message: 'Conflito de escala detectado para Ten. Ana',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 86400000),
  },
]

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@sistema.com',
    role: 'Admin',
    avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=male',
  },
]

export const mockConfigurations: Configuration[] = [
  {
    id: 'conf-1',
    key: 'MAX_CONSECUTIVE_SERVICES',
    value: '2',
    description: 'Maximum number of consecutive services allowed',
  },
]
