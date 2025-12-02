import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Military,
  Scale,
  Unavailability,
  Notification,
  User,
  Service,
  DailyReservation,
  UnavailabilityTypeDefinition,
} from '@/types'
import {
  mockMilitary,
  mockScales,
  mockUnavailabilities,
  mockNotifications,
  mockUsers,
  mockUnavailabilityTypes,
} from '@/lib/mock-data'
import { isSameDay } from 'date-fns'

interface DataState {
  military: Military[]
  scales: Scale[]
  unavailabilities: Unavailability[]
  notifications: Notification[]
  users: User[]
  unavailabilityTypes: UnavailabilityTypeDefinition[]
  activeScaleId: string | null
  setActiveScaleId: (id: string | null) => void
  addScale: (newScale: Omit<Scale, 'id' | 'services' | 'reservations'>) => void
  updateScale: (updatedScale: Partial<Scale> & { id: string }) => void
  deleteScale: (scaleId: string) => void
  updateUser: (updatedUser: Partial<User> & { id: string }) => void
  deleteUser: (userId: string) => void
  addMilitary: (newMilitary: Omit<Military, 'id'>) => void
  updateMilitary: (updatedMilitary: Partial<Military> & { id: string }) => void
  deleteMilitary: (militaryId: string) => void
  addUnavailability: (newUnavailability: Omit<Unavailability, 'id'>) => void
  updateUnavailability: (
    updatedUnavailability: Partial<Unavailability> & { id: string },
  ) => void
  deleteUnavailability: (unavailabilityId: string) => void
  addUnavailabilityType: (
    newType: Omit<UnavailabilityTypeDefinition, 'id'>,
  ) => void
  updateUnavailabilityType: (
    updatedType: Partial<UnavailabilityTypeDefinition> & { id: string },
  ) => void
  deleteUnavailabilityType: (typeId: string) => void
  updateServicesForDay: (
    scaleId: string,
    date: Date,
    services: Omit<Service, 'id' | 'date'>[],
  ) => void
  updateReservationForDay: (
    scaleId: string,
    date: Date,
    militaryIds: string[],
  ) => void
}

const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      military: mockMilitary,
      scales: mockScales,
      unavailabilities: mockUnavailabilities,
      notifications: mockNotifications,
      users: mockUsers,
      unavailabilityTypes: mockUnavailabilityTypes,
      activeScaleId: mockScales.length > 0 ? mockScales[0].id : null,
      setActiveScaleId: (id) => set({ activeScaleId: id }),
      addScale: (newScale) =>
        set((state) => ({
          scales: [
            ...state.scales,
            {
              ...newScale,
              id: `scale-${Date.now()}`,
              services: [],
              reservations: [],
            },
          ],
        })),
      updateScale: (updatedScale) =>
        set((state) => ({
          scales: state.scales.map((scale) =>
            scale.id === updatedScale.id
              ? { ...scale, ...updatedScale }
              : scale,
          ),
        })),
      deleteScale: (scaleId) =>
        set((state) => ({
          scales: state.scales.filter((scale) => scale.id !== scaleId),
        })),
      updateUser: (updatedUser) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === updatedUser.id ? { ...user, ...updatedUser } : user,
          ),
        })),
      deleteUser: (userId) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
        })),
      addMilitary: (newMilitary) =>
        set((state) => ({
          military: [
            ...state.military,
            { ...newMilitary, id: `mil-${Date.now()}` },
          ],
        })),
      updateMilitary: (updatedMilitary) =>
        set((state) => ({
          military: state.military.map((m) =>
            m.id === updatedMilitary.id ? { ...m, ...updatedMilitary } : m,
          ),
        })),
      deleteMilitary: (militaryId) =>
        set((state) => ({
          military: state.military.filter((m) => m.id !== militaryId),
        })),
      addUnavailability: (newUnavailability) =>
        set((state) => ({
          unavailabilities: [
            ...state.unavailabilities,
            { ...newUnavailability, id: `unav-${Date.now()}` },
          ],
        })),
      updateUnavailability: (updatedUnavailability) =>
        set((state) => ({
          unavailabilities: state.unavailabilities.map((u) =>
            u.id === updatedUnavailability.id
              ? { ...u, ...updatedUnavailability }
              : u,
          ),
        })),
      deleteUnavailability: (unavailabilityId) =>
        set((state) => ({
          unavailabilities: state.unavailabilities.filter(
            (u) => u.id !== unavailabilityId,
          ),
        })),
      addUnavailabilityType: (newType) =>
        set((state) => ({
          unavailabilityTypes: [
            ...state.unavailabilityTypes,
            { ...newType, id: `type-${Date.now()}` },
          ],
        })),
      updateUnavailabilityType: (updatedType) =>
        set((state) => {
          const oldType = state.unavailabilityTypes.find(
            (t) => t.id === updatedType.id,
          )
          if (!oldType || !updatedType.name)
            return {
              unavailabilityTypes: state.unavailabilityTypes.map((t) =>
                t.id === updatedType.id ? { ...t, ...updatedType } : t,
              ),
            }

          // Update existing records if name changed
          const updatedUnavailabilities = state.unavailabilities.map((u) =>
            u.type === oldType.name ? { ...u, type: updatedType.name! } : u,
          )

          return {
            unavailabilities: updatedUnavailabilities,
            unavailabilityTypes: state.unavailabilityTypes.map((t) =>
              t.id === updatedType.id ? { ...t, ...updatedType } : t,
            ),
          }
        }),
      deleteUnavailabilityType: (typeId) =>
        set((state) => ({
          unavailabilityTypes: state.unavailabilityTypes.filter(
            (t) => t.id !== typeId,
          ),
        })),
      updateServicesForDay: (scaleId, date, newServicesData) =>
        set((state) => ({
          scales: state.scales.map((scale) => {
            if (scale.id !== scaleId) return scale

            // Remove existing services for this day
            const otherServices = scale.services.filter(
              (service) => !isSameDay(service.date, date),
            )

            // Create new service objects
            const newServices: Service[] = newServicesData.map((s) => ({
              ...s,
              id: `svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              date,
            }))

            return {
              ...scale,
              services: [...otherServices, ...newServices],
            }
          }),
        })),
      updateReservationForDay: (scaleId, date, militaryIds) =>
        set((state) => ({
          scales: state.scales.map((scale) => {
            if (scale.id !== scaleId) return scale
            let reservationFound = false
            const updatedReservations = scale.reservations
              .map((res) => {
                if (isSameDay(res.date, date)) {
                  reservationFound = true
                  if (militaryIds.length > 0) {
                    return { ...res, militaryIds }
                  }
                  return null // Remove reservation if no militaryIds
                }
                return res
              })
              .filter(Boolean) as DailyReservation[]

            if (!reservationFound && militaryIds.length > 0) {
              updatedReservations.push({ date, militaryIds })
            }
            return { ...scale, reservations: updatedReservations }
          }),
        })),
    }),
    {
      name: 'escala-inteligente-storage',
    },
  ),
)

export default useDataStore
