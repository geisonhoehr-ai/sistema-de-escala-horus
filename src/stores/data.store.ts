import { create } from 'zustand'
import {
  Military,
  Scale,
  Unavailability,
  Notification,
  User,
  Service,
  UnavailabilityTypeDefinition,
  Configuration,
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
  configurations: Configuration[]
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

  addConfiguration: (newConfig: Omit<Configuration, 'id'>) => Promise<void>
  updateConfiguration: (
    updatedConfig: Partial<Configuration> & { id: string },
  ) => Promise<void>
  deleteConfiguration: (configId: string) => Promise<void>

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
  configurations: [],
  activeScaleId: null,
  isLoading: false,

  setActiveScaleId: (id) => set({ activeScaleId: id }),

  initialize: async () => {
    set({ isLoading: true })
    try {
      console.log('Initializing data store...')
      const [
        { data: militaryData, error: militaryError },
        { data: scalesData, error: scalesError },
        { data: servicesData, error: servicesError },
        { data: reservationsData, error: reservationsError },
        { data: unavailabilitiesData, error: unavailabilitiesError },
        { data: typesData, error: typesError },
        { data: profilesData, error: profilesError },
        { data: notificationsData, error: notificationsError },
        { data: configurationsData, error: configurationsError },
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
        supabase.from('configurations').select('*'),
      ])

      // Log any errors
      if (militaryError) console.error('Military error:', militaryError)
      if (scalesError) console.error('Scales error:', scalesError)
      if (servicesError) console.error('Services error:', servicesError)
      if (reservationsError) console.error('Reservations error:', reservationsError)
      if (unavailabilitiesError) console.error('Unavailabilities error:', unavailabilitiesError)
      if (typesError) console.error('Types error:', typesError)
      if (profilesError) console.error('Profiles error:', profilesError)
      if (notificationsError) console.error('Notifications error:', notificationsError)
      if (configurationsError) console.error('Configurations error:', configurationsError)

      const processedMilitary: Military[] = (militaryData || []).map((m) => ({
        id: m.id,
        name: m.name,
        rank: m.rank,
        unit: m.unit || 'Unknown',
        status: m.status || 'Active',
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
        unavailabilityTypeId: u.unavailability_type_id,
        startDate: new Date(u.start_date),
        endDate: new Date(u.end_date),
        reasonDetails: u.reason_details,
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
        description: t.description,
      }))

      const processedConfigurations: Configuration[] = (
        configurationsData || []
      ).map((c) => ({
        id: c.id,
        key: c.key,
        value: c.value,
        description: c.description,
      }))

      set({
        military: processedMilitary,
        scales: processedScales,
        unavailabilities: processedUnavailabilities,
        notifications: processedNotifications,
        users: processedUsers,
        unavailabilityTypes: processedTypes,
        configurations: processedConfigurations,
        activeScaleId:
          processedScales.length > 0 ? processedScales[0].id : null,
        isLoading: false,
      })

      console.log('Data store initialized successfully:', {
        military: processedMilitary.length,
        scales: processedScales.length,
        unavailabilities: processedUnavailabilities.length,
        users: processedUsers.length,
        types: processedTypes.length,
        configs: processedConfigurations.length
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
        unit: newMilitary.unit,
        status: newMilitary.status,
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
        unit: data.unit,
        status: data.status,
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
        unit: updatedMilitary.unit,
        status: updatedMilitary.status,
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
        unavailability_type_id: newUnavailability.unavailabilityTypeId,
        start_date: newUnavailability.startDate.toISOString(),
        end_date: newUnavailability.endDate.toISOString(),
        reason_details: newUnavailability.reasonDetails,
      })
      .select()
      .single()

    if (!error && data) {
      const addedUnavailability: Unavailability = {
        id: data.id,
        militaryId: data.military_id,
        unavailabilityTypeId: data.unavailability_type_id,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        reasonDetails: data.reason_details,
      }
      set((state) => ({
        unavailabilities: [...state.unavailabilities, addedUnavailability],
      }))
    }
  },

  updateUnavailability: async (updatedUnavailability) => {
    const updates: any = {}
    if (updatedUnavailability.unavailabilityTypeId)
      updates.unavailability_type_id =
        updatedUnavailability.unavailabilityTypeId
    if (updatedUnavailability.startDate)
      updates.start_date = updatedUnavailability.startDate.toISOString()
    if (updatedUnavailability.endDate)
      updates.end_date = updatedUnavailability.endDate.toISOString()
    if (updatedUnavailability.reasonDetails !== undefined)
      updates.reason_details = updatedUnavailability.reasonDetails

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
      .insert({ name: newType.name, description: newType.description })
      .select()
      .single()

    if (!error && data) {
      set((state) => ({
        unavailabilityTypes: [
          ...state.unavailabilityTypes,
          { id: data.id, name: data.name, description: data.description },
        ],
      }))
    }
  },

  updateUnavailabilityType: async (updatedType) => {
    const { error } = await supabase
      .from('unavailability_types')
      .update({ name: updatedType.name, description: updatedType.description })
      .eq('id', updatedType.id)

    if (!error) {
      set((state) => ({
        unavailabilityTypes: state.unavailabilityTypes.map((t) =>
          t.id === updatedType.id ? { ...t, ...updatedType } : t,
        ),
      }))
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

  addConfiguration: async (newConfig) => {
    const { data, error } = await supabase
      .from('configurations')
      .insert({
        key: newConfig.key,
        value: newConfig.value,
        description: newConfig.description,
      })
      .select()
      .single()

    if (!error && data) {
      set((state) => ({
        configurations: [
          ...state.configurations,
          {
            id: data.id,
            key: data.key,
            value: data.value,
            description: data.description,
          },
        ],
      }))
    }
  },

  updateConfiguration: async (updatedConfig) => {
    const { error } = await supabase
      .from('configurations')
      .update({
        key: updatedConfig.key,
        value: updatedConfig.value,
        description: updatedConfig.description,
      })
      .eq('id', updatedConfig.id)

    if (!error) {
      set((state) => ({
        configurations: state.configurations.map((c) =>
          c.id === updatedConfig.id ? { ...c, ...updatedConfig } : c,
        ),
      }))
    }
  },

  deleteConfiguration: async (configId) => {
    const { error } = await supabase
      .from('configurations')
      .delete()
      .eq('id', configId)

    if (!error) {
      set((state) => ({
        configurations: state.configurations.filter((c) => c.id !== configId),
      }))
    }
  },

  updateServicesForDay: async (scaleId, date, services) => {
    const formattedDate = format(date, 'yyyy-MM-dd')

    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('scale_id', scaleId)
      .eq('date', formattedDate)

    if (deleteError) {
      console.error('Error deleting services', deleteError)
      return
    }

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
