"use client"

import { PrivateRoute } from "@/components/private-route"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useEffect, useState } from "react" 
import { RefreshCw } from "lucide-react" // Import RefreshCw

function DashboardContent() {
  const { user, logout, fetchUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUserData() {
      try {
        await fetchUser() 
      } catch (error) { // <-- PERBAIKAN DI SINI (menambahkan {})
        console.error("Gagal memuat data user:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadUserData()
  }, [fetchUser]) 

  const handleLogout = () => {
    logout()
    router.push("/login")
  }
  
  const StatDisplay = ({ value, prefix = "" }: { value: number, prefix?: string }) => {
    if (isLoading) {
      // Tampilkan ikon loading saat isLoading true
      return <RefreshCw className="w-8 h-8 animate-spin text-black" />
    }
    return <p className="text-4xl font-bold text-black">{prefix}{value.toLocaleString("id-ID")}</p>
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-emerald-500">
      {/* Profile Section */}
      <div className="bg-emerald-500 text-white p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <Image
              src="/placeholder-user.jpg"
              alt="User Avatar"
              width={80}
              height={80}
              className="rounded-full bg-gray-300 w-20 h-20"
            />
            <div>
              <h1 className="text-3xl font-bold">{user?.username}</h1>
              <span className="bg-gray-200 text-gray-700 px-3 py-0.5 rounded-full text-sm font-medium capitalize">
                {user?.role}
              </span>
              <p className="text-green-100 text-sm mt-1">Your ID: {user?.id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/profile">
              <Button className="bg-gray-800 hover:bg-gray-900 text-white rounded-full px-6">
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white p-8 rounded-t-3xl min-h-[calc(100vh-200px)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2 text-black">Record Daur Ulang</h2>
            <p className="text-gray-500 mb-8">Track Progress Daur Ulangmu!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Kolom Kiri */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-gray-500">Total Daur Ulang (kg)</p>
                <StatDisplay value={user?.totalKg || 0} />
              </div>
              <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-gray-500">Total Uang yang Diterima</p>
                {/* Menggunakan totalCoins sesuai permintaan gambar, bukan coinRemaining */}
                <StatDisplay value={user?.totalCoins || 0} prefix="Rp "/> 
              </div>
            </div>
            {/* Kolom Kanan */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-gray-500">Total Penukaran Koin</p>
                {/* Menggunakan totalCoins (koin saat ini) sesuai gambar */}
                <StatDisplay value={user?.totalCoins || 0} />
              </div>
              <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-gray-500">Total Koin yang Diperoleh</p>
                <StatDisplay value={user?.coinExchanged || 0} />
              </div>
            </div>
          </div>

          {/* Menu Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-black">Menu</h3>
              <p className="text-gray-500">Tukarkan Sampah atau Koinmu disini!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/tukar-sampah">
                <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">Tukar Sampah</Button>
              </Link>
              <Link href="/tukar-poin">
                <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">Tukar Koin</Button>
              </Link>
            </div>
            <Link href="/history-transaksi">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">History Transaksi</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <PrivateRoute requiredRole="customer">
      <DashboardContent />
    </PrivateRoute>
  )
}