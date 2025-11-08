"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { PrivateRoute } from "@/components/private-route"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { User, Wallet, Landmark, Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EWALLET_TYPES } from "@/config/navigation"
import { api } from "@/services/api"

type ActiveTab = "profile" | "billing"

function ProfileTabContent() {
  const { user, updateProfile: updateProfileStore, updatePassword } = useAuthStore()

  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    whatsapp: "",
    address: "", // Tambahkan address
  })
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [successProfile, setSuccessProfile] = useState("")
  const [errorProfile, setErrorProfile] = useState("")

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [successPassword, setSuccessPassword] = useState("")
  const [errorPassword, setErrorPassword] = useState("")

  useEffect(() => {
    // Ambil data profil terbaru saat komponen dimuat
    api.user.getProfile().then(data => {
      if(data && !data.error) {
        setFormData({
          username: data.username || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          whatsapp: data.whatsapp || "",
          address: data.address || "", // Isi address
        })
      }
    }).catch(err => {
      console.error("Gagal memuat profil:", err);
    })
  }, [])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleCancelEdit = () => {
    setIsEditing(false)
    setErrorProfile("")
    setSuccessProfile("")
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        whatsapp: user.whatsapp || "",
        address: user.address || "", // Reset address
      })
    }
  }

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

    const success = await updateProfileStore({
      whatsapp: formData.whatsapp,
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address, // Kirim address
    })

    if(success) {
      setSuccessProfile("Profile berhasil disimpan!")
      setIsEditing(false)
    } else {
      setErrorProfile("Gagal menyimpan profil.")
    }
    setLoadingProfile(false)
  }

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
                  form="profileForm"
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
            {/* --- TAMBAHKAN INPUT ALAMAT --- */}
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-700">Alamat Lengkap</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleProfileChange}
                disabled={!isEditing}
                className={`w-full bg-gray-200 rounded-md p-4 border border-gray-300 ${
                  !isEditing ? "text-gray-600" : "text-black"
                }`}
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            </div>
            {/* --- BATAS TAMBAHAN --- */}

            {errorProfile && <p className="text-red-500 text-sm">{errorProfile}</p>}
            {successProfile && <p className="text-green-600 text-sm">{successProfile}</p>}
          </form>
        </div>
      </div>

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

type BankAccount = {
  bankName: string;
  accountNumber: string;
}

