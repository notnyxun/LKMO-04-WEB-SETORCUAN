import { create } from "zustand"
import { persist } from "zustand/middleware"
import { api } from "@/services/api"

export interface Transaction {
  id: string
  type: "sampah" | "poin"
  userId: string
  username: string
  locationId?: string
  locationName?: string
  kategori?: string
  berat?: number
  coins?: number
  harga: number
  status: "pending" | "berhasil" | "dibatalkan"
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  username: string
  email: string
  password: string
  whatsapp?: string
  ewallet?: string
  ewalletNumber?: string
  role: "user" | "admin"
  totalKg: number
  totalCoins: number
  coinExchanged: number
  coinRemaining: number
  transactions?: Transaction[]
  profileCompleted: boolean
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  transactions: Transaction[]
  transactionHistory: Transaction[]
  token: string | null
  login: (usernameOrEmail: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  addTransaction: (transaction: Transaction) => void
  updateTransactionStatus: (transactionId: string, status: "pending" | "berhasil" | "dibatalkan") => void
  updateUserCoins: (userId: string, amount: number, operation: "add" | "subtract") => void
  getTransactions: (userId?: string) => Transaction[]
  getTransactionHistory: (userId?: string) => Transaction[]
  getNextTransactionId: () => string
  cancelTransaction: (transactionId: string) => void
}

const mockUsers: Record<string, { password: string; user: User }> = {
  "johndoe|john@example.com": {
    password: "password123",
    user: {
      id: "1231456",
      username: "johndoe",
      email: "john@example.com",
      password: "password123",
      whatsapp: "081234567890",
      ewallet: "ovo",
      ewalletNumber: "081234567890",
      role: "user",
      totalKg: 10,
      totalCoins: 5,
      coinExchanged: 10000,
      coinRemaining: 1000,
      transactions: [],
      profileCompleted: true,
    },
  },
  "admin|admin@example.com": {
    password: "admin123",
    user: {
      id: "ADMIN001",
      username: "admin",
      email: "admin@example.com",
      password: "admin123",
      whatsapp: "081234567891",
      ewallet: "none",
      role: "admin",
      totalKg: 0,
      totalCoins: 0,
      coinExchanged: 0,
      coinRemaining: 0,
      transactions: [],
      profileCompleted: true,
    },
  },
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      transactions: [],
      transactionHistory: [],
      token: null,

      login: async (usernameOrEmail: string, password: string) => {
        try {
          const result = await api.auth.login(usernameOrEmail, password)

          if (!result) {
            return false
          }

          if (result.token && result.user) {
            localStorage.setItem("token", result.token)
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
        localStorage.removeItem("token")
        set({ user: null, isAuthenticated: false, token: null })
      },

      updateProfile: async (data: Partial<User>) => {
        const state = get()
        if (state.user) {
          try {
            await api.user.updateProfile(data)
            const updatedUser = { ...state.user, ...data }
            set({ user: updatedUser })

            for (const key in mockUsers) {
              if (mockUsers[key].user.id === updatedUser.id) {
                mockUsers[key].user = updatedUser
                break
              }
            }
          } catch (error) {
            console.error("Update profile error:", error)
          }
        }
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        const state = get()
        if (!state.user || state.user.password !== currentPassword) {
          return false
        }
        try {
          const result = await api.user.updatePassword(currentPassword, newPassword)
          if (result.success || result.success === undefined) {
            const updatedUser = { ...state.user, password: newPassword }
            set({ user: updatedUser })

            for (const key in mockUsers) {
              if (mockUsers[key].user.id === updatedUser.id) {
                mockUsers[key].password = newPassword
                mockUsers[key].user = updatedUser
                break
              }
            }
            return true
          }
          return false
        } catch (error) {
          console.error("Update password error:", error)
          return false
        }
      },

      updateUserCoins: (userId: string, amount: number, operation: "add" | "subtract") => {
        const state = get()
        const updatedTransactions = state.transactions.map((t) => {
          if (t.userId === userId) {
            const newCoins =
              operation === "add" ? (t.coins ? t.coins + amount : amount) : t.coins ? Math.max(0, t.coins - amount) : 0
            return { ...t, coins: newCoins }
          }
          return t
        })
        set({ transactions: updatedTransactions })

        if (state.user && state.user.id === userId) {
          const newCoinRemaining =
            operation === "add" ? state.user.coinRemaining + amount : Math.max(0, state.user.coinRemaining - amount)
          state.user.coinRemaining = newCoinRemaining
          set({ user: state.user })
        }
      },

      addTransaction: (transaction: Transaction) => {
        const state = get()
        set({ transactions: [...state.transactions, transaction] })

        if (state.user) {
          state.user.transactions = [...(state.user.transactions || []), transaction]
          set({ user: state.user })
        }
      },

      updateTransactionStatus: (transactionId: string, status: "pending" | "berhasil" | "dibatalkan") => {
        const state = get()
        const transaction = state.transactions.find((t) => t.id === transactionId)

        if (transaction) {
          const updatedTransaction = { ...transaction, status, updatedAt: new Date().toISOString() }

          if (status !== "pending") {
            const updatedTransactions = state.transactions.filter((t) => t.id !== transactionId)
            const updatedHistory = [...state.transactionHistory, updatedTransaction]

            set({
              transactions: updatedTransactions,
              transactionHistory: updatedHistory,
            })

            if (state.user) {
              state.user.transactions = state.user.transactions?.map((t) =>
                t.id === transactionId ? updatedTransaction : t,
              )
              set({ user: state.user })
            }
          } else {
            const updatedTransactions = state.transactions.map((t) => (t.id === transactionId ? updatedTransaction : t))
            set({ transactions: updatedTransactions })

            if (state.user) {
              state.user.transactions = state.user.transactions?.map((t) =>
                t.id === transactionId ? updatedTransaction : t,
              )
              set({ user: state.user })
            }
          }
        }
      },

      getTransactions: (userId?: string) => {
        const state = get()
        if (userId) {
          return state.transactions.filter((t) => t.userId === userId)
        }
        return state.transactions
      },

      getTransactionHistory: (userId?: string) => {
        const state = get()
        if (userId) {
          return state.transactionHistory.filter((t) => t.userId === userId)
        }
        return state.transactionHistory
      },

      getNextTransactionId: () => {
        const state = get()
        const allTrans = [...state.transactions, ...state.transactionHistory]
        const nextNumber = allTrans.length + 1
        return `TRX-${String(nextNumber).padStart(3, "0")}`
      },

      cancelTransaction: (transactionId: string) => {
        const state = get()
        const transaction = state.transactions.find((t) => t.id === transactionId)
        if (transaction) {
          state.updateTransactionStatus(transactionId, "dibatalkan")
        }
      },
    }),
    {
      name: "auth-store",
    },
  ),
)
