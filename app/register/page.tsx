"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuthStore()

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.username || !formData.email || !formData.password) {
      setError("Semua field harus diisi")
      setLoading(false)
      return
    }

    const success = await register(formData.username, formData.email, formData.password)

    if (success) {
      router.push("/login")
    } else {
      setError("Username atau email sudah terdaftar")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-emerald-500 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-8">Register</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-gray-200 rounded-md p-3 border border-gray-300"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-200 rounded-md p-3 border border-gray-300"
              placeholder="Masukkan email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
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
            {loading ? "Loading..." : "Register"}
          </Button>
        </form>

        <p className="text-center mt-6">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="underline text-green-600 hover:text-green-700 font-medium">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}
