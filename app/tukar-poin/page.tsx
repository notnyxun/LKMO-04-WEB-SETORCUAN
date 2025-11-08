"use client"

import type React from "react"
import { useState, useMemo } from "react"

import { PrivateRoute } from "@/components/private-route"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { sendWhatsAppMessage } from "@/lib/fonnte"
import Link from "next/link"

function TukarKoinContent() {
  const { user, addTransaction, getNextTransactionId } = useAuthStore()
  const pendingTransactions = useAuthStore((state) => state.transactions)

  const [formData, setFormData] = useState({
    jumlahKoin: "",
    metode: user?.ewallet || "ovo",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const koinValue = 1

  const hasPendingKoin = useMemo(() => {
    if (!user) return false
    // Cek daftar transaksi pending
    return pendingTransactions
      .filter(t => t.userId === user.id) // Filter untuk user ini
      .some(t => t.type === "koin") // Cek apakah ada yang tipenya "koin"
  }, [pendingTransactions, user]) // Akan dicek ulang jika daftar transaksi berubah

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (hasPendingKoin) {
      setError("Kamu sudah memiliki penukaran yang sedang diproses. Tunggu hingga statusnya berubah sebelum menukar lagi.")
      return
    }

    setLoading(true)

    const jumlahKoin = Number(formData.jumlahKoin)
    if (jumlahKoin <= 0 || jumlahKoin > (user?.totalCoins || 0)) {
      setError("Jumlah koin tidak valid")
      setLoading(false)
      return
    }

    const nominal = jumlahKoin * koinValue

    const transaction = {
      id: getNextTransactionId(),
      type: "koin" as const,
      userId: user?.id || "",
      username: user?.username || "",
      coins: jumlahKoin,
      harga: nominal,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addTransaction(transaction)

    await sendWhatsAppMessage(
      user?.whatsapp || "",
      `Halo ${user?.username}! Permintaan tukar koin kamu diterima.\nJumlah Koin: ${jumlahKoin.toLocaleString("id-ID")}\nNominal: Rp ${nominal.toLocaleString("id-ID")}\nMetode: ${formData.metode}\nStatus: Pending konfirmasi\nAdmin akan menghubungi kamu segera.`,
    )

    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setFormData({ jumlahKoin: "", metode: user?.ewallet || "ovo" })
    }, 3000)

    setLoading(false)
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-white">
      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Tukar Koin</h1>
          <p className="text-gray-600">Tukarkan koinmu dengan uang tunai</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 border border-green-300 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Koin Kamu</p>
            <p className="text-3xl font-bold text-green-600">{(user?.totalCoins || 0).toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
            <p className="text-sm text-gray-600">Nilai Per Koin</p>
            <p className="text-3xl font-bold text-blue-600">Rp {koinValue.toLocaleString("id-ID")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-300 rounded-lg p-6">
          <div>
            <label className="block text-sm font-medium mb-2">Jumlah Koin (Maksimal: {(user?.totalCoins || 0).toLocaleString("id-ID")})</label>
            <input
              type="number"
              name="jumlahKoin"
              value={formData.jumlahKoin}
              onChange={handleChange}
              className="w-full bg-gray-100 border border-gray-300 rounded-md p-3"
              placeholder="Masukkan jumlah koin"
              max={user?.totalCoins}
              required
              disabled={hasPendingKoin || loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Metode Penerima</label>
            <select
              name="metode"
              value={formData.metode}
              onChange={handleChange}
              className="w-full bg-gray-100 border border-gray-300 rounded-md p-3"
              disabled={hasPendingKoin || loading}
            >
              <option value={user?.ewallet}>{user?.ewallet?.toUpperCase()}</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          {formData.jumlahKoin && !hasPendingKoin && ( 
            <div className="bg-green-100 border border-green-400 rounded-md p-4">
              <p className="text-sm text-gray-700">
                <strong>Nominal Uang:</strong> Rp {(Number(formData.jumlahKoin) * koinValue).toLocaleString("id-ID")}
              </p>
            </div>
          )}

          {}
          {hasPendingKoin && !success && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-3 rounded-md text-sm">
              Kamu sudah memiliki penukaran yang sedang diproses. Tunggu hingga statusnya berubah sebelum menukar lagi.
            </div>
          )}

          {error && !hasPendingKoin && ( // Hanya tampilkan error submit jika BUKAN error pending
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded-md text-sm">
              ✓ Permintaan tukar koin berhasil dikirim! Status: Pending. Admin akan menghubungi kamu segera.
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !formData.jumlahKoin || hasPendingKoin}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium"
          >
            {}
            {loading ? "Memproses..." : (hasPendingKoin ? "Penukaran Diproses" : "Tukar Koin")}
          </Button>
        </form>

        {/* History Link */}
        <div className="mt-8">
          <Link href="/history-transaksi">
            <Button variant="outline" className="bg-white">
              Lihat History Transaksi
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function TukarKoinPage() {
  return (
    <PrivateRoute requiredRole="user">
      <TukarKoinContent />
    </PrivateRoute>
  )
}