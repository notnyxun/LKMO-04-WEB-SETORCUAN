"use client"

import { useAuthStore } from "@/lib/auth-store"

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "customer", // <-- PERBAIKAN
  }
}