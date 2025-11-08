import { create } from "zustand"
import { persist } from "zustand/middleware"
import { api } from "@/services/api"

export interface Transaction {
  id: string
  type: "sampah" | "poin" | "deposit" | "withdrawal"
  userId?: string | number // <-- Dibuat opsional
  username?: string // <-- Dibuat opsional
  locationId?: string
  locationName?: string
  location?: string
  kategori?: string
  berat?: number
  coins?: number 
  harga: number
  status: "pending" | "berhasil" | "dibatalkan" | "processing" | "validated" | "completed" | "rejected" | "cancelled"
  createdAt: string
  updatedAt: string
  user?: { // <-- Ditambahkan untuk data admin
    id: number
    username: string
    firstName: string | null
    lastName: string | null
    whatsapp: string | null
  }
}

export interface User {
  id: string | number
  username: string
  email: string
  password?: string 
  whatsapp?: string
  ewallet?: string
  ewalletNumber?: string
  role: "customer" | "admin"
  totalKg: number
  totalCoins: number
  coinExchanged: number
  coinRemaining: number
  profileCompleted: boolean
  firstName?: string 
  lastName?: string
  address?: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  login: (usernameOrEmail: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: async (usernameOrEmail: string, password: string) => {
        try {
          const result = await api.auth.login(usernameOrEmail, password)
          if (result.token && result.user) {
            set({
              user: result.user,
              isAuthenticated: true,
              token: result.token,
            })
            return true
          }
          return false
        } catch (error) {
          console.error("Login error:", error)
          return false
        }
      },

      register: async (username: string, email: string, password: string) => {
        try {
          const result = await api.auth.register({ username, email, password })
          return result.success || false
        } catch (error) {
          console.error("Register error:", error)
          return false
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, token: null })
      },
      
      fetchUser: async () => {
        if (!get().isAuthenticated) return;
        try {
          const user = await api.user.getProfile();
          if (user && !user.error) {
            set({ user });
          } else {
            get().logout();
          }
        } catch (error) {
          console.error("Gagal fetch user:", error);
          get().logout();
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const state = get()
        if (state.user) {
          try {
            const result = await api.user.updateProfile(data)
            if (result.success) {
               set({ user: result.user })
               return true;
            }
            return false;
          } catch (error) {
            console.error("Update profile error:", error)
            return false;
          }
        }
        return false;
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        const state = get()
        if (!state.user) return false;
        
        try {
          const result = await api.user.updatePassword(currentPassword, newPassword)
          return result.success || false;
        } catch (error) {
          console.error("Update password error:", error)
          return false
        }
      },
    }),
    {
      name: "auth-store",
    },
  ),
)