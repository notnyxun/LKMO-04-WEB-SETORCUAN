"use client"

import Image from "next/image"
import React, { useEffect, useState } from "react" // <-- PERBAIKAN DI SINI
import { api } from "@/services/api"
import { RefreshCw } from "lucide-react"

interface WastePrice {
  id: number
  category: string
  points: number
}

// Fungsi untuk memetakan kategori ke path gambar
const getImagePath = (category: string) => {
  switch (category.toLowerCase()) {
    case "plastik":
      return "/image/plastik.jpg"
    case "kardus":
      return "/image/kardus.jpg"
    case "kaca":
      return "/image/Kaca.jpg"
    default:
      return "/placeholder.jpg"
  }
}

export default function PricesPage() {
  const [prices, setPrices] = useState<WastePrice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await api.wastePrice.getAll()
        if (Array.isArray(data)) {
          setPrices(data)
        }
      } catch (error) {
        console.error("Gagal mengambil harga:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPrices()
  }, [])

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <main className="flex-grow flex w-full">
        {/* Sidebar Hijau */}
        <div className="flex-[6] bg-emerald-500 flex flex-col items-center justify-center p-8">
          <h2 className="text-5xl font-bold text-white text-center">
            Harga Barang Daur Ulang
          </h2>
        </div>

        {/* Konten Harga */}
        {loading ? (
          <div className="flex-[10] bg-white flex items-center justify-center p-4 text-gray-700">
            <RefreshCw className="w-6 h-6 animate-spin mr-3" />
            Memuat Harga...
          </div>
        ) : (
          prices.map((item, index) => (
            <React.Fragment key={item.id}>
              <div className="flex-[4] bg-white flex flex-col items-center justify-center p-4">
                <div className="relative w-48 h-48 mb-4">
                  <Image
                    src={getImagePath(item.category)}
                    alt={item.category}
                    fill
                    style={{ objectFit: "contain" }}
                    onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                  />
                </div>
                <h3 className="text-xl font-bold text-black capitalize">{item.category}</h3>
                <p className="text-black font-medium mt-1">
                  Rp {item.points.toLocaleString("id-ID")}/kg
                </p>
              </div>
              
              {/* Tambahkan separator hijau kecuali untuk item terakhir */}
              {index < prices.length - 1 && (
                <div className="flex-[1] bg-emerald-500"></div>
              )}
            </React.Fragment>
          ))
        )}
        {/* Separator hijau di akhir */}
        <div className="flex-[1] bg-emerald-500"></div>
      </main>
    </div>
  )
}