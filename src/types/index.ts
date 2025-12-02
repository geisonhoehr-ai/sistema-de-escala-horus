export interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Militar' | string
  password?: string
  avatarUrl?: string
  associatedScales?: string[]
}

export interface Military {
  id: string
  name: string
  rank: string
  avatarUrl?: string
  email: string
  phone: string
  associatedScales: string[]
}

export interface UnavailabilityTypeDefinition {
  id: string
  name: string
}

export interface Unavailability {
  id: string
  militaryId: string
  type: string
  startDate: Date
  endDate: Date
  observations?: string
}

export interface Service {
  id: string
  date: Date
  militaryId: string
  startTime: string
  endTime: string
}

export interface Reservation {
  date: Date
  militaryIds: string[]
}

export interface Scale {
  id: string
  name: string
  description: string
  associatedMilitaryIds: string[]
  services: Service[]
  reservations: Reservation[]
}

export interface Notification {
  id: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  createdAt: Date
}
