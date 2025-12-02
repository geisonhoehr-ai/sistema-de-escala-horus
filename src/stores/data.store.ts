import { create } from 'zustand'
import {
  Military,
  Scale,
  Unavailability,
  Notification,
  User,
  Service,
  UnavailabilityTypeDefinition,
} from '@/types'
import { supabase } from '@/lib/supabase'
import { format, isSameDay } from 'date-fns'

interface DataState {
  military: Military[]
  scales: Scale[]
  unavailabilities: Unavailability[]
  notifications: Notification[]
  users: User[]
  unavailabilityTypes: UnavailabilityTypeDefinition[]
  activeScaleId: string | null
  isLoading: boolean
  setActiveScaleId: (id: string | null) => void
  initialize: () => Promise<void>

  addScale: (
    newScale: Omit<Scale, 'id' | 'services' | 'reservations'>,
  ) => Promise<void>
  updateScale: (updatedScale: Partial<Scale> & { id: string }) => Promise<void>
  deleteScale: (scaleId: string) => Promise<void>

  updateUser: (updatedUser: Partial<User> & { id: string }) => Promise<void>
  deleteUser: (userId: string) => Promise<void>

  addMilitary: (newMilitary: Omit<Military, 'id'>) => Promise<void>
  updateMilitary: (
    updatedMilitary: Partial<Military> & { id: string },
  ) => Promise<void>
  deleteMilitary: (militaryId: string) => Promise<void>

  addUnavailability: (
    newUnavailability: Omit<Unavailability, 'id'>,
  ) => Promise<void>
  updateUnavailability: (
    updatedUnavailability: Partial<Unavailability> & { id: string },
  ) => Promise<void>
  deleteUnavailability: (unavailabilityId: string) => Promise<void>

  addUnavailabilityType: (
    newType: Omit<UnavailabilityTypeDefinition, 'id'>,
  ) => Promise<void>
  updateUnavailabilityType: (
    updatedType: Partial<UnavailabilityTypeDefinition> & { id: string },
  ) => Promise<void>
  deleteUnavailabilityType: (typeId: string) => Promise<void>

  updateServicesForDay: (
    scaleId: string,
    date: Date,
    services: Omit<Service, 'id' | 'date'>[],
  ) => Promise<void>
  updateReservationForDay: (
    scaleId: string,
    date: Date,
    militaryIds: string[],
  ) => Promise<void>
}

