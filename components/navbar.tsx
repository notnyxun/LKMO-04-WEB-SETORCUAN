"use client"

import Link from "next/link"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function Navbar() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
            <span className="font-bold text-lg">SetorCuan</span>
          </Link>

          {/* Menu */}
          <div className="hidden md:flex gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition">
              Home
            </Link>
            <Link href="/prices-locations" className="text-foreground hover:text-primary transition">
              Prices
            </Link>
            <Link href="/prices-locations" className="text-foreground hover:text-primary transition">
              Locations
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground self-center">{user?.username}</span>
                {user?.role === "user" && (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="hover:bg-green-50 bg-transparent">
                      Dashboard
                    </Button>
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="hover:bg-green-50 bg-transparent">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
