import { create } from 'zustand'
import { User } from '@/types'
import { storage } from '@/lib/storage'
import { mockUsers } from '@/lib/mock-data'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const useAuthStore = create<AuthState>((set) => ({
  user: storage.getItem<User>('user'),
  isAuthenticated: !!storage.getItem<User>('user'),
  login: (email: string, password: string) => {
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password,
    )
    if (foundUser) {
      const userToStore = { ...foundUser }
      delete userToStore.password // Do not store password in local storage
      storage.setItem('user', userToStore)
      set({ user: userToStore, isAuthenticated: true })
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
