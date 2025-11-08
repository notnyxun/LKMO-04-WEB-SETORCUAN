"use client"

import React, { useEffect, useState, useCallback } from "react"
import { PrivateRoute } from "@/components/private-route"
import { useAuthStore, User, Transaction } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/services/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, RefreshCw, Paperclip } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

// Tipe data dari Backend
interface UserData {
  id: number
  username: string
  totalCoins: number
}

// Tipe Transaksi Admin, mewarisi dari tipe Transaksi dasar
interface AdminTransaction extends Transaction {
  user: {
    id: number
    username: string
    firstName: string | null
    lastName: string | null
    whatsapp: string | null
  }
}

function AdminContent() {
  const { user: authUser, fetchUser } = useAuthStore()
  const { toast } = useToast()

  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("pending") // Default ke pending

  const [isAdjustPointsModalOpen, setIsAdjustPointsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [pointAmount, setPointAmount] = useState<string>("")
  const [pointOperation, setPointOperation] = useState<"add" | "subtract">("add")
  const [adjustPointsLoading, setAdjustPointsLoading] = useState(false)
  
  const [isProofModalOpen, setIsProofModalOpen] = useState(false)
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError(null)
    try {
      // @ts-ignore
      const [fetchedTransactions, fetchedUsers] = await Promise.all([
        api.admin.getTransactions(),
        api.admin.getUsers()
      ]);

      if (Array.isArray(fetchedTransactions)) {
        setTransactions(fetchedTransactions)
      } else {
        // @ts-ignore
        setError(fetchedTransactions?.error || "Gagal memuat transaksi.")
      }

      if (Array.isArray(fetchedUsers)) {
        setUsers(fetchedUsers)
      } else {
        // @ts-ignore
        console.error(fetchedUsers?.error || "Gagal memuat daftar pengguna.")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil data.")
      console.error("Error fetching admin data:", err)
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const handleUpdateTransactionStatus = async (
    id: string,
    status: "validated" | "cancelled" | "processing" | "completed",
    withdrawalProofUrl?: string
  ) => {
    try {
      const result = await api.admin.updateTransactionStatus(id, status, withdrawalProofUrl)
      
      if (result && !result.error) {
        toast({
          title: "Sukses!",
          description: `Status transaksi berhasil diubah menjadi ${status}.`,
        })
        fetchData(true)
        fetchUser()
      } else {
        toast({
          title: "Gagal!",
          // @ts-ignore
          description: result.error || "Gagal mengubah status transaksi.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error updating transaction status:", err)
      toast({
        title: "Error!",
        description: "Terjadi kesalahan server saat mengubah status.",
        variant: "destructive",
      })
    }
    
    setIsProofModalOpen(false)
    setProofFile(null)
    setCurrentTransactionId(null)
    setIsUploading(false)
  }
  
  const openProofModal = (id: string) => {
    setCurrentTransactionId(id);
    setIsProofModalOpen(true);
    setProofFile(null);
  };

  const handleSubmitProof = async () => {
    if (!proofFile) {
       toast({
          title: "Input Kosong",
          description: "Silakan pilih file gambar bukti transfer.",
          variant: "destructive",
        })
      return;
    }
    if (currentTransactionId) {
      setIsUploading(true);
      try {
        const uploadResult = await api.admin.uploadProof(proofFile);
        
        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || "Gagal meng-upload file.");
        }
        
        await handleUpdateTransactionStatus(currentTransactionId, "completed", uploadResult.url);
        
      } catch (err: any) {
        toast({
          title: "Upload Gagal",
          description: err.message || "Tidak dapat meng-upload bukti transfer.",
          variant: "destructive",
        })
        setIsUploading(false);
      }
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProofFile(e.target.files[0]);
    } else {
      setProofFile(null);
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !pointAmount || isNaN(Number(pointAmount)) || Number(pointAmount) <= 0) {
      toast({
        title: "Input Tidak Valid",
        description: "Silakan pilih user dan masukkan jumlah poin yang valid.",
        variant: "destructive",
      })
      return
    }

    setAdjustPointsLoading(true)
    try {
      const result = await api.admin.adjustPoints(
        selectedUserId.toString(),
        Number(pointAmount),
        pointOperation
      )
      if (result && !result.error) {
        toast({
          title: "Sukses!",
          description: `Poin pengguna berhasil di ${pointOperation === "add" ? "tambah" : "kurang"}.`,
          variant: "default",
        })
        api.admin.getUsers().then(fetchedUsers => {
          if (fetchedUsers && !fetchedUsers.error) {
            // @ts-ignore
            setUsers(fetchedUsers);
          }
        });
        setIsAdjustPointsModalOpen(false)
        setPointAmount("")
        setSelectedUserId(null)
      } else {
        toast({
          title: "Gagal!",
          // @ts-ignore
          description: result.error || "Gagal mengubah poin pengguna.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error adjusting points:", err)
      toast({
        title: "Error!",
        description: "Terjadi kesalahan server saat mengubah poin.",
        variant: "destructive",
      })
    } finally {
      setAdjustPointsLoading(false)
    }
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

  // Filter transaksi
  const pendingDeposits = transactions.filter(
    (t) => (t.type === "deposit" || t.type === "sampah") && t.status === "pending"
  )
  const pendingWithdrawals = transactions.filter(
    (t) => (t.type === "withdrawal" || t.type === "poin") && (t.status === "pending" || t.status === "processing")
  )
  
  const allHistory = transactions.filter(
    (t) => t.status !== "pending" && t.status !== "processing"
  )

  const filteredHistory =
    filterStatus === "all"
      ? allHistory
      : allHistory.filter((t) => getStatusText(t.status) === filterStatus);

  const displayTransactions = filterStatus === 'pending' 
    ? pendingDeposits 
    : filteredHistory.filter(t => t.type === 'deposit' || t.type === 'sampah');

  const stats = {
    total: transactions.length,
    baru: transactions.filter(t => t.status === 'pending').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    selesai: transactions.filter(t => t.status === 'berhasil' || t.status === 'validated' || t.status === 'completed').length,
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-100 text-gray-700 text-xl">
        <RefreshCw className="w-8 h-8 animate-spin mr-4" />
        Memuat Data Admin...
      </div>
    )
  }
  
  return (
    <>
      <Toaster />
      <main className="min-h-[calc(100vh-64px)] bg-emerald-500">
        {/* Header Admin */}
        <div className="bg-emerald-500 text-white p-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <Image
                src="/placeholder-user.jpg"
                alt="Admin Avatar"
                width={80}
                height={80}
                className="rounded-full bg-gray-300 w-20 h-20"
              />
              <div>
                <h1 className="text-3xl font-bold">{authUser?.firstName || authUser?.username}</h1>
                <p className="text-green-100 capitalize">{authUser?.role}</p>
                <p className="text-green-100">Your ID: {authUser?.id}</p>
              </div>
            </div>
            {/* --- Tombol Riwayat Transaksi Dihapus --- */}
          </div>
        </div>

        {/* Konten Putih */}
        <div className="bg-white p-8 rounded-t-3xl min-h-[calc(100vh-200px)]">
          <div className="max-w-7xl mx-auto">
            {/* --- JUDUL DI-CENTER --- */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2 text-black">Record Permintaan Penukaran</h2>
              <p className="text-gray-500 mb-8">Request Penukaran Sampah dari Customer</p>
            </div>
            
            {/* Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="border border-gray-200 rounded-lg p-4 text-left shadow-sm">
                <p className="text-gray-500 text-sm">Total Request Penukaran</p>
                <p className="text-4xl font-bold text-black">{stats.total}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-left shadow-sm">
                <p className="text-gray-500 text-sm">Request Baru</p>
                <p className="text-4xl font-bold text-black">{stats.baru}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-left shadow-sm">
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-4xl font-bold text-black">{stats.pending}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-left shadow-sm">
                <p className="text-gray-500 text-sm">Selesai</p>
                <p className="text-4xl font-bold text-black">{stats.selesai}</p>
              </div>
            </div>
            
            <div className="mb-8 bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
              <h3 className="text-lg font-bold mb-4 text-black">Kelola Poin User</h3>
              <p className="text-gray-600 text-sm mb-4">
                Gunakan fitur ini untuk menambah atau mengurangi koin secara manual pada akun pengguna tertentu.
              </p>
              <Button onClick={() => setIsAdjustPointsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                Atur Poin Pengguna
              </Button>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <label className="text-black font-medium">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md p-2 bg-white text-black"
              >
                <option value="pending">Pending</option>
                <option value="berhasil">Berhasil</option>
                <option value="dibatalkan">Dibatalkan</option>
                <option value="all">Semua (History)</option>
              </select>
              <Button 
                variant="outline" 
                className="ml-auto bg-white border-gray-300 hover:bg-gray-50 text-black" 
                onClick={() => fetchData(true)}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'mr-2'}`} />
                Refresh
              </Button>
            </div>

            <div className="rounded-lg border overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Jumlah (Kg)</TableHead>
                    <TableHead>Jumlah Koin</TableHead>
                    <TableHead>Harga (Rp)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTransactions.length > 0 ? (
                    displayTransactions.map((trx) => (
                      <TableRow key={trx.id}>
                        <TableCell className="font-medium">{trx.user.username}</TableCell>
                        <TableCell>{trx.berat} kg ({trx.kategori})</TableCell>
                        <TableCell>{trx.harga.toLocaleString("id-ID")}</TableCell>
                        <TableCell>Rp {trx.harga.toLocaleString("id-ID")}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                              getStatusText(trx.status) === "pending" ? "bg-yellow-100 text-yellow-800" :
                              getStatusText(trx.status) === "berhasil" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}
                          >
                            {getStatusText(trx.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {trx.status === "pending" && (
                            <>
                              <Button
                                onClick={() => handleUpdateTransactionStatus(trx.id, "validated")}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                Selesai
                              </Button>
                              <Button
                                onClick={() => handleUpdateTransactionStatus(trx.id, "cancelled")}
                                variant="destructive"
                                size="sm"
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                           {trx.status !== "pending" && (
                             <span className="text-xs text-gray-500">-</span>
                           )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        Tidak ada transaksi untuk filter ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {pendingWithdrawals.length > 0 && (
              <div className="bg-white p-8 rounded-lg shadow-md my-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Manajemen Pencairan Poin (Database)</h2>
                <Alert className="mb-6 bg-yellow-50 border-yellow-300 text-yellow-800">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Peringatan</AlertTitle>
                  <AlertDescription>
                    Transaksi ini dibuat sebelum pembaruan ke WhatsApp. Selesaikan secara manual.
                  </AlertDescription>
                </Alert>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Poin</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingWithdrawals.map((trx) => (
                      <TableRow key={trx.id}>
                        <TableCell>{trx.user.username}</TableCell>
                        <TableCell>{trx.harga}</TableCell>
                        <TableCell>{trx.status}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => openProofModal(trx.id)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            Selesaikan (Upload Bukti)
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                 </Table>
              </div>
            )}
            
          </div>
        </div>
      </main>

      <Dialog open={isAdjustPointsModalOpen} onOpenChange={setIsAdjustPointsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Atur Poin Pengguna</DialogTitle>
            <DialogDescription>
              Pilih pengguna dan masukkan jumlah poin untuk ditambah atau dikurangi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustPoints} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user-select" className="text-right">
                Pengguna
              </Label>
              <select
                id="user-select"
                className="col-span-3 p-2 border rounded"
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                required
              >
                <option value="" disabled>Pilih Pengguna</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} (Poin: {u.totalCoins})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Jumlah
              </Label>
              <Input
                id="amount"
                type="number"
                value={pointAmount}
                onChange={(e) => setPointAmount(e.target.value)}
                className="col-span-3"
                placeholder="Cth: 5000"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="operation" className="text-right">
                Operasi
              </Label>
              <select
                id="operation"
                className="col-span-3 p-2 border rounded"
                value={pointOperation}
                onChange={(e) => setPointOperation(e.target.value as "add" | "subtract")}
              >
                <option value="add">Tambah</option>
                <option value="subtract">Kurang</option>
              </select>
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Batal</Button>
              </DialogClose>
              <Button type="submit" disabled={adjustPointsLoading}>
                {adjustPointsLoading ? "Memproses..." : "Konfirmasi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isProofModalOpen} onOpenChange={setIsProofModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Penyelesaian</DialogTitle>
            <DialogDescription>
              Upload gambar bukti transfer untuk menyelesaikan transaksi ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="proof-file" className="text-right">
                File Bukti
              </Label>
              <Input
                id="proof-file"
                type="file"
                onChange={handleFileSelect}
                className="col-span-3"
                accept="image/png, image/jpeg, image/jpg"
                required
              />
            </div>
            {proofFile && (
                <div className="col-span-4 flex items-center gap-2 text-sm text-gray-600 pl-24">
                  <Paperclip className="w-4 h-4" />
                  <span>{proofFile.name}</span>
                </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isUploading}>Batal</Button>
            </DialogClose>
            <Button type="button" onClick={handleSubmitProof} disabled={isUploading}>
              {isUploading ? "Meng-upload..." : "Selesaikan Transaksi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  )
}

export default function AdminPage() {
  return (
    <PrivateRoute requiredRole="admin">
      <AdminContent />
    </PrivateRoute>
  )
}