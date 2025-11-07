"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, user } = useAuthStore()

  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.profileCompleted === false) {
        router.push("/profile")
      } else {
        if (user?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!usernameOrEmail || !password) {
      setError("Username/Email dan password harus diisi")
      setLoading(false)
      return
    }

    const success = await login(usernameOrEmail, password)

    if (!success) {
      setError("Username/Email atau password salah")
      setLoading(false)
    }
  }

  return (
    <main className="h-[calc(100vh-64px)] bg-green-500 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 m-4">
        <div className="relative h-64 md:h-full w-full">
          <Image
            src="/image/login.jpg"
            alt="Recycling"
            fill
            className="object-cover"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x600/a7f3d0/14532d?text=SetorCuan")}
          />
        </div>

        <div className="p-8 md:p-12 w-full flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Username</label>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full bg-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan username atau email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-200 rounded-md p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium"
            >
              {loading ? "Loading..." : "Login"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Belum memiliki akun?{" "}
            <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
