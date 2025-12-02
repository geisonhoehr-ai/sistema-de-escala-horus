import {
  Military,
  Scale,
  User,
  Unavailability,
  Notification,
  UnavailabilityTypeDefinition,
} from '@/types'
import { addDays, subDays } from 'date-fns'

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Admin Sargento Silva',
    email: 'admin@escala.mil',
    password: 'admin',
    role: 'Admin',
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=1',
    associatedScales: ['scale-1', 'scale-2'],
  },
  {
    id: 'user-2',
    name: 'Cabo João',
    email: 'joao@escala.mil',
    password: 'user123',
    role: 'Militar',
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=2',
    associatedScales: ['scale-1'],
  },
  {
    id: 'user-admin-horus',
    name: 'Admin Horus',
    email: 'admin@horus.com',
    password: '123456',
    role: 'Admin',
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=99',
    associatedScales: [],
  },
]

export const mockMilitary: Military[] = [
  {
    id: 'mil-1',
    name: 'Sargento Silva',
    rank: 'Sargento',
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=1',
    email: 'silva@escala.mil',
    phone: '(11) 98765-4321',
    associatedScales: ['scale-1', 'scale-2'],
  },
  {
    id: 'mil-2',
    name: 'Cabo João',
    rank: 'Cabo',
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=2',
    email: 'joao@escala.mil',
    phone: '(21) 91234-5678',
    associatedScales: ['scale-1'],
  },
  {
    id: 'mil-3',
    name: 'Soldado Ana',
    rank: 'Soldado',
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=female&seed=3',
    email: 'ana@escala.mil',
    phone: '(31) 95678-1234',
    associatedScales: ['scale-1'],
  },
  {
    id: 'mil-4',
    name: 'Tenente Costa',
    rank: 'Tenente',
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=4',
    email: 'costa@escala.mil',
    phone: '(41) 94321-8765',
    associatedScales: ['scale-2'],
  },
  {
    id: 'mil-5',
    name: 'Major Pereira',
    rank: 'Major',
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=female&seed=5',
    email: 'pereira@escala.mil',
    phone: '(51) 98765-1234',
    associatedScales: ['scale-2'],
  },
]

export const mockUnavailabilityTypes: UnavailabilityTypeDefinition[] = [
  { id: 'type-1', name: 'Férias' },
  { id: 'type-2', name: 'Junta Médica' },
  { id: 'type-3', name: 'Missão' },
  { id: 'type-4', name: 'Dispensa' },
]

export const mockUnavailabilities: Unavailability[] = [
  {
    id: 'unav-1',
    militaryId: 'mil-3',
    type: 'Férias',
    startDate: new Date(),
    endDate: addDays(new Date(), 15),
    observations: 'Férias anuais regulamentares.',
  },
  {
    id: 'unav-2',
    militaryId: 'mil-2',
    type: 'Junta Médica',
    startDate: subDays(new Date(), 5),
    endDate: addDays(new Date(), 5),
  },
]

const today = new Date()
export const mockScales: Scale[] = [
  {
    id: 'scale-1',
    name: 'Escala de Guarda',
    description: 'Escala de guarda do quartel.',
    associatedMilitaryIds: ['mil-1', 'mil-2', 'mil-3'],
    services: [
      {
        id: 'svc-1',
        date: addDays(today, 1),
        militaryId: 'mil-1',
        startTime: '08:00',
        endTime: '20:00',
      },
      {
        id: 'svc-2',
        date: addDays(today, 2),
        militaryId: 'mil-2',
        startTime: '08:00',
        endTime: '20:00',
      },
      {
        id: 'svc-3',
        date: addDays(today, 3),
        militaryId: 'mil-1',
        startTime: '08:00',
        endTime: '20:00',
      },
    ],
    reservations: [{ date: addDays(today, 1), militaryIds: ['mil-2'] }],
  },
  {
    id: 'scale-2',
    name: 'Escala de Oficial de Dia',
    description: 'Escala para oficiais.',
    associatedMilitaryIds: ['mil-1', 'mil-4', 'mil-5'],
    services: [
      {
        id: 'svc-4',
        date: addDays(today, 1),
        militaryId: 'mil-4',
        startTime: '08:00',
        endTime: '08:00',
      },
      {
        id: 'svc-5',
        date: addDays(today, 2),
        militaryId: 'mil-5',
        startTime: '08:00',
        endTime: '08:00',
      },
    ],
    reservations: [],
  },
]

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    message: 'Nova indisponibilidade adicionada para Soldado Ana.',
    type: 'info',
    read: false,
    createdAt: new Date(),
  },
  {
    id: 'notif-2',
    message: 'Escala de Guarda atualizada.',
    type: 'info',
    read: false,
    createdAt: subDays(new Date(), 1),
  },
  {
    id: 'notif-3',
    message: 'Conflito de escala detectado para o dia 25.',
    type: 'warning',
    read: true,
    createdAt: subDays(new Date(), 2),
  },
]
