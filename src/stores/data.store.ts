import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Military, Scale, Unavailability, Notification, User } from '@/types'
import {
  mockMilitary,
  mockScales,
  mockUnavailabilities,
  mockNotifications,
  mockUsers,
} from '@/lib/mock-data'

interface DataState {
  military: Military[]
  scales: Scale[]
  unavailabilities: Unavailability[]
  notifications: Notification[]
  users: User[]
  activeScaleId: string | null
  setActiveScaleId: (id: string | null) => void
  // Add more actions here for CRUD operations
}

const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      military: mockMilitary,
      scales: mockScales,
      unavailabilities: mockUnavailabilities,
      notifications: mockNotifications,
      users: mockUsers,
      activeScaleId: mockScales.length > 0 ? mockScales[0].id : null,
      setActiveScaleId: (id) => set({ activeScaleId: id }),
    }),
    {
      name: 'escala-inteligente-storage',
    },
  ),
)

export default useDataStore
