"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { PrivateRoute } from "@/components/private-route"
import { Button } from "@/components/ui/button"
import { sendWhatsAppMessage } from "@/lib/fonnte"
import Image from "next/image"
import Link from "next/link"
import { User, Wallet, History, Banknote, Landmark, Trash2 } from "lucide-react"

type ActiveTab = "profile" | "billing" | "history"

// Komponen untuk Konten Tab Profile
function ProfileTabContent() {
  const { user, updateProfile } = useAuthStore()
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    whatsapp: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: "", // Placeholder, karena tidak ada di auth-store
        lastName: "", // Placeholder, karena tidak ada di auth-store
        whatsapp: user.whatsapp || "",
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!formData.whatsapp) {
      setError("Nomor Whatsapp harus diisi")
      setLoading(false)
      return
    }

    // Hanya update data yang ada di auth-store
    updateProfile({
      whatsapp: formData.whatsapp,
      // username tidak bisa diubah di sini
    })

    await sendWhatsAppMessage(formData.whatsapp, `Halo ${user?.username}! Profile kamu berhasil diupdate di SetorCuan.`)

    setSuccess("Profile berhasil disimpan!")
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-black mb-8">Account Settings</h1>
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <form onSubmit={handleSubmitProfile} className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              disabled
              className="w-full bg-gray-200 rounded-md p-4 border border-gray-300 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full bg-gray-200 rounded-md p-4 border border-gray-300"
              placeholder="Masukkan nama depan"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full bg-gray-200 rounded-md p-4 border border-gray-300"
              placeholder="Masukkan nama belakang"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-700">Nomor Whatsapp</label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              className="w-full bg-gray-200 rounded-md p-4 border border-gray-300"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
            >
              {loading ? "Loading..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Komponen untuk Konten Tab Billing
function BillingTabContent() {
  const { user } = useAuthStore()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-black">E-Wallet & Bank Information</h1>
        <Link href="/history-transaksi">
          <Button className="bg-green-700 hover:bg-green-800 text-white">Bank Transaction History</Button>
        </Link>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        {/* E-Wallet Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-2xl font-semibold text-black">E-Wallet</h2>
              <p className="text-gray-600">Masukkan Informasi E-Wallet anda untuk transaksi</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white">+ Add E-Wallet</Button>
          </div>

          {user?.ewallet && user?.ewalletNumber ? (
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mt-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Wallet className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-lg text-black">{user.ewallet.toUpperCase()}</p>
                  <p className="text-gray-600">{user.ewalletNumber}</p>
                </div>
              </div>
              <Button variant="link" className="text-red-600">
                Remove
              </Button>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">Tidak ada E-Wallet yang terdaftar.</p>
          )}
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Bank Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-2xl font-semibold text-black">Bank</h2>
              <p className="text-gray-600">Masukkan Informasi Bank anda untuk transaksi</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white">+ Add Bank Account</Button>
          </div>

          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg mt-4 text-center">
            <div className="bg-gray-200 p-4 rounded-full mb-4">
              <Landmark className="text-gray-600 w-8 h-8" />
            </div>
            <p className="text-lg font-medium text-gray-700">Tidak ada bank yang tercatat</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Komponen untuk Konten Tab History
function HistoryTabContent() {
  const { user } = useAuthStore()

  return (
    <div>
      <h1 className="text-4xl font-bold text-black mb-2">Record Daur Ulang</h1>
      <p className="text-lg text-gray-700 mb-8">Track Progress Daur Ulangmu!</p>

      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg">
            <p className="text-xl text-gray-700">Total Daur Ulang (kg)</p>
            <p className="text-4xl font-bold text-black">{user?.totalKg}</p>
          </div>
          <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg">
            <p className="text-xl text-gray-700">Total Penukaran Koin</p>
            <p className="text-4xl font-bold text-black">{user?.totalCoins}</p>
          </div>
          <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg">
            <p className="text-xl text-gray-700">Total Koin yang Diperoleh</p>
            <p className="text-4xl font-bold text-black">{user?.coinExchanged}</p>
          </div>
          <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg">
            <p className="text-xl text-gray-700">Total Uang yang Diterima</p>
            <p className="text-4xl font-bold text-black">Rp {user?.coinRemaining * 1000}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Komponen Utama Halaman Profile
function ProfileContent() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile")

  const getButtonClass = (tabName: ActiveTab) => {
    return activeTab === tabName
      ? "bg-green-600 text-white"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
  }

  return (
    <main className="min-h-[calc(100vh-64px)] flex bg-white">
      {/* Sidebar Kiri */}
      <div className="w-1/4 min-w-[280px] bg-white p-8 border-r border-gray-200 flex flex-col items-center">
        <Image
          src="/placeholder-user.jpg"
          alt="User Avatar"
          width={128}
          height={128}
          className="rounded-full bg-gray-300 w-32 h-32 mb-4"
        />
        <h2 className="text-2xl font-bold text-black">{user?.username}</h2>
        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium my-2">User</span>
        <p className="text-gray-500 text-sm">Your ID: {user?.id}</p>

        <nav className="w-full space-y-4 mt-12">
          <Button
            onClick={() => setActiveTab("profile")}
            className={`w-full justify-start h-14 text-lg ${getButtonClass("profile")}`}
          >
            <User className="mr-3" />
            Profile
          </Button>
          <Button
            onClick={() => setActiveTab("billing")}
            className={`w-full justify-start h-14 text-lg ${getButtonClass("billing")}`}
          >
            <Wallet className="mr-3" />
            Billing
          </Button>
          <Button
            onClick={() => setActiveTab("history")}
            className={`w-full justify-start h-14 text-lg ${getButtonClass("history")}`}
          >
            <History className="mr-3" />
            History
          </Button>
        </nav>
      </div>

      {/* Konten Kanan */}
      <div className="w-3/4 bg-green-100 p-12 overflow-y-auto">
        {activeTab === "profile" && <ProfileTabContent />}
        {activeTab === "billing" && <BillingTabContent />}
        {activeTab === "history" && <HistoryTabContent />}
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