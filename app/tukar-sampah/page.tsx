"use client"

import type React from "react"
import { PrivateRoute } from "@/components/private-route"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { sendWhatsAppMessage } from "@/lib/fonnte"
import Link from "next/link"
import Script from "next/script"

const LOCATIONS = [
  { id: "lokasi1", name: "Bank Sampah SetorCuan - Pulau Damar", lat: -5.376526338272906, lng: 105.28818970242115 },
  { id: "lokasi2", name: "Bank Sampah SetorCuan - Raden Saleh", lat: -5.3646679769006695, lng: 105.29603722423592 },
  { id: "lokasi3", name: "Bank Sampah SetorCuan - ITERA", lat: -5.3609809417718, lng: 105.32137968044056 },
]

function TukarSampahContent() {
  const { user, addTransaction, get } = useAuthStore()
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const shouldUseInteractiveMap = Boolean(apiKey)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any | null>(null)
  const infoWindowRef = useRef<any | null>(null)
  const lastFocusedLocationRef = useRef<(typeof LOCATIONS)[number] | null>(LOCATIONS[0] ?? null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const defaultLocationId = LOCATIONS[0]?.id ?? ""
  const [formData, setFormData] = useState({
    kategori: "plastik",
    berat: "",
    deskripsi: "",
    locationId: defaultLocationId,
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

  const mapCenter = useMemo(() => {
    if (LOCATIONS.length === 0) {
      return { lat: 0, lng: 0 }
    }

    const total = LOCATIONS.reduce(
      (acc, loc) => ({ lat: acc.lat + loc.lat, lng: acc.lng + loc.lng }),
      { lat: 0, lng: 0 }
    )

    return {
      lat: total.lat / LOCATIONS.length,
      lng: total.lng / LOCATIONS.length,
    }
  }, [])

  const selectedLocation = useMemo(() => {
    if (!formData.locationId) {
      return LOCATIONS[0] ?? null
    }

    return LOCATIONS.find((loc) => loc.id === formData.locationId) ?? LOCATIONS[0] ?? null
  }, [formData.locationId])

  const createInfoWindowContent = useCallback((location: (typeof LOCATIONS)[number]) => {
    return (
      `<div style="max-width:220px">` +
      `<h3 style="margin:0 0 4px;font-size:16px;color:#111">${location.name}</h3>` +
      `<p style="margin:0;font-size:13px;color:#4b5563">Lokasi penjemputan SetorCuan</p>` +
      `</div>`
    )
  }, [])

  const focusLocation = useCallback(
    (location: (typeof LOCATIONS)[number] | null) => {
      if (!shouldUseInteractiveMap || !location) {
        return
      }

      const map = mapRef.current
      const marker = markerRef.current
      const infoWindow = infoWindowRef.current

      if (!map || !marker || !infoWindow) {
        return
      }

      const position = { lat: location.lat, lng: location.lng }
      marker.setPosition(position)
      marker.setTitle(location.name)

      if (typeof map.panTo === "function") {
        map.panTo(position)
      } else if (typeof map.setCenter === "function") {
        map.setCenter(position)
      }

      if (typeof map.getZoom === "function" && typeof map.setZoom === "function") {
        const currentZoom = map.getZoom()
        if (typeof currentZoom === "number" && currentZoom < 15) {
          map.setZoom(15)
        }
      }

      infoWindow.setContent(createInfoWindowContent(location))
      infoWindow.open({ anchor: marker, map })
      lastFocusedLocationRef.current = location
    },
    [createInfoWindowContent, shouldUseInteractiveMap]
  )

  useEffect(() => {
    if (!shouldUseInteractiveMap) {
      setIsMapInitialized(false)
      setMapError(null)
      setIsScriptLoaded(false)
      const marker = markerRef.current
      const google = window.google
      if (marker) {
        if (google?.maps?.event) {
          google.maps.event.clearInstanceListeners(marker)
        }
        marker.setMap(null)
      }
      markerRef.current = null
      infoWindowRef.current?.close()
      infoWindowRef.current = null
      mapRef.current = null
      lastFocusedLocationRef.current = LOCATIONS[0] ?? null
      return
    }

    if (!isScriptLoaded || !mapContainerRef.current) {
      return
    }

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

    const infoWindow = new google.maps.InfoWindow()
    const bounds = new google.maps.LatLngBounds()

    mapRef.current = map
    infoWindowRef.current = infoWindow

    LOCATIONS.forEach((location) => {
      bounds.extend({ lat: location.lat, lng: location.lng })
    })

    const initialLocation = LOCATIONS[0] ?? null
    const marker = new google.maps.Marker({
      position: initialLocation
        ? { lat: initialLocation.lat, lng: initialLocation.lng }
        : mapCenter,
      map,
      title: initialLocation?.name ?? "Lokasi penjemputan SetorCuan",
    })

    marker.addListener("click", () => {
      const fallbackLocation = lastFocusedLocationRef.current ?? initialLocation
      focusLocation(fallbackLocation ?? null)
    })

    markerRef.current = marker
    lastFocusedLocationRef.current = initialLocation

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 32, left: 32, bottom: 32, right: 32 })
    }

    setIsMapInitialized(true)

    if (initialLocation) {
      focusLocation(initialLocation)
    }

    return () => {
      const markerInstance = markerRef.current
      const googleMaps = window.google
      if (markerInstance) {
        if (googleMaps?.maps?.event) {
          googleMaps.maps.event.clearInstanceListeners(markerInstance)
        }
        markerInstance.setMap(null)
      }
      markerRef.current = null
      infoWindow.close()
      infoWindowRef.current = null
      mapRef.current = null
      lastFocusedLocationRef.current = LOCATIONS[0] ?? null
    }
  }, [focusLocation, isScriptLoaded, mapCenter, shouldUseInteractiveMap])

  useEffect(() => {
    if (!shouldUseInteractiveMap || !isMapInitialized) {
      return
    }

    if (selectedLocation) {
      focusLocation(selectedLocation)
    }
  }, [focusLocation, isMapInitialized, selectedLocation, shouldUseInteractiveMap])

  const handleSelectLocationCard = (locationId: string) => {
    setFormData((prev) => ({ ...prev, locationId }))
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
      setFormData({ kategori: "plastik", berat: "", deskripsi: "", locationId: defaultLocationId })
    }, 3000)

    setLoading(false)
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-white">
      {shouldUseInteractiveMap && (
        <Script
          id="google-maps-script-tukar-sampah"
          src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
          strategy="afterInteractive"
          onLoad={() => setIsScriptLoaded(true)}
          onError={() =>
            setMapError("Tidak dapat memuat Google Maps API. Periksa koneksi internet Anda dan coba lagi.")
          }
        />
      )}
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

          {/* Map Section */}
          <div className="lg:col-span-2">
          <div className="bg-gray-200 rounded-lg p-4 flex flex-col gap-4">
              <div className="w-full h-64 bg-white border border-gray-300 rounded-lg overflow-hidden">
                {shouldUseInteractiveMap ? (
                  mapError ? (
                    <div className="flex h-full w-full items-center justify-center px-4 text-center text-gray-700">
                      <p>{mapError}</p>
                    </div>
                    ) : (
                      <div className="relative h-full w-full">
                        {!isMapInitialized && (
                          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/60 text-white">
                            <p>Memuat peta interaktif...</p>
                          </div>
                        )}
                        <div ref={mapContainerRef} className="h-full w-full" />
                      </div>
                    )
                  ) : (
                    <iframe
                      title="Lokasi Penjemputan SetorCuan"
                      className="h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${
                        selectedLocation?.lat ?? mapCenter.lat
                      },${selectedLocation?.lng ?? mapCenter.lng}&z=15&output=embed`}
                    />
                  )}
                </div>
  
                <div>
                  <p className="text-gray-700 font-semibold mb-3">Pilih lokasi penjemputan:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {LOCATIONS.map((loc) => {
                      const isSelected = formData.locationId
                        ? formData.locationId === loc.id
                        : loc.id === defaultLocationId
  
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => handleSelectLocationCard(loc.id)}
                          className={`rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 ${
                            isSelected ? "border-emerald-500 bg-white shadow" : "border-gray-300 bg-white/80"
                          }`}
                        >
                          <p className="text-sm font-semibold text-black">{loc.name}</p>
                          <p className="text-xs text-gray-600">Lat: {loc.lat}</p>
                          <p className="text-xs text-gray-600">Lng: {loc.lng}</p>
                        </button>
                      )
                    })}
                </div>
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
