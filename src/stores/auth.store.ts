import { create } from 'zustand'
import { User } from '@/types'
import { storage } from '@/lib/storage'
import { mockUsers } from '@/lib/mock-data'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string) => boolean
  logout: () => void
}

const useAuthStore = create<AuthState>((set) => ({
  user: storage.getItem<User>('user'),
  isAuthenticated: !!storage.getItem<User>('user'),
  login: (email: string) => {
    // In a real app, you'd verify password as well
    const foundUser = mockUsers.find((u) => u.email === email)
    if (foundUser) {
      storage.setItem('user', foundUser)
      set({ user: foundUser, isAuthenticated: true })
      return true
    }
    return false
  },
  logout: () => {
    storage.removeItem('user')
    set({ user: null, isAuthenticated: false })
  },
}))

export default useAuthStore
