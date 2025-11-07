"use client"

import { PrivateRoute } from "@/components/private-route"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

function HistoryContent() {
  // 1. Mengambil getTransactionHistory
  const { user, getTransactions, getTransactionHistory } = useAuthStore()
  const [filterStatus, setFilterStatus] = useState("all")

  // 2. Mengambil kedua daftar transaksi
  const userId = user?.role === "admin" ? undefined : user?.id
  const pendingTransactions = getTransactions(userId)
  const historyTransactions = getTransactionHistory(userId)

  // 3. Menggabungkan dan mengurutkan semua transaksi berdasarkan tanggal terbaru
  const allTransactions = [...pendingTransactions, ...historyTransactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  // 4. Filter sekarang diterapkan ke semua transaksi
  const filteredTransactions =
    filterStatus === "all" ? allTransactions : allTransactions.filter((t) => t.status === filterStatus)

  const isAdmin = user?.role === "admin"

  return (
    <main className="min-h-[calc(100vh-64px)] bg-white">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">History Transaksi {isAdmin ? "Customer" : ""}</h1>
          <p className="text-gray-600">Riwayat semua transaksi tukar sampah dan tukar poin</p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md p-2 bg-white"
          >
            <option value="all">Semua</option>
            <option value="pending">Pending</option>
            <option value="berhasil">Berhasil</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
          <Button variant="outline" className="ml-auto bg-transparent">
            ↻ Refresh
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="border border-green-700 p-4 text-left font-semibold">No</th>
                <th className="border border-green-700 p-4 text-left font-semibold">ID Transaksi</th>
                {isAdmin && <th className="border border-green-700 p-4 text-left font-semibold">ID User</th>}
                <th className="border border-green-700 p-4 text-left font-semibold">Tipe</th>
                {isAdmin && <th className="border border-green-700 p-4 text-left font-semibold">Username</th>}
                <th className="border border-green-700 p-4 text-left font-semibold">Detail</th>
                <th className="border border-green-700 p-4 text-left font-semibold">Poin</th>
                <th className="border border-green-700 p-4 text-left font-semibold">Status</th>
                <th className="border border-green-700 p-4 text-left font-semibold">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((trans, idx) => (
                  <tr key={trans.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-4 text-black">{idx + 1}</td>
                    <td className="border border-gray-300 p-4 text-black font-mono text-sm">{trans.id}</td>
                    {isAdmin && (
                      <td className="border border-gray-300 p-4 text-black font-mono text-sm">{trans.userId}</td>
                    )}
                    <td className="border border-gray-300 p-4 text-black capitalize">
                      {trans.type === "sampah" ? "Tukar Sampah" : "Tukar Poin"}
                    </td>
                    {isAdmin && <td className="border border-gray-300 p-4 text-black">{trans.username}</td>}
                    <td className="border border-gray-300 p-4 text-black text-sm">
                      {trans.type === "sampah"
                        ? `${trans.kategori} - ${trans.berat}kg (${trans.locationName})`
                        : `${trans.coins} Coins`}
                    </td>
                    <td className="border border-gray-300 p-4 text-black">{trans.harga} poin</td>
                    <td className="border border-gray-300 p-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${
                          trans.status === "pending"
                            ? "bg-yellow-500"
                            : trans.status === "berhasil"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      >
                        {trans.status === "pending"
                          ? "Pending"
                          : trans.status === "berhasil"
                          ? "Berhasil"
                          : "Dibatalkan"}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-4 text-black text-sm">
                      {new Date(trans.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="border border-gray-300 p-4 text-center text-gray-500">
                    Tidak ada transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Link href={user?.role === "admin" ? "/admin" : "/dashboard"}>
            <Button className="bg-green-600 hover:bg-green-700">Kembali ke Dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function HistoryTransaksiPage() {
  return (
    <PrivateRoute>
      <HistoryContent />
    </PrivateRoute>
  )
}