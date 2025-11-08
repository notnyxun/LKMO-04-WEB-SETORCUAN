"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Script from "next/script"
import Link from "next/link"
import { PrivateRoute } from "@/components/private-route"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth-store"
import { sendWhatsAppMessage } from "@/lib/fonnte"
import { api } from "@/services/api"
import { MapPin, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils" // <-- PERBAIKAN DI SINI

// Tipe data lokasi dari API
interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

// Tipe data harga dari API
interface WastePrice {
  id: number;
  category: string;
  points: number;
}

declare global {
  interface Window {
    google: any
  }
}

function TukarSampahContent() {
  const { user } = useAuthStore()
  const [hasPendingSampah, setHasPendingSampah] = useState(false);
  const [isCheckingPending, setIsCheckingPending] = useState(true);

  // State untuk data dinamis
  const [locations, setLocations] = useState<Location[]>([])
  const [wastePrices, setWastePrices] = useState<WastePrice[]>([])

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const shouldUseInteractiveMap = Boolean(apiKey)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any | null>(null)
  const infoWindowRef = useRef<any | null>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    kategori: "", // Dikosongkan untuk placeholder
    berat: "",
    deskripsi: "",
    locationId: "", // Dikosongkan untuk placeholder
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Ambil data lokasi dan harga dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locData, priceData, historyData] = await Promise.all([
          api.location.getAll(),
          api.wastePrice.getAll(),
          api.transaction.getHistory()
        ]);
        
        if (Array.isArray(locData)) setLocations(locData);
        if (Array.isArray(priceData)) {
          setWastePrices(priceData);
          if (priceData.length > 0) {
            setFormData(prev => ({...prev, kategori: priceData[0].category.toLowerCase()}));
          }
        }
        
        if (Array.isArray(historyData)) {
          const pending = historyData.some((t: any) => 
            (t.type === 'sampah' || t.type === 'deposit') && 
            t.status === 'pending'
          );
          setHasPendingSampah(pending);
        }
        
      } catch (e) {
        console.error("Gagal memuat data awal:", e);
        setSubmitError("Gagal memuat data dari server.");
      } finally {
        setIsCheckingPending(false);
      }
    };
    fetchData();
  }, [user]);

  // Buat objek poin dari state
  const poinSampah = useMemo(() => {
    return wastePrices.reduce((acc, item) => {
      acc[item.category.toLowerCase()] = item.points;
      return acc;
    }, {} as Record<string, number>);
  }, [wastePrices]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const mapCenter = useMemo(() => {
    if (locations.length === 0) return { lat: -5.37, lng: 105.29 }; // Fallback
    const total = locations.reduce(
      (acc, loc) => ({ lat: acc.lat + loc.lat, lng: acc.lng + loc.lng }),
      { lat: 0, lng: 0 }
    )
    return {
      lat: total.lat / locations.length,
      lng: total.lng / locations.length,
    }
  }, [locations])

  const selectedLocation = useMemo(() => {
    if (!formData.locationId) return null;
    return locations.find((loc) => loc.id === formData.locationId) ?? null
  }, [formData.locationId, locations])

  const createInfoWindowContent = useCallback((location: Location) => {
    return (
      `<div style="max-width:220px">` +
      `<h3 style="margin:0 0 4px;font-size:16px;color:#111">${location.name}</h3>` +
      `<p style="margin:0;font-size:13px;color:#4b5563">${location.address || `Lat: ${location.lat}, Lng: ${location.lng}`}</p>` +
      `</div>`
    )
  }, [])

  const focusLocation = useCallback(
    (location: Location | null) => {
      if (!shouldUseInteractiveMap) return;
      const map = mapRef.current
      const marker = markerRef.current
      const infoWindow = infoWindowRef.current
      if (!map || !marker || !infoWindow) return;

      if (!location) {
        marker.setVisible(false)
        infoWindow.close()
        return
      }
      const google = window.google
      const position = { lat: location.lat, lng: location.lng }
      marker.setVisible(true)
      marker.setPosition(position)
      marker.setTitle(location.name)
      if (google?.maps?.Animation && typeof marker.setAnimation === "function") {
        marker.setAnimation(google.maps.Animation.DROP)
        window.setTimeout(() => marker.setAnimation(null), 700)
      }
      if (typeof map.panTo === "function") map.panTo(position);
      if (typeof map.getZoom === "function" && typeof map.setZoom === "function") {
        const currentZoom = map.getZoom()
        if (typeof currentZoom === "number" && currentZoom < 15) map.setZoom(15);
      }
      infoWindow.setContent(createInfoWindowContent(location))
      infoWindow.open({ anchor: marker, map })
    },
    [createInfoWindowContent, shouldUseInteractiveMap]
  )
  
  useEffect(() => {
    if (!shouldUseInteractiveMap) {
      setIsMapInitialized(false)
      setMapError(null)
      setIsScriptLoaded(false)
      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = null
      infoWindowRef.current?.close()
      infoWindowRef.current = null
      mapRef.current = null
      return
    }
    if (!isScriptLoaded || !mapContainerRef.current) return;
    const google = window.google
    if (!google || !google.maps) {
      setMapError("Gagal memuat Google Maps. Silakan muat ulang halaman ini.")
      return
    }
    setMapError(null)
    const map = new google.maps.Map(mapContainerRef.current, {
      center: mapCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })
    const marker = new google.maps.Marker({
      map,
      position: mapCenter,
      visible: false,
    })
    const infoWindow = new google.maps.InfoWindow()
    mapRef.current = map
    markerRef.current = marker
    infoWindowRef.current = infoWindow
    setIsMapInitialized(true)
    if (selectedLocation) {
      focusLocation(selectedLocation)
    }
    return () => {
      marker.setMap(null)
      infoWindow.close()
      mapRef.current = null
      markerRef.current = null
      infoWindowRef.current = null
    }
  }, [focusLocation, isScriptLoaded, mapCenter, selectedLocation, shouldUseInteractiveMap])

  useEffect(() => {
    if (!shouldUseInteractiveMap || !isMapInitialized) return;
    focusLocation(selectedLocation)
  }, [focusLocation, isMapInitialized, selectedLocation, shouldUseInteractiveMap])

  const handleSelectLocation = useCallback(
    (location: Location) => {
      setFormData((prev) => ({ ...prev, locationId: location.id }))
      focusLocation(location)
    },
    [focusLocation]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")
    setSuccess(false)

    if (hasPendingSampah) {
      setSubmitError(
        "Kamu sudah memiliki penukaran yang sedang diproses. Tunggu hingga statusnya berubah sebelum menukar lagi."
      )
      return
    }
    if (!formData.kategori) {
       setSubmitError("Pilih kategori sampah terlebih dahulu")
       return
    }
    if (!formData.locationId) {
      setSubmitError("Pilih lokasi pengambilan terlebih dahulu")
      return
    }

    setLoading(true)

    try {
      const poin = Number(formData.berat) * (poinSampah[formData.kategori] || 0);
      const selectedLocation = locations.find((l) => l.id === formData.locationId)

      const transactionData = {
        kategori: formData.kategori,
        berat: Number(formData.berat),
        totalCoin: poin,
        locationId: formData.locationId,
        deskripsi: formData.deskripsi,
      }

      const result = await api.transaction.submitSampah(transactionData);
      
      if (!result.success) {
        throw new Error(result.error || "Gagal membuat transaksi");
      }

      await sendWhatsAppMessage(
        user?.whatsapp || "",
        `Halo ${user?.username}! Permintaan tukar sampah kamu diterima.\nKategori: ${formData.kategori}\nBerat: ${formData.berat} kg\nLokasi: ${selectedLocation?.name}\nPoin: ${poin} poin\nStatus: Pending konfirmasi\nAdmin akan menghubungi kamu segera.`,
      )

      setSuccess(true)
      setHasPendingSampah(true); 
      
      setTimeout(() => {
        setSuccess(false)
        setFormData({ 
          kategori: wastePrices.length > 0 ? wastePrices[0].category.toLowerCase() : "", 
          berat: "", 
          deskripsi: "", 
          locationId: "" 
        })
      }, 3000)
    } catch (error: any) {
      console.error("Gagal mengirim permintaan tukar sampah:", error)
      setSubmitError(error.message || "Terjadi kesalahan saat mengirim permintaan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const isLoadingPage = isCheckingPending || !user;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-emerald-500 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Tukar Sampah</h1>
          <p className="text-lg text-emerald-100">Tukarkan SampahMu menjadi Koin!</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="font-bold text-black text-lg">Poin Sampah :</span>
          {isLoadingPage ? (
            <span className="text-gray-500">Loading harga...</span>
          ) : (
            wastePrices.map(p => (
              <span key={p.id} className="text-black capitalize">
                {p.category} - {p.points.toLocaleString("id-ID")} Koin/Kg
              </span>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-2 flex flex-col gap-8">
            <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-300 rounded-lg p-8 shadow-lg">
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Kategori Sampah</label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="w-full bg-gray-200 border border-gray-300 rounded-md p-3 text-black capitalize"
                  disabled={isLoadingPage || hasPendingSampah || loading}
                  required
                >
                  <option value="" disabled>-- Pilih Kategori --</option>
                  {wastePrices.map(p => (
                    <option key={p.id} value={p.category.toLowerCase()} className="capitalize">
                      {p.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">Berat Sampah (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="berat"
                  value={formData.berat}
                  onChange={handleChange}
                  className="w-full bg-gray-200 border border-gray-300 rounded-md p-3 text-black"
                  placeholder="Contoh: 5"
                  required
                  disabled={isLoadingPage || hasPendingSampah || loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">Pilih Lokasi Pengambilan</label>
                <select
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleChange}
                  className="w-full bg-gray-200 border border-gray-300 rounded-md p-3 text-black"
                  required
                  disabled={isLoadingPage || hasPendingSampah || loading}
                >
                  <option value="">-- Pilih Lokasi --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">Deskripsi (Opsional)</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  className="w-full bg-gray-200 border border-gray-300 rounded-md p-3 h-20 text-black"
                  placeholder="Deskripsi Sampah atau Catatan Tambahan"
                  disabled={isLoadingPage || hasPendingSampah || loading}
                />
              </div>

              {formData.berat && !hasPendingSampah && (
                <div className="bg-green-100 border border-green-400 rounded-md p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Total Poin:</strong> {(Number(formData.berat) * (poinSampah[formData.kategori] || 0)).toLocaleString("id-ID")} poin
                  </p>
                </div>
              )}
              
              {isLoadingPage && (
                 <div className="bg-gray-100 border border-gray-400 text-gray-700 p-3 rounded-md text-sm">
                  Memeriksa status transaksi...
                </div>
              )}

              {hasPendingSampah && !success && !isLoadingPage && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-3 rounded-md text-sm">
                  Kamu sudah memiliki penukaran yang sedang diproses. Tunggu hingga statusnya berubah sebelum menukar lagi.
                </div>
              )}

              {submitError && (
                <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md text-sm">
                  {submitError}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded-md text-sm">
                  ✓ Permintaan tukar sampah berhasil dikirim! Status: Pending.
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoadingPage || loading || !formData.berat || !formData.locationId || hasPendingSampah}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium text-lg"
              >
                {loading ? "Mengirim..." : (hasPendingSampah ? "Penukaran Diproses" : "Kirim Permintaan")}
              </Button>
            </form>
            
            <Link href="/history-transaksi" className="mt-[-1rem]">
              <Button variant="outline" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white h-12 text-lg">
                Lihat History Transaksi
              </Button>
            </Link>
          </div>

          <div className="lg:col-span-3 bg-white border border-gray-300 rounded-lg p-8 shadow-lg">
            <div className="w-full h-80 bg-gray-200 border border-gray-300 rounded-lg overflow-hidden mb-6">
              {shouldUseInteractiveMap ? (
                mapError ? (
                  <div className="flex h-full w-full items-center justify-center p-4 text-center text-gray-700">
                    <p>{mapError}</p>
                  </div>
                ) : (
                  <div className="relative h-full w-full">
                    {!isMapInitialized && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                    <div ref={mapContainerRef} className="h-full w-full" />
                  </div>
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center p-4 text-center text-gray-500 flex-col">
                  <MapPin className="w-12 h-12 mb-4" />
                  <p>API Key Google Maps tidak tersedia.</p>
                  <p className="text-sm">Menampilkan peta statis.</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-700 font-semibold mb-4">Pilih lokasi penjemputan:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectLocation(loc)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        handleSelectLocation(loc)
                      }
                    }}
                    className={cn(
                      "rounded-lg border p-4 text-left transition hover:bg-gray-50",
                      formData.locationId === loc.id ? "border-green-600 ring-2 ring-green-600" : "border-gray-300"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                      <div>
                        <p className="text-base font-semibold text-black">{loc.name}</p>
                        <p className="text-sm text-gray-600">{loc.address || `Lat: ${loc.lat}, Lng: ${loc.lng}`}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function TukarSampahPage() {
  return (
    <PrivateRoute requiredRole="customer">
      <TukarSampahContent />
    </PrivateRoute>
  )
}