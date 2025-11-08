"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Script from "next/script"

type Location = {
  name: string
  address: string
  lat: number
  lng: number
}

const locations: Location[] = [
  {
    name: "Bank Sampah SetorCuan - Pulau Damar",
    address:
      "Jl. Pulau Damar Gg. Nusa Satu No.23, Way Dadi, Kec. Sukarame, Kota Bandar Lampung",
    lat: -5.376526338272906,
    lng: 105.28818970242115,
  },
  {
    name: "Bank Sampah SetorCuan - Raden Saleh",
    address: "Jl. Raden Saleh, Way Huwi, Kec. Jati Agung, Kabupaten Lampung Selatan",
    lat: -5.3646679769006695,
    lng: 105.29603722423592,
  },
  {
    name: "Bank Sampah SetorCuan - ITERA",
    address: "Jl. Terusan Ryacudu, Way Huwi, Kec. Jati Agung, Kabupaten Lampung Selatan",
    lat: -5.3609809417718,
    lng: 105.32137968044056,
  },
]

declare global {
  interface Window {
    google: any
  }
}

export default function LocationsPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any | null>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<number | null>(
    locations.length > 0 ? 0 : null
  )

  const shouldUseInteractiveMap = Boolean(apiKey)
  const selectedLocation =
    selectedLocationIndex !== null ? locations[selectedLocationIndex] : null

  const mapCenter = useMemo(() => {
    if (locations.length === 0) {
      return { lat: 0, lng: 0 }
    }

    const total = locations.reduce(
      (acc, loc) => ({ lat: acc.lat + loc.lat, lng: acc.lng + loc.lng }),
      { lat: 0, lng: 0 }
    )

    return {
      lat: total.lat / locations.length,
      lng: total.lng / locations.length,
    }
  }, [])

  const createInfoWindowContent = useCallback((location: Location) => {
    return (
      `<div style="max-width:220px">` +
      `<h3 style="margin:0 0 4px;font-size:16px;color:#111">${location.name}</h3>` +
      `<p style="margin:0;font-size:13px;color:#4b5563">${location.address}</p>` +
      `</div>`
    )
  }, [])

  const focusLocation = useCallback(
    (index: number) => {
      if (!shouldUseInteractiveMap) {
        return
      }

      const map = mapRef.current
      const markers = markersRef.current
      const infoWindow = infoWindowRef.current
      const location = locations[index]

      if (!map || !markers[index] || !infoWindow || !location) {
        return
      }

      const marker = markers[index]
      const position = marker.getPosition() ?? { lat: location.lat, lng: location.lng }

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
    },
    [createInfoWindowContent, shouldUseInteractiveMap]
  )

  const handleSelectLocation = useCallback(
    (index: number) => {
      setSelectedLocationIndex((previous) => {
        if (previous === index) {
          focusLocation(index)
          return previous
        }

        return index
      })
    },
    [focusLocation]
  )

  useEffect(() => {
    if (!shouldUseInteractiveMap) {
      setIsMapInitialized(false)
      setMapError(null)
      setSelectedLocationIndex((previous) => {
        if (previous === null && locations.length > 0) {
          return 0
        }

        return previous
      })
      markersRef.current.forEach((marker) => {
        const google = window.google
        if (google?.maps?.event) {
          google.maps.event.clearInstanceListeners(marker)
        }
        marker.setMap(null)
      })
      markersRef.current = []
      infoWindowRef.current?.close()
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
    markersRef.current = locations.map((location, index) => {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: location.name,
      })

      marker.addListener("click", () => {
        handleSelectLocation(index)
      })

      bounds.extend({ lat: location.lat, lng: location.lng })

      return marker
    })

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 32, left: 32, bottom: 32, right: 32 })
    }

    setIsMapInitialized(true)

    if (locations.length > 0) {
      setSelectedLocationIndex((previous) => {
        const nextIndex = previous ?? 0

        if (nextIndex !== previous) {
          return nextIndex
        }

        return previous
      })
      focusLocation(0)
    }

    return () => {
      markersRef.current.forEach((marker) => {
        const google = window.google
        if (google?.maps?.event) {
          google.maps.event.clearInstanceListeners(marker)
        }
        marker.setMap(null)
      })
      markersRef.current = []

      infoWindow.close()
      infoWindowRef.current = null
      mapRef.current = null
    }
  }, [focusLocation, handleSelectLocation, isScriptLoaded, mapCenter, shouldUseInteractiveMap])

  useEffect(() => {
    if (!shouldUseInteractiveMap || !isMapInitialized) {
      return
    }

    if (selectedLocationIndex !== null) {
      focusLocation(selectedLocationIndex)
    }
  }, [focusLocation, isMapInitialized, selectedLocationIndex, shouldUseInteractiveMap])

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-emerald-500">
      {shouldUseInteractiveMap && (
        <Script
          id="google-maps-script"
          src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
          strategy="afterInteractive"
          onLoad={() => setIsScriptLoaded(true)}
          onError={() =>
            setMapError("Tidak dapat memuat Google Maps API. Periksa koneksi internet Anda dan coba lagi.")
          }
        />
      )}
      <main className="flex-grow flex flex-col justify-center p-8 text-white">
        {/* Bagian Atas: Judul dan Peta */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12 md:mb-20">
          {/* 1. Judul */}
          <div className="md:col-span-1">
            <h2 className="text-5xl font-bold text-white text-center md:text-left">Lokasi SetorCuan</h2>
          </div>

          {/* 2. Peta Placeholder (sesuai design) */}
          <div className="md:col-span-1">
            <div className="w-full h-80 bg-emerald-400 border-4 border-white rounded-lg overflow-hidden">
              {shouldUseInteractiveMap ? (
                mapError ? (
                  <div className="flex h-full w-full items-center justify-center px-4 text-center text-white">
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
                  title="Lokasi SetorCuan"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${
                    selectedLocation?.lat ?? mapCenter.lat
                  },${selectedLocation?.lng ?? mapCenter.lng}&z=15&output=embed`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bagian Bawah: Kartu Lokasi */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {locations.map((loc, idx) => {
            const isSelected = selectedLocationIndex === idx

            return (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectLocation(idx)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    handleSelectLocation(idx)
                  }
                }}
                className={`flex flex-col items-center text-center rounded-lg p-6 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-500 ${
                  isSelected ? "bg-white/90 shadow-lg" : "bg-white/70"
                } cursor-pointer`}
              >
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
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {/* Teks lokasi berwarna hitam */}
                <h3 className="font-bold text-lg text-black">{loc.name}</h3>
                <p className="mb-3 text-black">{loc.address}</p>
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-emerald-700 underline transition hover:text-emerald-900"
                >
                  Lihat di Google Maps
                </Link>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}