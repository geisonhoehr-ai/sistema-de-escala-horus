import { create } from 'zustand'
import { User } from '@/types'
import { supabase } from '@/lib/supabase'
import { mockUsers } from '@/lib/mock-data'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

const MOCK_USER_STORAGE_KEY = 'horus_mock_user'

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (email, password) => {
    // First check if credentials match a mock user
    const mockUser = mockUsers.find(
      (u) => u.email === email && u.password === password,
    )

    if (mockUser) {
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(mockUser))
      set({ user: mockUser, isAuthenticated: true, isLoading: false })
      return true
    }

    // If not mock user, try Supabase auth
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
    // Check if it is a mock user logout
    const mockUserJson = localStorage.getItem(MOCK_USER_STORAGE_KEY)
    if (mockUserJson) {
      localStorage.removeItem(MOCK_USER_STORAGE_KEY)
    } else {
      await supabase.auth.signOut()
    }
    set({ user: null, isAuthenticated: false })
  },
  initialize: async () => {
    try {
      // Check for mock user session first
      const mockUserJson = localStorage.getItem(MOCK_USER_STORAGE_KEY)
      if (mockUserJson) {
        const user = JSON.parse(mockUserJson) as User
        set({ user, isAuthenticated: true, isLoading: false })
        return
      }

      // Then check Supabase session
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
        // Only update if we are not currently using a mock user (which has priority in this dev mode)
        if (localStorage.getItem(MOCK_USER_STORAGE_KEY)) return

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
