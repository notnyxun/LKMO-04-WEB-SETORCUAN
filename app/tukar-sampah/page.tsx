"use client"

import type React from "react"
import { PrivateRoute } from "@/components/private-route"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { sendWhatsAppMessage } from "@/lib/fonnte"
import Link from "next/link"

const LOCATIONS = [
  { id: "lokasi1", name: "Lokasi 1 - Almamater Langkap", lat: -6.2, lng: 106.8 },
  { id: "lokasi2", name: "Lokasi 2 - Almamater Langkap", lat: -6.21, lng: 106.81 },
  { id: "lokasi3", name: "Lokasi 3 - Almamater Langkap", lat: -6.22, lng: 106.82 },
]

function TukarSampahContent() {
  const { user, addTransaction, get } = useAuthStore()
  const [formData, setFormData] = useState({
    kategori: "plastik",
    berat: "",
    deskripsi: "",
    locationId: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const poinSampah: Record<string, number> = {
    plastik: 5000,
    kardus: 4000,
    kaca: 7000,
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.locationId) {
      alert("Pilih lokasi pengambilan terlebih dahulu")
      return
    }

    setLoading(true)

    const poin = Number(formData.berat) * poinSampah[formData.kategori]
    const selectedLocation = LOCATIONS.find((l) => l.id === formData.locationId)

    const transaction = {
      id: `TRX-${String(get().transactions.length + 1).padStart(3, "0")}`,
      type: "sampah" as const,
      userId: user?.id || "",
      username: user?.username || "",
      locationId: formData.locationId,
      locationName: selectedLocation?.name,
      kategori: formData.kategori,
      berat: Number(formData.berat),
      harga: poin,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addTransaction(transaction)

    await sendWhatsAppMessage(
      user?.whatsapp || "",
      `Halo ${user?.username}! Permintaan tukar sampah kamu diterima.\nKategori: ${formData.kategori}\nBerat: ${formData.berat} kg\nLokasi: ${selectedLocation?.name}\nPoin: ${poin} poin\nStatus: Pending konfirmasi\nAdmin akan menghubungi kamu segera.`,
    )

    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setFormData({ kategori: "plastik", berat: "", deskripsi: "", locationId: "" })
    }, 3000)

    setLoading(false)
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Tukar Sampah</h1>
          <p className="text-gray-600">Tukarkan sampahmu dengan poin yang menguntungkan</p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-8">
          <p className="text-sm text-gray-700">
            <strong>Poin Sampah:</strong> Plastik 5000 poin/kg | Kardus 4000 poin/kg | Kaca 7000 poin/kg
          </p>
          <p className="text-xs text-gray-600 mt-2">1 poin = Rp 1 (satu rupiah)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-300 rounded-lg p-6">
              <div>
                <label className="block text-sm font-medium mb-2">Kategori Sampah</label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="w-full bg-gray-100 border border-gray-300 rounded-md p-3"
                >
                  <option value="plastik">Plastik</option>
                  <option value="kardus">Kardus</option>
                  <option value="kaca">Kaca</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Berat Sampah (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="berat"
                  value={formData.berat}
                  onChange={handleChange}
                  className="w-full bg-gray-100 border border-gray-300 rounded-md p-3"
                  placeholder="Contoh: 5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pilih Lokasi Pengambilan</label>
                <select
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleChange}
                  className="w-full bg-gray-100 border border-gray-300 rounded-md p-3"
                  required
                >
                  <option value="">-- Pilih Lokasi --</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deskripsi (Opsional)</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  className="w-full bg-gray-100 border border-gray-300 rounded-md p-3 h-20"
                  placeholder="Deskripsi sampah atau catatan tambahan"
                />
              </div>

              {formData.berat && (
                <div className="bg-green-100 border border-green-400 rounded-md p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Total Poin:</strong> {Number(formData.berat) * poinSampah[formData.kategori]} poin
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    = Rp {(Number(formData.berat) * poinSampah[formData.kategori]).toLocaleString()}
                  </p>
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded-md text-sm">
                  ✓ Permintaan tukar sampah berhasil dikirim! Status: Pending. Admin akan menghubungi kamu segera.
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !formData.berat || !formData.locationId}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium"
              >
                {loading ? "Mengirim..." : "Kirim Permintaan"}
              </Button>
            </form>
          </div>

          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <div className="bg-gray-200 rounded-lg h-96 flex flex-col items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 mb-4">📍 Peta Lokasi Pengambilan</p>
                <div className="space-y-2">
                  {LOCATIONS.map((loc) => (
                    <div key={loc.id} className="bg-white p-3 rounded border border-gray-300">
                      <p className="text-sm font-medium text-black">{loc.name}</p>
                      <p className="text-xs text-gray-500">
                        Lat: {loc.lat}, Lng: {loc.lng}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">(Google Maps akan diintegrasikan dengan API key)</p>
              </div>
            </div>
          </div>
        </div>

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

export default function TukarSampahPage() {
  return (
    <PrivateRoute requiredRole="user">
      <TukarSampahContent />
    </PrivateRoute>
  )
}
