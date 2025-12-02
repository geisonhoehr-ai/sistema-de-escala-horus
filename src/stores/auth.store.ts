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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error || !data.user) {
        console.error('Login error:', error)
        return false
      }

      // Fetch profile to get role and other details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
      }

      const appUser: User = {
        id: data.user.id,
        email: data.user.email || '',
        name:
          profile?.name ||
          data.user.user_metadata?.name ||
          data.user.email ||
          'Usuário',
        role: profile?.role || data.user.user_metadata?.role || 'Militar',
        avatarUrl: profile?.avatar_url || data.user.user_metadata?.avatarUrl,
        associatedScales:
          profile?.associated_scales ||
          data.user.user_metadata?.associatedScales ||
          [],
      }

      set({ user: appUser, isAuthenticated: true, isLoading: false })
      return true
    } catch (err) {
      console.error('Unexpected login error:', err)
      return false
    }
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
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        const appUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name:
            profile?.name ||
            session.user.user_metadata?.name ||
            session.user.email ||
            'Usuário',
          role: profile?.role || session.user.user_metadata?.role || 'Militar',
          avatarUrl:
            profile?.avatar_url || session.user.user_metadata?.avatarUrl,
          associatedScales:
            profile?.associated_scales ||
            session.user.user_metadata?.associatedScales ||
            [],
        }
        set({ user: appUser, isAuthenticated: true, isLoading: false })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          // Optionally refetch profile here if needed, for now we rely on initial load or manual refresh
          // If we wanted to be reactive to profile changes we would need a subscription
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
