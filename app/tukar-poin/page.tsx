"use client"

import type React from "react"

import { PrivateRoute } from "@/components/private-route"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { sendWhatsAppMessage } from "@/lib/fonnte"
import Link from "next/link"

function TukarPoinContent() {
  const { user, addTransaction } = useAuthStore()
  const [formData, setFormData] = useState({
    jumlahPoin: "",
    metode: user?.ewallet || "ovo",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const poinValue = 1 // Fixed: 1 poin = Rp 1 (not Rp 1000)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const jumlahPoin = Number(formData.jumlahPoin)
    if (jumlahPoin <= 0 || jumlahPoin > (user?.totalCoins || 0)) {
      setError("Jumlah poin tidak valid")
      setLoading(false)
      return
    }

    const nominal = jumlahPoin * poinValue

    const transaction = {
      id: `TRX-${String(user?.transactions?.length + 1 || 1).padStart(3, "0")}`,
      type: "poin" as const,
      userId: user?.id || "",
      username: user?.username || "",
      coins: jumlahPoin,
      harga: nominal,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addTransaction(transaction)

    await sendWhatsAppMessage(
      user?.whatsapp || "",
      `Halo ${user?.username}! Permintaan tukar poin kamu diterima.\nJumlah Poin: ${jumlahPoin}\nNominal: Rp ${nominal.toLocaleString()}\nMetode: ${formData.metode}\nStatus: Pending konfirmasi\nAdmin akan menghubungi kamu segera.`,
    )

    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setFormData({ jumlahPoin: "", metode: user?.ewallet || "ovo" })
    }, 3000)

    setLoading(false)
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-white">
      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Tukar Poin</h1>
          <p className="text-gray-600">Tukarkan poinmu dengan uang tunai</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 border border-green-300 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Poin Kamu</p>
            <p className="text-3xl font-bold text-green-600">{user?.totalCoins}</p>
          </div>
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
            <p className="text-sm text-gray-600">Nilai Per Poin</p>
            <p className="text-3xl font-bold text-blue-600">Rp {poinValue.toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-300 rounded-lg p-6">
          <div>
            <label className="block text-sm font-medium mb-2">Jumlah Poin (Maksimal: {user?.totalCoins})</label>
            <input
              type="number"
              name="jumlahPoin"
              value={formData.jumlahPoin}
              onChange={handleChange}
              className="w-full bg-gray-100 border border-gray-300 rounded-md p-3"
              placeholder="Masukkan jumlah poin"
              max={user?.totalCoins}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Metode Penerima</label>
            <select
              name="metode"
              value={formData.metode}
              onChange={handleChange}
              className="w-full bg-gray-100 border border-gray-300 rounded-md p-3"
            >
              <option value={user?.ewallet}>{user?.ewallet.toUpperCase()}</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          {formData.jumlahPoin && (
            <div className="bg-green-100 border border-green-400 rounded-md p-4">
              <p className="text-sm text-gray-700">
                <strong>Nominal Uang:</strong> Rp {(Number(formData.jumlahPoin) * poinValue).toLocaleString()}
              </p>
            </div>
          )}

          {error && <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md text-sm">{error}</div>}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded-md text-sm">
              ✓ Permintaan tukar poin berhasil dikirim! Status: Pending. Admin akan menghubungi kamu segera.
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !formData.jumlahPoin}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium"
          >
            {loading ? "Memproses..." : "Tukar Poin"}
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

export default function TukarPoinPage() {
  return (
    <PrivateRoute requiredRole="user">
      <TukarPoinContent />
    </PrivateRoute>
  )
}