function BillingTabContent() {
  const { user, updateProfile: updateProfileStore } = useAuthStore()
  
  const [isEwalletModalOpen, setIsEwalletModalOpen] = useState(false)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  
  const [ewalletData, setEwalletData] = useState({
    type: user?.ewallet || "Gopay",
    number: user?.ewalletNumber || "",
  })
  
  const [bankData, setBankData] = useState<BankAccount>({
    bankName: "",
    accountNumber: "",
  })
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (isEwalletModalOpen) {
      setEwalletData({
        type: user?.ewallet || "Gopay",
        number: user?.ewalletNumber || "",
      })
    }
  }, [isEwalletModalOpen, user])


  const handleSaveEwallet = async () => {
    setLoading(true)
    const success = await updateProfileStore({
      ewallet: ewalletData.type,
      ewalletNumber: ewalletData.number,
      profileCompleted: true,
    })
    
    if (success) {
      setSuccess("E-Wallet berhasil diperbarui!")
    } else {
      setSuccess("Gagal memperbarui e-wallet.")
    }
    setLoading(false)
    setIsEwalletModalOpen(false)
  }

  const handleRemoveEwallet = async () => {
    const success = await updateProfileStore({
      ewallet: "",
      ewalletNumber: "",
    })
    if(success) {
      setSuccess("E-Wallet berhasil dihapus.")
    }
  }

  const handleSaveBank = () => {
    setLoading(true)
    setBankAccounts(prev => [...prev, bankData])
    
    setLoading(false)
    setIsBankModalOpen(false)
    setSuccess("Rekening bank berhasil ditambahkan!")
    setBankData({ bankName: "", accountNumber: "" })
  }

  const handleRemoveBank = (accountNumber: string) => {
    setBankAccounts(prev => prev.filter(bank => bank.accountNumber !== accountNumber));
    setSuccess("Rekening bank berhasil dihapus.");
  }


  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-black">E-Wallet & Bank Information</h1>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded-md text-sm mb-6">
            {success}
          </div>
        )}

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-semibold text-black">E-Wallet</h2>
                <p className="text-gray-600">Masukkan Informasi E-Wallet anda untuk transaksi</p>
              </div>
              <Button 
                onClick={() => setIsEwalletModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {user?.ewalletNumber ? "Edit E-Wallet" : "+ Add E-Wallet"}
              </Button>
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
                <Button 
                  variant="link" 
                  className="text-red-600"
                  onClick={handleRemoveEwallet}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg mt-4 text-center">
                <div className="bg-gray-200 p-4 rounded-full mb-4">
                  <Wallet className="text-gray-600 w-8 h-8" />
                </div>
                <p className="text-lg font-medium text-gray-700">Tidak ada E-Wallet yang terdaftar</p>
                <p className="text-sm text-gray-500">Klik 'Add E-Wallet' untuk menambahkan.</p>
              </div>
            )}
          </div>

          <hr className="my-8 border-gray-200" />

          <div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-semibold text-black">Bank</h2>
                <p className="text-gray-600">Masukkan Informasi Bank anda untuk transaksi</p>
              </div>
              <Button 
                onClick={() => setIsBankModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                + Add Bank Account
              </Button>
            </div>

            {bankAccounts.length > 0 ? (
              <div className="space-y-4 mt-4">
                {bankAccounts.map((bank) => (
                  <div key={bank.accountNumber} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Landmark className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-black">{bank.bankName.toUpperCase()}</p>
                        <p className="text-gray-600">{bank.accountNumber}</p>
                      </div>
                    </div>
                    <Button 
                      variant="link" 
                      className="text-red-600"
                      onClick={() => handleRemoveBank(bank.accountNumber)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg mt-4 text-center">
                <div className="bg-gray-200 p-4 rounded-full mb-4">
                  <Landmark className="text-gray-600 w-8 h-8" />
                </div>
                <p className="text-lg font-medium text-gray-700">Tidak ada bank yang tercatat</p>
                <p className="text-sm text-gray-500">Klik 'Add Bank Account' untuk menambahkan.</p>
              </div>
            )}

          </div>
        </div>
      </div>

      <Dialog open={isEwalletModalOpen} onOpenChange={setIsEwalletModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah / Edit E-Wallet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ewallet-type" className="text-right">
                Tipe
              </Label>
              <Select
                value={ewalletData.type}
                onValueChange={(value) => setEwalletData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="ewallet-type" className="col-span-3">
                  <SelectValue placeholder="Pilih E-Wallet" />
                </SelectTrigger>
                <SelectContent>
                  {EWALLET_TYPES.map((wallet) => (
                    <SelectItem key={wallet.value} value={wallet.value}>
                      {wallet.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ewallet-number" className="text-right">
                Nomor
              </Label>
              <Input
                id="ewallet-number"
                value={ewalletData.number}
                onChange={(e) => setEwalletData(prev => ({ ...prev, number: e.target.value }))}
                className="col-span-3"
                placeholder="08..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveEwallet} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Rekening Bank</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bank-name" className="text-right">
                Nama Bank
              </Label>
              <Input
                id="bank-name"
                value={bankData.bankName}
                onChange={(e) => setBankData(prev => ({ ...prev, bankName: e.target.value }))}
                className="col-span-3"
                placeholder="Contoh: BCA"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-number" className="text-right">
                Nomor Rek.
              </Label>
              <Input
                id="account-number"
                value={bankData.accountNumber}
                onChange={(e) => setBankData(prev => ({ ...prev, accountNumber: e.target.value }))}
                className="col-span-3"
                placeholder="1234567890"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveBank} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Rekening"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

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
      <div className="w-1/4 min-w-[280px] bg-white p-8 border-r border-gray-200 flex flex-col items-center">
        <Image
          src="/placeholder-user.jpg"
          alt="User Avatar"
          width={128}
          height={128}
          className="rounded-full bg-gray-300 w-32 h-32 mb-4"
        />
        <h2 className="text-2xl font-bold text-black text-center">
          {user?.firstName || user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : user?.username}
        </h2>
        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium my-2 capitalize">{user?.role}</span> {/* <-- PERBAIKAN */}
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

      <div className="w-3/4 bg-green-100 p-12 overflow-y-auto">
        {activeTab === "profile" && <ProfileTabContent />}
        {activeTab === "billing" && <BillingTabContent />}
      </div>
    </main>
  )
}

export default function ProfilePage() {
  return (
    <PrivateRoute requiredRole="customer"> {/* <-- PERBAIKAN */}
      <ProfileContent />
    </PrivateRoute>
  )
}