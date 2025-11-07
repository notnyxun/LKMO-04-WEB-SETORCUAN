"use client"

import { PrivateRoute } from "@/components/private-route"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image" // Import Image

function AdminContent() {
  // Menambahkan getTransactionHistory untuk statistik
  const {
    user,
    getTransactions,
    logout,
    updateTransactionStatus,
    updateUserCoins,
    cancelTransaction,
    getTransactionHistory, // Ditambahkan
  } = useAuthStore()
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState("all")

  const [showManageCoins, setShowManageCoins] = useState(false)
  const [coinForm, setCoinForm] = useState({
    userId: "",
    amount: 0,
    operation: "add" as "add" | "subtract",
  })

  // Logika statistik baru
  const allPendingTransactions = getTransactions().filter((t) => t.status === "pending")
  const allHistoryTransactions = getTransactionHistory()

  const filteredTransactions =
    filterStatus === "all" ? allPendingTransactions : allPendingTransactions.filter((t) => t.status === filterStatus)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleStatusChange = (transactionId: string, newStatus: "berhasil" | "dibatalkan") => {
    updateTransactionStatus(transactionId, newStatus)
  }

  const handleCancelTransaction = (transactionId: string) => {
    handleStatusChange(transactionId, "dibatalkan")
  }

  const handleSuccessTransaction = (transactionId: string) => {
    handleStatusChange(transactionId, "berhasil")
  }

  const handleManageCoins = () => {
    if (!coinForm.userId || coinForm.amount <= 0) {
      alert("Masukkan User ID dan jumlah poin yang valid")
      return
    }
    updateUserCoins(coinForm.userId, coinForm.amount, coinForm.operation)
    setCoinForm({ userId: "", amount: 0, operation: "add" })
    setShowManageCoins(false)
    alert("Poin user berhasil diperbarui")
  }

  // Statistik diperbarui sesuai gambar
  const stats = {
    total: allPendingTransactions.length + allHistoryTransactions.length,
    baru: allPendingTransactions.length,
    pending: allPendingTransactions.length,
    selesai: allHistoryTransactions.filter((t) => t.status === "berhasil").length,
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-green-500">
      {/* Profile Section - Diperbarui Sesuai Gambar */}
      <div className="bg-green-500 text-white p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <Image
              src="/placeholder-user.jpg"
              alt="Admin Avatar"
              width={96}
              height={96}
              className="rounded-full bg-gray-300 w-24 h-24"
            />
            <div>
              <h1 className="text-3xl font-bold">{user?.username}</h1>
              <p className="text-green-100">Admin</p>
              <p className="text-green-100">Your ID: {user?.id}</p>
            </div>
          </div>
          {/* Tombol Logout di sini telah dihapus */}
          <div className="flex gap-3">
            <Link href="/history-transaksi">
              <Button className="bg-green-700 hover:bg-green-800">History Transaksi</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section - Diperbarui Sesuai Gambar */}
      <div className="bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-black">Record Permintaan Penukaran</h2>
          <p className="text-muted-foreground mb-8">Request Penukaran Koin dari Customer</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="border-2 border-gray-300 rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Total Request Penukaran Koin</p>
              <p className="text-4xl font-bold text-black">{stats.total}</p>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Request Baru</p>
              <p className="text-4xl font-bold text-black">{stats.baru}</p>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Pending</p>
              <p className="text-4xl font-bold text-black">{stats.pending}</p>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Selesai</p>
              <p className="text-4xl font-bold text-black">{stats.selesai}</p>
            </div>
          </div>

          {/* Bagian Kelola Poin (Tetap Sama) */}
          <div className="mb-8 bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
            <h3 className="text-lg font-bold mb-4 text-black">Kelola Poin User</h3>
            {!showManageCoins ? (
              <Button onClick={() => setShowManageCoins(true)} className="bg-blue-600 hover:bg-blue-700">
                + Tambah/Kurang Poin
              </Button>
            ) : (
              <div className="space-y-4 bg-white p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black">User ID</label>
                    <input
                      type="text"
                      placeholder="Cth: 1231456"
                      value={coinForm.userId}
                      onChange={(e) => setCoinForm({ ...coinForm, userId: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-md p-3 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black">Jumlah Poin</label>
                    <input
                      type="number"
                      placeholder="Masukkan jumlah poin"
                      value={coinForm.amount}
                      onChange={(e) => setCoinForm({ ...coinForm, amount: Number(e.target.value) })}
                      className="w-full bg-white border border-gray-300 rounded-md p-3 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black">Operasi</label>
                    <select
                      value={coinForm.operation}
                      onChange={(e) => setCoinForm({ ...coinForm, operation: e.target.value as "add" | "subtract" })}
                      className="w-full bg-white border border-gray-300 rounded-md p-3 text-black"
                    >
                      <option value="add">Tambah Poin</option>
                      <option value="subtract">Kurang Poin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleManageCoins} className="bg-blue-600 hover:bg-blue-700">
                    Simpan Perubahan
                  </Button>
                  <Button
                    onClick={() => setShowManageCoins(false)}
                    variant="outline"
                    className="bg-gray-300 hover:bg-gray-400 text-black"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Filter & Table - Filter disesuaikan dengan gambar */}
          <div className="mb-4 flex items-center gap-2">
            <label className="text-foreground text-black font-medium">Filter Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md p-2 bg-white text-black"
            >
              <option value="all">Semua</option>
              <option value="pending">Pending</option>
            </select>
            <Button variant="outline" size="icon" className="w-9 h-9">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-refresh-cw w-4 h-4"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M3 21a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 16" />
                <path d="M21 11v5h-5" />
              </svg>
            </Button>
          </div>

          {/* Tabel Aksi (Tetap Sama Sesuai Permintaan Sebelumnya) */}
          <div className="bg-green-500 text-white rounded-lg overflow-hidden">
            <div className="grid grid-cols-8 gap-4 p-4 font-bold bg-green-600">
              <div>ID Transaksi</div>
              <div>ID User</div>
              <div>Username</div>
              <div>Tipe</div>
              <div>Detail</div>
              <div>Poin</div>
              <div>Status</div>
              <div>Aksi</div>
            </div>
            <div className="divide-y">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((trans, idx) => (
                  <div key={trans.id} className="grid grid-cols-8 gap-4 p-4 bg-green-50 text-black border-b">
                    <div className="text-sm font-mono">{trans.id}</div>
                    <div classNameVame="text-sm font-mono">{trans.userId}</div>
                    <div className="font-medium">{trans.username}</div>
                    <div className="capitalize">{trans.type === "sampah" ? "Sampah" : "Poin"}</div>
                    <div className="text-sm">
                      {trans.type === "sampah" ? `${trans.kategori} ${trans.berat}kg` : `${trans.coins} Coins`}
                    </div>
                    <div className="font-medium">{trans.harga.toLocaleString()} poin</div>
                    <div>
                      <span className="capitalize font-medium">Pending</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleSuccessTransaction(trans.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 h-auto"
                      >
                        Berhasil
                      </Button>
                      <Button
                        onClick={() => handleCancelTransaction(trans.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 h-auto"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-8 gap-4 p-4 bg-green-100 text-black">
                  <div colSpan={8} className="text-center font-medium">
                    Tidak ada transaksi pending
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function AdminPage() {
  return (
    <PrivateRoute requiredRole="admin">
      <AdminContent />
    </PrivateRoute>
  )
}