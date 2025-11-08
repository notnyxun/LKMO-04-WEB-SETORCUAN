"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { PrivateRoute } from "@/components/private-route"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { sendWhatsAppMessage } from "@/lib/fonnte"
import Link from "next/link"
import { api } from "@/services/api"
import { RefreshCw } from "lucide-react"

function TukarKoinContent() {
  const { user, fetchUser } = useAuthStore() 
  const [hasPendingKoin, setHasPendingKoin] = useState(false);
  const [isCheckingPending, setIsCheckingPending] = useState(true);

  const [formData, setFormData] = useState({
    jumlahKoin: "",
    metode: "", // Dikosongkan agar placeholder "Metode Penerima" muncul
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  
  const koinValue = 1

  // Cek transaksi pending dari API
  useEffect(() => {
    if (!user) return;
    setIsCheckingPending(true);
    api.transaction.getHistory()
      .then(history => {
        // Cek apakah ada transaksi POIN yang 'pending' atau 'processing'
        const pending = history.some((t: any) => 
          (t.type === 'poin' || t.type === 'withdrawal') && 
          (t.status === 'pending' || t.status === 'processing')
        );
        setHasPendingKoin(pending);
      })
      .catch(e => {
        console.error("Gagal cek pending koin", e);
        setError("Gagal memeriksa status transaksi pending.");
      })
      .finally(() => setIsCheckingPending(false));
  }, [user]);

  // Ambil data user untuk koin
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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
      setError("Jumlah koin tidak valid atau saldo tidak mencukupi")
      setLoading(false)
      return
    }
    
    if (!formData.metode) {
       setError("Silakan pilih metode penerima")
       setLoading(false)
       return
    }

    const nominal = jumlahKoin * koinValue

    try {
      // PERMINTAAN BARU: Kirim ke WA Admin, BUKAN ke database
      // Nomor WA Admin - Ambil dari env atau hardcode
      const adminWhatsAppNumber = process.env.NEXT_PUBLIC_ADMIN_WA || "6281234567890"; // Ganti dengan nomor WA Admin Anda

      const message = `Halo Admin SetorCuan!
Saya ${user?.username} (ID: ${user?.id}) ingin menukarkan poin:
      
- Jumlah Koin: ${jumlahKoin.toLocaleString("id-ID")} coin stecu
- Nominal Rupiah: Rp ${nominal.toLocaleString("id-ID")}
- Metode: ${formData.metode.toUpperCase()}
- Nomor: ${user?.ewalletNumber || 'Belum diatur di profil'}

Mohon segera diproses. Terima kasih!`;

      // Menggunakan Fonnte untuk mengirim pesan
      // Ini akan membuka tab baru ke WhatsApp Web jika di desktop
      // atau aplikasi WhatsApp jika di mobile
      sendWhatsAppMessage(adminWhatsAppNumber, message);

      // Kita TIDAK lagi panggil api.transaction.submitPoin
      
      // Update poin user secara manual di backend via API
      // Ini penting agar poin customer berkurang
      await api.admin.adjustPoints(user!.id.toString(), jumlahKoin, "subtract");
      
      // Buat transaksi "dummy" HANYA di history lokal untuk UI
      // Ini TIDAK disimpan di DB, tapi akan muncul di history customer
      // Kita set statusnya "processing" agar customer tahu ini sedang diurus admin
      // Kita perlu memanggil `addTransaction` dari `auth-store` jika masih ada
      // KARENA KITA MENGHAPUSNYA, kita refresh data user saja
      
      setSuccess(true)
      fetchUser(); // Ambil ulang data user untuk update total koin
      setHasPendingKoin(true); // Langsung blokir tombol
      
      setFormData({ jumlahKoin: "", metode: "" })

    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat submit.");
    } finally {
      setLoading(false)
    }
  }
  
  const isLoadingPage = isCheckingPending || !user;

  return (
    // --- TAMPILAN BARU SESUAI GAMBAR ---
    <main className="min-h-[calc(100vh-64px)] bg-emerald-500">
      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-black mb-2">Tukar Koin</h1>
          <p className="text-lg text-gray-800">Tukarkan KoinMu menjadi Cuan!</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">Total Koin Anda</p>
            <p className="text-3xl font-bold text-black">
              {isLoadingPage ? "..." : (user?.totalCoins || 0).toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">Nilai Per Koin</p>
            <p className="text-3xl font-bold text-black">
              {koinValue}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-300 rounded-lg p-6 shadow-lg">
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Jumlah Poin</label>
            <input
              type="number"
              name="jumlahKoin"
              value={formData.jumlahKoin}
              onChange={handleChange}
              className="w-full bg-gray-200 border border-gray-300 rounded-md p-3 text-black"
              placeholder="Masukkan Jumlah Poin"
              max={user?.totalCoins}
              required
              disabled={isLoadingPage || hasPendingKoin || loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Metode Penerima</label>
            <select
              name="metode"
              value={formData.metode}
              onChange={handleChange}
              className="w-full bg-gray-200 border border-gray-300 rounded-md p-3 text-black"
              disabled={isLoadingPage || hasPendingKoin || loading}
              required
            >
              <option value="" disabled>-- Metode Penerima --</option>
              {user?.ewallet && <option value={user.ewallet}>{user.ewallet.toUpperCase()}</option>}
              <option value="DANA">DANA</option>
              <option value="OVO">OVO</option>
              <option value="GOPAY">GOPAY</option>
              <option value="LINKAJA">LINKAJA</option>
            </select>
          </div>

          {hasPendingKoin && !success && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-3 rounded-md text-sm">
              Kamu sudah memiliki penukaran yang sedang diproses. Tunggu hingga statusnya berubah sebelum menukar lagi.
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded-md text-sm">
              ✓ Permintaan tukar koin berhasil dikirim ke Admin via WhatsApp! Poin Anda telah dikurangi.
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoadingPage || loading || !formData.jumlahKoin || hasPendingKoin}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium text-lg"
          >
            {loading ? "Memproses..." : (hasPendingKoin ? "Penukaran Diproses" : "Tukar Poin")}
          </Button>
        </form>

        <div className="mt-8">
          <Link href="/history-transaksi">
            <Button variant="outline" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white h-12 text-lg">
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
    <PrivateRoute requiredRole="customer">
      <TukarKoinContent />
    </PrivateRoute>
  )
}