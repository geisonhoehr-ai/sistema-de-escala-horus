export type UserRole = 'Admin' | 'Militar'

export interface User {
  id: string
  name: string
  email: string
  password?: string
  role: UserRole
  avatarUrl: string
  associatedScales: string[]
}

export interface Military {
  id: string
  name: string
  rank: string // Patente/Graduação
  avatarUrl: string
  email: string
  phone: string
  associatedScales: string[]
}

export type UnavailabilityType =
  | 'Junta Médica'
  | 'Férias'
  | 'Missão'
  | 'Dispensa'

export interface Unavailability {
  id: string
  militaryId: string
  type: UnavailabilityType
  startDate: Date
  endDate: Date
  observations?: string
}

export interface Service {
  date: Date
  militaryId: string
  observations?: string
}

export interface DailyReservation {
  date: Date
  militaryIds: string[]
}

export interface Scale {
  id: string
  name: string
  description: string
  associatedMilitaryIds: string[]
  services: Service[]
  reservations: DailyReservation[]
}

export interface Notification {
  id: string
  message: string
  type: 'info' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}
