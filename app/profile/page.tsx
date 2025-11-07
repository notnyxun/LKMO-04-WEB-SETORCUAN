"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { PrivateRoute } from "@/components/private-route"
import { Button } from "@/components/ui/button"
import { sendWhatsAppMessage } from "@/lib/fonnte"

function ProfileContent() {
  const router = useRouter()
  const { user, updateProfile, updatePassword } = useAuthStore()
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")
  const [formData, setFormData] = useState({
    whatsapp: "",
    ewallet: "ovo",
    ewalletNumber: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        whatsapp: user.whatsapp || "",
        ewallet: user.ewallet || "ovo",
        ewalletNumber: user.ewalletNumber || "",
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!formData.whatsapp || !formData.ewalletNumber) {
      setError("Semua field harus diisi")
      setLoading(false)
      return
    }

    updateProfile({
      whatsapp: formData.whatsapp,
      ewallet: formData.ewallet,
      ewalletNumber: formData.ewalletNumber,
      profileCompleted: true,
    })

    await sendWhatsAppMessage(formData.whatsapp, `Halo ${user?.username}! Profile kamu berhasil diupdate di SetorCuan.`)

    setSuccess("Profile berhasil disimpan!")
    setTimeout(() => {
      if (!user?.profileCompleted) {
        router.push("/dashboard")
      }
    }, 1500)
    setLoading(false)
  }

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Password baru dan konfirmasi tidak cocok")
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password minimal 6 karakter")
      setLoading(false)
      return
    }

    const success = updatePassword(passwordData.currentPassword, passwordData.newPassword)
    if (!success) {
      setError("Password saat ini salah")
      setLoading(false)
      return
    }

    setSuccess("Password berhasil diubah!")
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      showCurrent: false,
      showNew: false,
      showConfirm: false,
    })
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">Pengaturan Profile</h1>
        <p className="text-gray-600 mb-8">
          {user?.profileCompleted
            ? "Edit informasi pribadi Anda"
            : "Silakan lengkapi informasi pribadi Anda untuk melanjutkan"}
        </p>

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === "profile"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            Data Pribadi
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === "password"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            Ubah Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleSubmitProfile} className="space-y-6 bg-gray-50 p-8 rounded-lg border border-gray-200">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={user?.username || ""}
                disabled
                className="w-full bg-gray-200 rounded-md p-3 border border-gray-300 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full bg-gray-200 rounded-md p-3 border border-gray-300 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nomor WhatsApp</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full bg-gray-200 rounded-md p-3 border border-gray-300"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipe E-Wallet/Rekening</label>
              <select
                name="ewallet"
                value={formData.ewallet}
                onChange={handleChange}
                className="w-full bg-gray-200 rounded-md p-3 border border-gray-300"
              >
                <option value="ovo">OVO</option>
                <option value="gopay">GoPay</option>
                <option value="dana">DANA</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nomor E-Wallet/Rekening</label>
              <input
                type="text"
                name="ewalletNumber"
                value={formData.ewalletNumber}
                onChange={handleChange}
                className="w-full bg-gray-200 rounded-md p-3 border border-gray-300"
                placeholder="Masukkan nomor rekening/e-wallet"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium"
              >
                {loading ? "Loading..." : "Simpan Profile"}
              </Button>
              {user?.profileCompleted && (
                <Button type="button" onClick={() => router.push("/dashboard")} variant="outline" className="flex-1">
                  Batal
                </Button>
              )}
            </div>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={handleSubmitPassword} className="space-y-6 bg-gray-50 p-8 rounded-lg border border-gray-200">
            <div>
              <label className="block text-sm font-medium mb-2">Password Saat Ini</label>
              <div className="relative">
                <input
                  type={passwordData.showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-200 rounded-md p-3 border border-gray-300 pr-10"
                  placeholder="Masukkan password saat ini"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordData((prev) => ({ ...prev, showCurrent: !prev.showCurrent }))}
                  className="absolute right-3 top-3 text-gray-600 hover:text-black"
                >
                  {passwordData.showCurrent ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password Baru</label>
              <div className="relative">
                <input
                  type={passwordData.showNew ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-200 rounded-md p-3 border border-gray-300 pr-10"
                  placeholder="Masukkan password baru"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordData((prev) => ({ ...prev, showNew: !prev.showNew }))}
                  className="absolute right-3 top-3 text-gray-600 hover:text-black"
                >
                  {passwordData.showNew ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  type={passwordData.showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-200 rounded-md p-3 border border-gray-300 pr-10"
                  placeholder="Konfirmasi password baru"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordData((prev) => ({ ...prev, showConfirm: !prev.showConfirm }))}
                  className="absolute right-3 top-3 text-gray-600 hover:text-black"
                >
                  {passwordData.showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium"
              >
                {loading ? "Loading..." : "Ubah Password"}
              </Button>
              <Button
                type="button"
                onClick={() =>
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                    showCurrent: false,
                    showNew: false,
                    showConfirm: false,
                  })
                }
                variant="outline"
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

export default function ProfilePage() {
  return (
    <PrivateRoute requiredRole="user">
      <ProfileContent />
    </PrivateRoute>
  )
}
