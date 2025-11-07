import type { MapLocation } from "@/types/location"

export const MOCK_LOCATIONS: MapLocation[] = [
  {
    id: "1",
    name: "Lokasi 1",
    address: "Alamat Lengkap 1",
    latitude: -6.2088,
    longitude: 106.8456,
    phone: "+6281234567890",
    operatingHours: {
      open: "08:00",
      close: "17:00",
    },
  },
  {
    id: "2",
    name: "Lokasi 2",
    address: "Alamat Lengkap 2",
    latitude: -6.1945,
    longitude: 106.8227,
    phone: "+6281234567891",
    operatingHours: {
      open: "08:00",
      close: "17:00",
    },
  },
  {
    id: "3",
    name: "Lokasi 3",
    address: "Alamat Lengkap 3",
    latitude: -6.2176,
    longitude: 106.8286,
    phone: "+6281234567892",
    operatingHours: {
      open: "08:00",
      close: "17:00",
    },
  },
]

export const MOCK_ADMIN_USER = {
  id: "admin-1",
  username: "admin",
  email: "admin@setorcuan.com",
  whatsapp: "6281234567890",
  eWalletType: "Gopay" as const,
  eWalletNumber: "6281234567890",
  password: "admin123",
  role: "admin" as const,
  points: 50000,
  createdAt: new Date(),
}

export const POINT_CONVERSION_RATE = 1000 // 1000 points = 1 rupiah
