"use client"

import Link from "next/link"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function Navbar() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/") // Arahkan ke home setelah logout
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* --- PERBAIKAN LOGO LINK --- */}
          <Link href={user?.role === 'admin' ? '/admin' : '/'} className="flex items-center gap-2">
            <Image
              src="/image/logo.jpg" 
              alt="SetorCuan Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold text-lg text-gray-800">SetorCuan</span>
          </Link>
          {/* --- BATAS PERBAIKAN --- */}

          {/* Menu */}
          {user?.role !== "admin" && (
            <div className="hidden md:flex gap-8">
              <Link href="/" className="text-gray-600 hover:text-green-600 transition">
                Home
              </Link>
              <Link href="/prices" className="text-gray-600 hover:text-green-600 transition">
                Prices
              </Link>
              <Link href="/location" className="text-gray-600 hover:text-green-600 transition">
                Locations
              </Link>
            </div>
          )}

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-500 self-center hidden sm:inline">
                  {user?.username}
                </span>
                
                {user?.role === "customer" && (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="hover:bg-green-50 hover:text-green-700 text-green-600 border-green-600">
                      Dashboard
                    </Button>
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="hover:bg-green-50 hover:text-green-700 text-green-600 border-green-600">
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