const useDataStore = create<DataState>((set, get) => ({
  military: [],
  scales: [],
  unavailabilities: [],
  notifications: [],
  users: [],
  unavailabilityTypes: [],
  activeScaleId: null,
  isLoading: false,

  setActiveScaleId: (id) => set({ activeScaleId: id }),

  initialize: async () => {
    set({ isLoading: true })
    try {
      const [
        { data: militaryData },
        { data: scalesData },
        { data: servicesData },
        { data: reservationsData },
        { data: unavailabilitiesData },
        { data: typesData },
        { data: profilesData },
        { data: notificationsData },
      ] = await Promise.all([
        supabase.from('military').select('*'),
        supabase.from('scales').select('*'),
        supabase.from('services').select('*'),
        supabase.from('reservations').select('*'),
        supabase.from('unavailabilities').select('*'),
        supabase.from('unavailability_types').select('*'),
        supabase.from('profiles').select('*'),
        supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false }),
      ])

      const processedMilitary: Military[] = (militaryData || []).map((m) => ({
        id: m.id,
        name: m.name,
        rank: m.rank,
        avatarUrl: m.avatar_url,
        email: m.email,
        phone: m.phone,
        associatedScales: m.associated_scales || [],
      }))

      const processedScales: Scale[] = (scalesData || []).map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        associatedMilitaryIds: s.associated_military_ids || [],
        services: (servicesData || [])
          .filter((svc) => svc.scale_id === s.id)
          .map((svc) => ({
            id: svc.id,
            date: new Date(svc.date),
            militaryId: svc.military_id,
            startTime: svc.start_time,
            endTime: svc.end_time,
            observations: svc.observations,
          })),
        reservations: (reservationsData || [])
          .filter((res) => res.scale_id === s.id)
          .map((res) => ({
            date: new Date(res.date),
            militaryIds: res.military_ids || [],
          })),
      }))

      const processedUnavailabilities: Unavailability[] = (
        unavailabilitiesData || []
      ).map((u) => ({
        id: u.id,
        militaryId: u.military_id,
        type: u.type,
        startDate: new Date(u.start_date),
        endDate: new Date(u.end_date),
        observations: u.observations,
      }))

      const processedNotifications: Notification[] = (
        notificationsData || []
      ).map((n) => ({
        id: n.id,
        message: n.message,
        type: n.type,
        read: n.read,
        createdAt: new Date(n.created_at),
      }))

      const processedUsers: User[] = (profilesData || []).map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        avatarUrl: p.avatar_url,
        associatedScales: p.associated_scales || [],
      }))

      const processedTypes: UnavailabilityTypeDefinition[] = (
        typesData || []
      ).map((t) => ({
        id: t.id,
        name: t.name,
      }))

      set({
        military: processedMilitary,
        scales: processedScales,
        unavailabilities: processedUnavailabilities,
        notifications: processedNotifications,
        users: processedUsers,
        unavailabilityTypes: processedTypes,
        activeScaleId:
          processedScales.length > 0 ? processedScales[0].id : null,
        isLoading: false,
      })
    } catch (error) {
      console.error('Error initializing data store:', error)
      set({ isLoading: false })
    }
  },

  addScale: async (newScale) => {
    const { data, error } = await supabase
      .from('scales')
      .insert({
        name: newScale.name,
        description: newScale.description,
        associated_military_ids: newScale.associatedMilitaryIds,
      })
      .select()
      .single()

    if (!error && data) {
      const addedScale: Scale = {
        id: data.id,
        name: data.name,
        description: data.description,
        associatedMilitaryIds: data.associated_military_ids || [],
        services: [],
        reservations: [],
      }
      set((state) => ({ scales: [...state.scales, addedScale] }))
    }
  },

  updateScale: async (updatedScale) => {
    const { error } = await supabase
      .from('scales')
      .update({
        name: updatedScale.name,
        description: updatedScale.description,
        associated_military_ids: updatedScale.associatedMilitaryIds,
      })
      .eq('id', updatedScale.id)

    if (!error) {
      set((state) => ({
        scales: state.scales.map((scale) =>
          scale.id === updatedScale.id ? { ...scale, ...updatedScale } : scale,
        ),
      }))
    }
  },

  deleteScale: async (scaleId) => {
    const { error } = await supabase.from('scales').delete().eq('id', scaleId)

    if (!error) {
      set((state) => ({
        scales: state.scales.filter((scale) => scale.id !== scaleId),
      }))
    }
  },

  updateUser: async (updatedUser) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        associated_scales: updatedUser.associatedScales,
      })
      .eq('id', updatedUser.id)

    if (!error) {
      set((state) => ({
        users: state.users.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user,
        ),
      }))
    }
  },

  deleteUser: async (userId) => {
    // Note: Deleting from profiles might not delete from auth.users depending on cascading.
    // Typically we should call an edge function to delete auth user.
    // For now we just delete the profile record which we use for listing.
    const { error } = await supabase.from('profiles').delete().eq('id', userId)

    if (!error) {
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
      }))
    }
  },

  addMilitary: async (newMilitary) => {
    const { data, error } = await supabase
      .from('military')
      .insert({
        name: newMilitary.name,
        rank: newMilitary.rank,
        avatar_url: newMilitary.avatarUrl,
        email: newMilitary.email,
        phone: newMilitary.phone,
        associated_scales: newMilitary.associatedScales,
      })
      .select()
      .single()

    if (!error && data) {
      const addedMilitary: Military = {
        id: data.id,
        name: data.name,
        rank: data.rank,
        avatarUrl: data.avatar_url,
        email: data.email,
        phone: data.phone,
        associatedScales: data.associated_scales || [],
      }
      set((state) => ({ military: [...state.military, addedMilitary] }))
    }
  },

  updateMilitary: async (updatedMilitary) => {
    const { error } = await supabase
      .from('military')
      .update({
        name: updatedMilitary.name,
        rank: updatedMilitary.rank,
        avatar_url: updatedMilitary.avatarUrl,
        email: updatedMilitary.email,
        phone: updatedMilitary.phone,
        associated_scales: updatedMilitary.associatedScales,
      })
      .eq('id', updatedMilitary.id)

    if (!error) {
      set((state) => ({
        military: state.military.map((m) =>
          m.id === updatedMilitary.id ? { ...m, ...updatedMilitary } : m,
        ),
      }))
    }
  },

  deleteMilitary: async (militaryId) => {
    const { error } = await supabase
      .from('military')
      .delete()
      .eq('id', militaryId)

    if (!error) {
      set((state) => ({
        military: state.military.filter((m) => m.id !== militaryId),
      }))
    }
  },

  addUnavailability: async (newUnavailability) => {
    const { data, error } = await supabase
      .from('unavailabilities')
      .insert({
        military_id: newUnavailability.militaryId,
        type: newUnavailability.type,
        start_date: newUnavailability.startDate.toISOString(),
        end_date: newUnavailability.endDate.toISOString(),
        observations: newUnavailability.observations,
      })
      .select()
      .single()

    if (!error && data) {
      const addedUnavailability: Unavailability = {
        id: data.id,
        militaryId: data.military_id,
        type: data.type,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        observations: data.observations,
      }
      set((state) => ({
        unavailabilities: [...state.unavailabilities, addedUnavailability],
      }))
    }
  },

  updateUnavailability: async (updatedUnavailability) => {
    const updates: any = {}
    if (updatedUnavailability.type) updates.type = updatedUnavailability.type
    if (updatedUnavailability.startDate)
      updates.start_date = updatedUnavailability.startDate.toISOString()
    if (updatedUnavailability.endDate)
      updates.end_date = updatedUnavailability.endDate.toISOString()
    if (updatedUnavailability.observations !== undefined)
      updates.observations = updatedUnavailability.observations

    const { error } = await supabase
      .from('unavailabilities')
      .update(updates)
      .eq('id', updatedUnavailability.id)

    if (!error) {
      set((state) => ({
        unavailabilities: state.unavailabilities.map((u) =>
          u.id === updatedUnavailability.id
            ? { ...u, ...updatedUnavailability }
            : u,
        ),
      }))
    }
  },

  deleteUnavailability: async (unavailabilityId) => {
    const { error } = await supabase
      .from('unavailabilities')
      .delete()
      .eq('id', unavailabilityId)

    if (!error) {
      set((state) => ({
        unavailabilities: state.unavailabilities.filter(
          (u) => u.id !== unavailabilityId,
        ),
      }))
    }
  },

  addUnavailabilityType: async (newType) => {
    const { data, error } = await supabase
      .from('unavailability_types')
      .insert({ name: newType.name })
      .select()
      .single()

    if (!error && data) {
      set((state) => ({
        unavailabilityTypes: [
          ...state.unavailabilityTypes,
          { id: data.id, name: data.name },
        ],
      }))
    }
  },

  updateUnavailabilityType: async (updatedType) => {
    const { error } = await supabase
      .from('unavailability_types')
      .update({ name: updatedType.name })
      .eq('id', updatedType.id)

    if (!error) {
      // If name changed, we need to update all unavailabilities that use this type (if name is stored)
      // Assuming backend handles relations or frontend state update is enough if ID used
      // But here 'type' in unavailabilities is a string name based on current app logic.
      // So we must also update unavailabilities.
      const oldType = get().unavailabilityTypes.find(
        (t) => t.id === updatedType.id,
      )

      if (oldType && updatedType.name && oldType.name !== updatedType.name) {
        await supabase
          .from('unavailabilities')
          .update({ type: updatedType.name })
          .eq('type', oldType.name)

        set((state) => ({
          unavailabilityTypes: state.unavailabilityTypes.map((t) =>
            t.id === updatedType.id ? { ...t, ...updatedType } : t,
          ),
          unavailabilities: state.unavailabilities.map((u) =>
            u.type === oldType.name ? { ...u, type: updatedType.name! } : u,
          ),
        }))
      } else {
        set((state) => ({
          unavailabilityTypes: state.unavailabilityTypes.map((t) =>
            t.id === updatedType.id ? { ...t, ...updatedType } : t,
          ),
        }))
      }
    }
  },

  deleteUnavailabilityType: async (typeId) => {
    const { error } = await supabase
      .from('unavailability_types')
      .delete()
      .eq('id', typeId)

    if (!error) {
      set((state) => ({
        unavailabilityTypes: state.unavailabilityTypes.filter(
          (t) => t.id !== typeId,
        ),
      }))
    }
  },

  updateServicesForDay: async (scaleId, date, services) => {
    const formattedDate = format(date, 'yyyy-MM-dd')

    // 1. Delete existing services for this day
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('scale_id', scaleId)
      .eq('date', formattedDate)

    if (deleteError) {
      console.error('Error deleting services', deleteError)
      return
    }

    // 2. Insert new services
    if (services.length > 0) {
      const newServices = services.map((s) => ({
        scale_id: scaleId,
        date: formattedDate,
        military_id: s.militaryId,
        start_time: s.startTime,
        end_time: s.endTime,
        observations: s.observations,
      }))

      const { data: insertedServices, error: insertError } = await supabase
        .from('services')
        .insert(newServices)
        .select()

      if (insertError) {
        console.error('Error inserting services', insertError)
        return
      }

      // Update local state
      const mappedNewServices: Service[] = (insertedServices || []).map(
        (svc) => ({
          id: svc.id,
          date: new Date(svc.date),
          militaryId: svc.military_id,
          startTime: svc.start_time,
          endTime: svc.end_time,
          observations: svc.observations,
        }),
      )

      set((state) => ({
        scales: state.scales.map((scale) => {
          if (scale.id !== scaleId) return scale
          const otherServices = scale.services.filter(
            (s) => !isSameDay(s.date, date),
          )
          return {
            ...scale,
            services: [...otherServices, ...mappedNewServices],
          }
        }),
      }))
    } else {
      // If just deleting, update local state
      set((state) => ({
        scales: state.scales.map((scale) => {
          if (scale.id !== scaleId) return scale
          const otherServices = scale.services.filter(
            (s) => !isSameDay(s.date, date),
          )
          return { ...scale, services: otherServices }
        }),
      }))
    }
  },

  updateReservationForDay: async (scaleId, date, militaryIds) => {
    const formattedDate = format(date, 'yyyy-MM-dd')

    // Check if exists
    const { data: existing } = await supabase
      .from('reservations')
      .select('id')
      .eq('scale_id', scaleId)
      .eq('date', formattedDate)
      .single()

    if (militaryIds.length === 0) {
      if (existing) {
        await supabase.from('reservations').delete().eq('id', existing.id)
      }
      // Local Update
      set((state) => ({
        scales: state.scales.map((scale) => {
          if (scale.id !== scaleId) return scale
          return {
            ...scale,
            reservations: scale.reservations.filter(
              (r) => !isSameDay(r.date, date),
            ),
          }
        }),
      }))
      return
    }

    let error
    if (existing) {
      const res = await supabase
        .from('reservations')
        .update({ military_ids: militaryIds })
        .eq('id', existing.id)
      error = res.error
    } else {
      const res = await supabase.from('reservations').insert({
        scale_id: scaleId,
        date: formattedDate,
        military_ids: militaryIds,
      })
      error = res.error
    }

    if (!error) {
      set((state) => ({
        scales: state.scales.map((scale) => {
          if (scale.id !== scaleId) return scale
          const other = scale.reservations.filter(
            (r) => !isSameDay(r.date, date),
          )
          return {
            ...scale,
            reservations: [...other, { date, militaryIds }],
          }
        }),
      }))
    }
  },
}))

export default useDataStore
