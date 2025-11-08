"use client"

import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { type ReactNode, useEffect } from "react"

interface PrivateRouteProps {
  children: ReactNode
  requiredRole?: "customer" | "admin" // <-- PERBAIKAN
}

export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Jika role dibutuhkan dan tidak cocok
    if (requiredRole && user?.role !== requiredRole) {
      // Alihkan ke dashboard yang sesuai
      router.push(user?.role === 'admin' ? '/admin' : '/dashboard')
    }
  }, [isAuthenticated, user, requiredRole, router])

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}