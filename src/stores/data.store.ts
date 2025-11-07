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
} from '@/types'
import {
  mockMilitary,
  mockScales,
  mockUnavailabilities,
  mockNotifications,
  mockUsers,
} from '@/lib/mock-data'
import { isSameDay } from 'date-fns'

interface DataState {
  military: Military[]
  scales: Scale[]
  unavailabilities: Unavailability[]
  notifications: Notification[]
  users: User[]
  activeScaleId: string | null
  setActiveScaleId: (id: string | null) => void
  updateScale: (updatedScale: Partial<Scale> & { id: string }) => void
  deleteScale: (scaleId: string) => void
  updateUser: (updatedUser: Partial<User> & { id: string }) => void
  deleteUser: (userId: string) => void
  updateMilitary: (updatedMilitary: Partial<Military> & { id: string }) => void
  deleteMilitary: (militaryId: string) => void
  addUnavailability: (newUnavailability: Omit<Unavailability, 'id'>) => void
  updateUnavailability: (
    updatedUnavailability: Partial<Unavailability> & { id: string },
  ) => void
  deleteUnavailability: (unavailabilityId: string) => void
  updateServiceForDay: (
    scaleId: string,
    date: Date,
    militaryId: string | null,
    observations?: string,
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
      activeScaleId: mockScales.length > 0 ? mockScales[0].id : null,
      setActiveScaleId: (id) => set({ activeScaleId: id }),
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
      updateServiceForDay: (scaleId, date, militaryId, observations) =>
        set((state) => ({
          scales: state.scales.map((scale) => {
            if (scale.id !== scaleId) return scale
            let serviceFound = false
            const updatedServices = scale.services
              .map((service) => {
                if (isSameDay(service.date, date)) {
                  serviceFound = true
                  if (militaryId) {
                    return { ...service, militaryId, observations }
                  }
                  return null // Remove service if militaryId is null
                }
                return service
              })
              .filter(Boolean) as Service[]

            if (!serviceFound && militaryId) {
              updatedServices.push({ date, militaryId, observations })
            }

            return { ...scale, services: updatedServices }
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
