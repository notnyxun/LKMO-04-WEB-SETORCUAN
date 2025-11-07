"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { PrivateRoute } from "@/components/private-route"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { User, Wallet, Landmark, Eye, EyeOff } from "lucide-react"

type ActiveTab = "profile" | "billing"

// Komponen untuk Konten Tab Profile (Account Settings + Ubah Password)
function ProfileTabContent() {
  const { user, updateProfile, updatePassword } = useAuthStore()

  // State untuk mode edit
  const [isEditing, setIsEditing] = useState(false)

  // State untuk Account Settings
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    whatsapp: "",
  })
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [successProfile, setSuccessProfile] = useState("")
  const [errorProfile, setErrorProfile] = useState("")

  // State untuk Ubah Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [successPassword, setSuccessPassword] = useState("")
  const [errorPassword, setErrorPassword] = useState("")

  // [PERBAIKAN 1] - useEffect sekarang membaca firstName/lastName dari store
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "", // <-- DIUBAH
        lastName: user.lastName || "",   // <-- DIUBAH
        whatsapp: user.whatsapp || "",
      })
    }
  }, [user])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleShowPassword = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  // Handler untuk Batal Edit
  const handleCancelEdit = () => {
    setIsEditing(false)
    setErrorProfile("")
    setSuccessProfile("")
    // Reset form ke data user
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "", // <-- DIUBAH
        lastName: user.lastName || "",   // <-- DIUBAH
        whatsapp: user.whatsapp || "",
      })
    }
  }

  // [PERBAIKAN 2] - handleSubmitProfile sekarang mengirim firstName/lastName
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorProfile("")
    setSuccessProfile("")
    setLoadingProfile(true)

    if (!formData.whatsapp) {
      setErrorProfile("Nomor Whatsapp harus diisi")
      setLoadingProfile(false)
      return
    }

    updateProfile({
      whatsapp: formData.whatsapp,
      firstName: formData.firstName, // <-- DIUBAH
      lastName: formData.lastName,   // <-- DIUBAH
    })

    setSuccessProfile("Profile berhasil disimpan!")
    setLoadingProfile(false)
    setIsEditing(false) // Nonaktifkan mode edit setelah berhasil
  }

  // Submit Handler untuk Ubah Password
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorPassword("")
    setSuccessPassword("")
    setLoadingPassword(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorPassword("Password baru dan konfirmasi tidak cocok")
      setLoadingPassword(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setErrorPassword("Password minimal 6 karakter")
      setLoadingPassword(false)
      return
    }

    const success = await updatePassword(passwordData.currentPassword, passwordData.newPassword)

    if (success) {
      setSuccessPassword("Password berhasil diubah!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } else {
      setErrorPassword("Password saat ini salah")
    }
    setLoadingPassword(false)
  }

  return (
    <div className="space-y-8">
      {/* Account Settings */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-black">Account Settings</h1>
          <div>
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loadingProfile}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  form="profileForm" // Tautkan ke form
                  disabled={loadingProfile}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
                >
                  {loadingProfile ? "Loading..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <form id="profileForm" onSubmit={handleSubmitProfile} className="space-y-6">
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
                onChange={handleProfileChange}
                disabled={!isEditing}
                className={`w-full bg-gray-200 rounded-md p-4 border border-gray-300 ${
                  !isEditing ? "text-gray-600" : "text-black"
                }`}
                placeholder="Masukkan nama depan"
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleProfileChange}
                disabled={!isEditing}
                className={`w-full bg-gray-200 rounded-md p-4 border border-gray-300 ${
                  !isEditing ? "text-gray-600" : "text-black"
                }`}
                placeholder="Masukkan nama belakang"
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-700">Nomor Whatsapp</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleProfileChange}
                disabled={!isEditing}
                className={`w-full bg-gray-200 rounded-md p-4 border border-gray-300 ${
                  !isEditing ? "text-gray-600" : "text-black"
                }`}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            {errorProfile && <p className="text-red-500 text-sm">{errorProfile}</p>}
            {successProfile && <p className="text-green-600 text-sm">{successProfile}</p>}

            {/* Tombol Save Changes di bawah form dihapus, pindah ke atas */}
          </form>
        </div>
      </div>

      {/* Ubah Password */}
      <div>
        <h2 className="text-3xl font-bold text-black mb-8">Ubah Password</h2>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmitPassword} className="space-y-6">
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-700">Password Saat Ini</label>
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-200 rounded-md p-4 border border-gray-300 text-black pr-10"
                  placeholder="Masukkan password saat ini"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword("current")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-700">Password Baru</label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-200 rounded-md p-4 border border-gray-300 text-black pr-10"
                  placeholder="Masukkan password baru"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword("new")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-700">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-200 rounded-md p-4 border border-gray-300 text-black pr-10"
                  placeholder="Konfirmasi password baru"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword("confirm")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {errorPassword && <p className="text-red-500 text-sm">{errorPassword}</p>}
            {successPassword && <p className="text-green-600 text-sm">{successPassword}</p>}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loadingPassword}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
              >
                {loadingPassword ? "Loading..." : "Ubah Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Komponen untuk Konten Tab Billing (E-Wallet & Bank)
function BillingTabContent() {
  const { user } = useAuthStore()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-black">E-Wallet & Bank Information</h1>
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
        {/* Menampilkan nama lengkap jika ada, jika tidak, tampilkan username */}
        <h2 className="text-2xl font-bold text-black text-center">
          {user?.firstName || user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : user?.username}
        </h2>
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
        </nav>
      </div>

      {/* Konten Kanan */}
      <div className="w-3/4 bg-green-100 p-12 overflow-y-auto">
        {activeTab === "profile" && <ProfileTabContent />}
        {activeTab === "billing" && <BillingTabContent />}
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