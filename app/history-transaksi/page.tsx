"use client"

import { PrivateRoute } from "@/components/private-route"
import { useAuthStore, Transaction } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { api } from "@/services/api"
import { RefreshCw } from "lucide-react"

function HistoryContent() {
  const { user } = useAuthStore()
  const [filterStatus, setFilterStatus] = useState("all")
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const isAdmin = user?.role === "admin"

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: Transaction[] = isAdmin 
        ? await api.admin.getTransactions() 
        : await api.transaction.getHistory();
      setAllTransactions(data);
    } catch (error) {
      console.error("Gagal mengambil history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredTransactions(allTransactions);
    } else {
      setFilteredTransactions(allTransactions.filter((t) => getStatusText(t.status) === filterStatus));
    }
  }, [filterStatus, allTransactions]);

  const censorId = (id: string | number) => {
    const idStr = String(id);
    if (idStr.length <= 2) return idStr;
    return `${idStr.charAt(0)}...${idStr.slice(-1)}`;
  }
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'berhasil':
      case 'validated':
      case 'completed':
        return 'berhasil';
      case 'dibatalkan':
      case 'rejected':
      case 'cancelled':
        return 'dibatalkan';
      case 'processing':
        return 'processing';
      case 'pending':
      default:
        return 'pending';
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-emerald-500 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">History Transaksi {isAdmin ? "Customer" : ""}</h1>
          <p className="text-gray-600">Riwayat semua transaksi tukar sampah dan tukar poin</p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md p-2 bg-white"
          >
            <option value="all">Semua</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="berhasil">Berhasil</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
          <Button variant="outline" className="ml-auto bg-white border-gray-300 hover:bg-gray-50 text-black" onClick={fetchHistory} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'mr-2'}`} />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="p-4 text-left font-semibold">No</th>
                <th className="p-4 text-left font-semibold">ID Transaksi</th>
                {isAdmin && <th className="p-4 text-left font-semibold">ID User</th>}
                <th className="p-4 text-left font-semibold">Tipe</th>
                {isAdmin && <th className="p-4 text-left font-semibold">Username</th>}
                <th className="p-4 text-left font-semibold">Detail</th>
                <th className="p-4 text-left font-semibold">Poin</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Tanggal</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading && (
                 <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="border-b border-gray-200 p-4 text-center text-gray-500">
                    Loading data...
                  </td>
                </tr>
              )}
              {!isLoading && filteredTransactions.length > 0 ? (
                filteredTransactions.map((trans, idx) => {
                  const displayStatus = getStatusText(trans.status);
                  const isSampah = trans.type === "sampah" || trans.type === "deposit";
                  
                  // --- INI PERBAIKANNYA ---
                  const userId = isAdmin ? trans.user?.id : trans.userId;
                  const username = isAdmin ? trans.user?.username : trans.username;
                  // --- BATAS PERBAIKAN ---

                  return (
                    <tr key={trans.id} className="hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                      <td className="p-4 text-black">{idx + 1}</td>
                      <td className="p-4 text-black font-mono text-sm truncate" title={trans.id}>{trans.id.substring(0, 8)}...</td>
                      
                      {isAdmin && (
                        <td className="p-4 text-black font-mono text-sm">{censorId(userId || 'N/A')}</td>
                      )}
                      
                      <td className="p-4 text-black capitalize">
                        {isSampah ? "Tukar Sampah" : "Tukar Poin"}
                      </td>
                      
                      {isAdmin && <td className="p-4 text-black">{username || 'N/A'}</td>}
                      
                      <td className="p-4 text-black text-sm">
                        {isSampah
                          ? `${trans.kategori} - ${trans.berat}kg (${trans.locationName || trans.location || 'N/A'})`
                          : `${trans.harga.toLocaleString("id-ID")} coin stecu`}
                      </td>
                      <td className="p-4 text-black font-medium">
                        {trans.harga.toLocaleString("id-ID")}
                      </td>
                      
                      <td className="p-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium capitalize ${
                            displayStatus === "pending"
                              ? "bg-yellow-500"
                              : displayStatus === "berhasil"
                              ? "bg-green-600"
                              : displayStatus === "processing"
                              ? "bg-blue-500"
                              : "bg-red-600"
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="p-4 text-black text-sm">
                        {new Date(trans.createdAt).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  )
                })
              ) : (
                !isLoading && (
                  <tr>
                    <td colSpan={isAdmin ? 9 : 8} className="p-8 text-center text-gray-500">
                      Tidak ada transaksi
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <Link href={user?.role === "admin" ? "/admin" : "/dashboard"}>
            <Button className="bg-gray-700 hover:bg-gray-800 text-white rounded-full px-6">
              Kembali ke Dashboard
            </Button>
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