"use client"

import { PrivateRoute } from "@/components/private-route"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

function AdminContent() {
  const { user, getTransactions, logout, updateTransactionStatus, updateUserCoins, cancelTransaction } = useAuthStore()
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState("all")
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<"berhasil" | "dibatalkan" | null>(null)

  const [showManageCoins, setShowManageCoins] = useState(false)
  const [coinForm, setCoinForm] = useState({
    userId: "",
    amount: 0,
    operation: "add" as "add" | "subtract",
  })

  const allTransactions = getTransactions().filter((t) => t.status === "pending")
  const filteredTransactions =
    filterStatus === "all" ? allTransactions : allTransactions.filter((t) => t.status === filterStatus)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleStatusChange = (transactionId: string, newStatus: "berhasil" | "dibatalkan") => {
    updateTransactionStatus(transactionId, newStatus)
    setEditingTransactionId(null)
  }

  const handleCancelTransaction = (transactionId: string) => {
    handleStatusChange(transactionId, "dibatalkan")
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

  const stats = {
    total: allTransactions.length,
    baru: allTransactions.filter((t) => t.status === "pending").length,
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-green-500">
      {/* Profile Section */}
      <div className="bg-green-500 text-white p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gray-300 rounded-full" />
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-green-100">Administrator</p>
              <p className="text-green-100">Your ID: {user?.id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/history-transaksi">
              <Button className="bg-green-700 hover:bg-green-800">History Transaksi</Button>
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
          <h2 className="text-3xl font-bold mb-2 text-black">Record Permintaan Penukaran</h2>
          <p className="text-muted-foreground mb-8">Request Penukaran Koin dari Customer (Hanya yang Pending)</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border-2 border-gray-300 rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Total Request Pending</p>
              <p className="text-4xl font-bold text-black">{stats.total}</p>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">Request Baru</p>
              <p className="text-4xl font-bold text-black">{stats.baru}</p>
            </div>
          </div>

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

          {/* Filter & Table */}
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
          </div>

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
                    <div className="text-sm font-mono">{trans.userId}</div>
                    <div className="font-medium">{trans.username}</div>
                    <div className="capitalize">{trans.type === "sampah" ? "Sampah" : "Poin"}</div>
                    <div className="text-sm">
                      {trans.type === "sampah" ? `${trans.kategori} ${trans.berat}kg` : `${trans.coins} Coins`}
                    </div>
                    <div className="font-medium">{trans.harga.toLocaleString()} poin</div>
                    <div>
                      {editingTransactionId === trans.id ? (
                        <select
                          value={selectedStatus || "pending"}
                          onChange={(e) => setSelectedStatus(e.target.value as "berhasil" | "dibatalkan")}
                          className="bg-white text-black rounded p-1 text-sm border border-gray-300"
                        >
                          <option value="berhasil">Berhasil</option>
                          <option value="dibatalkan">Dibatalkan</option>
                        </select>
                      ) : (
                        <span className="capitalize font-medium">Pending</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {editingTransactionId === trans.id ? (
                        <>
                          <Button
                            onClick={() => handleStatusChange(trans.id, selectedStatus || "berhasil")}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 h-auto"
                          >
                            Simpan
                          </Button>
                          <Button
                            onClick={() => setEditingTransactionId(null)}
                            className="bg-gray-500 hover:bg-gray-600 text-white text-xs py-1 px-2 h-auto"
                          >
                            Batal
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => {
                              setEditingTransactionId(trans.id)
                              setSelectedStatus("berhasil")
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1 px-2 h-auto"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleCancelTransaction(trans.id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 h-auto"
                          >
                            Batal
                          </Button>
                        </>
                      )}
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
