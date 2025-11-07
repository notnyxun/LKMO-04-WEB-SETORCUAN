export interface User {
  id: string
  username: string
  email: string
  whatsapp: string
  eWalletType: "Gopay" | "OVO" | "Dana" | "LinkAja"
  eWalletNumber: string
  password: string
  role: "user" | "admin"
  points: number
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  usernameOrEmail: string
  password: string
}

export interface RegisterData extends Omit<User, "id" | "points" | "createdAt" | "role"> {
  password: string
  confirmPassword: string
}
