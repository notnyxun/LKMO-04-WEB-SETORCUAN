"use client"

import { PrivateRoute } from "@/components/private-route"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

function DashboardContent() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-green-500">
      {/* Profile Section */}
      <div className="bg-green-500 text-white p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gray-300 rounded-full" />
            <div>
              <h1 className="text-3xl font-bold">{user?.username}</h1>
              <p className="text-green-100">{user?.role}</p>
              <p className="text-green-100">Your ID: {user?.id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/profile">
              <Button className="bg-green-700 hover:bg-green-800">Edit Profile</Button>
            </Link>
            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-black">Record Daur Ulang</h2>
          <p className="text-muted-foreground mb-6">Track Progress Daur Ulangmu!</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-gray-300 rounded-lg p-6">
              <p className="text-muted-foreground">Total Daur Ulang (kg)</p>
              <p className="text-4xl font-bold text-black">{user?.totalKg}</p>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-6">
              <p className="text-muted-foreground">Total Koin yang Diperoleh</p>
              <p className="text-4xl font-bold text-black">{user?.coinExchanged}</p>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-6">
              <p className="text-muted-foreground">Total Penukaran Koin</p>
              <p className="text-4xl font-bold text-black">{user?.totalCoins}</p>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-6">
              <p className="text-muted-foreground">Total Uang yang Diterima</p>
              <p className="text-4xl font-bold text-black">Rp {user?.coinRemaining * 1000}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-black mb-4">Menu Utama</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/tukar-sampah">
                <Button className="w-full bg-green-600 hover:bg-green-700 h-12">Tukar Sampah</Button>
              </Link>
              <Link href="/tukar-poin">
                <Button className="w-full bg-green-600 hover:bg-green-700 h-12">Tukar Poin</Button>
              </Link>
              <Link href="/history-transaksi">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12">History Transaksi</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <PrivateRoute requiredRole="user">
      <DashboardContent />
    </PrivateRoute>
  )
}
