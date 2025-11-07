"use client"

import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { type ReactNode, useEffect } from "react"

interface PrivateRouteProps {
  children: ReactNode
  requiredRole?: "user" | "admin"
}

export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push("/")
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
