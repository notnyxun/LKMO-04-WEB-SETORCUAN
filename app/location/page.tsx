"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const locations = [
  { name: "Lokasi 1", address: "Alamat Lengkap" },
  { name: "Lokasi 2", address: "Alamat Lengkap" },
  { name: "Lokasi 3", address: "Alamat Lengkap" },
]

export default function LocationsPage() {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-emerald-500">
      {}
      <main className="flex-grow flex flex-col justify-center p-8 text-white">
        
        {/* Bagian Atas: Judul dan Peta */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12 md:mb-20">
          
          {/* 1. Judul */}
          <div className="md:col-span-1">
            <h2 className="text-5xl font-bold text-white text-center md:text-left">
              Lokasi SetorCuan
            </h2>
          </div>

          {/* 2. Peta Placeholder (sesuai design) */}
          <div className="md:col-span-1">
            <div className="w-full h-80 bg-emerald-400 border-4 border-white rounded-lg flex items-center justify-center text-center p-4">
              {mapLoaded ? (
                // Placeholder visual peta
                <div className="relative w-full h-full overflow-hidden">
                  <div className="absolute w-[200%] h-[200%] bg-white/30 -rotate-45 top-[-50%] left-[-50%] space-y-4">
                    <div className="h-8 md:h-12 w-full bg-emerald-500"></div>
                    <div className="h-8 md:h-12 w-full bg-emerald-500 ml-12"></div>
                    <div className="h-8 md:h-12 w-full bg-emerald-500 ml-[-30px]"></div>
                    <div className="h-8 md:h-12 w-full bg-emerald-500 ml-20"></div>
                  </div>
                  <p className="absolute bottom-4 left-4 text-white font-medium bg-black/30 p-2 rounded">
                    Locate the recycling centers near you...
                  </p>
                </div>
              ) : (
                <p className="text-white">Loading map...</p>
              )}
            </div>
          </div>
        </div>

        {/* Bagian Bawah: Kartu Lokasi */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {locations.map((loc, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              {/* Ikon Pin (SVG) berwarna hitam */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="36" 
                height="36" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-black mb-2"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {/* Teks lokasi berwarna hitam */}
              <h3 className="font-bold text-lg text-black">{loc.name}</h3>
              <p className="text-black">{loc.address}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}