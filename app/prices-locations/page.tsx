"use client"

import { useEffect, useState } from "react"

export default function PricesLocationsPage() {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Simulate Google Maps loading
    const timer = setTimeout(() => setMapLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const prices = [
    { name: "Plastik", price: "Rp 5000/kg", image: "🟦" },
    { name: "Kardus", price: "Rp 5000/kg", image: "📦" },
    { name: "Kaca", price: "Rp 5000/kg", image: "🟩" },
  ]

  const locations = [
    { name: "Lokasi1", address: "Alamat Lengkap" },
    { name: "Lokasi2", address: "Alamat Lengkap" },
    { name: "Lokasi3", address: "Alamat Lengkap" },
  ]

  return (
    <main className="min-h-screen bg-green-500">
      {/* Prices Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-black mb-2">Harga Barang Daur Ulang</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {prices.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 text-center shadow-md">
                <div className="text-6xl mb-4">{item.image}</div>
                <h3 className="text-xl font-bold text-black">{item.name}</h3>
                <p className="text-green-600 font-bold mt-2">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-black mb-2">Lokasi SetorCuan</h2>

          {/* Map Placeholder */}
          <div className="mt-8 bg-gray-200 rounded-lg h-64 flex items-center justify-center border-2 border-gray-300 mb-8">
            <div className="text-center">
              <p className="text-gray-600">Google Maps Integration</p>
              <p className="text-sm text-gray-500">Maps loading...</p>
            </div>
          </div>

          {/* Location Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((loc, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="text-3xl mb-2">📍</div>
                <h3 className="font-bold text-lg">{loc.name}</h3>
                <p className="text-muted-foreground">{loc.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
