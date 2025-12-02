import { create } from 'zustand'
import { User } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      console.error('Login error:', error)
      return false
    }

    return true
  },
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },
  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const { user } = session
        // Map Supabase user to App User
        const appUser: User = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata.name || user.email || 'Usuário',
          role: user.user_metadata.role || 'Militar', // Default to Militar if not set
          avatarUrl: user.user_metadata.avatarUrl,
          associatedScales: user.user_metadata.associatedScales || [],
        }
        set({ user: appUser, isAuthenticated: true, isLoading: false })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const { user } = session
          const appUser: User = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata.name || user.email || 'Usuário',
            role: user.user_metadata.role || 'Militar',
            avatarUrl: user.user_metadata.avatarUrl,
            associatedScales: user.user_metadata.associatedScales || [],
          }
          set({ user: appUser, isAuthenticated: true, isLoading: false })
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ isLoading: false })
    }
  },
}))

export default useAuthStore
