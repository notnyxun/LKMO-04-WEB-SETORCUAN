"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

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
        router.push("/dashboard")
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
    <main className="min-h-screen bg-green-500 flex items-center justify-center">
      <div className="flex gap-8 w-full max-w-2xl px-4">
        <div className="hidden md:flex flex-col justify-center">
          <h1 className="text-6xl font-bold text-black">Login</h1>
        </div>

        <div className="bg-white rounded-2xl p-8 w-full md:max-w-sm shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-center">Username / Email</label>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full bg-gray-200 rounded-md p-3 border border-gray-300"
                placeholder="Masukkan username atau email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-center">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-200 rounded-md p-3 border border-gray-300 pr-10"
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

          <p className="text-center mt-6 underline">
            <Link href="/register" className="text-green-600 hover:text-green-700">
              Belum memiliki akun? Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
