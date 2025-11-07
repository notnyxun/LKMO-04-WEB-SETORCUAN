export const NAVIGATION_ROUTES = {
  PUBLIC: {
    HOME: "/",
    PRICES_LOCATIONS: "/prices-locations",
  },
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },
  USER: {
    DASHBOARD: "/dashboard",
    TUKAR_SAMPAH: "/tukar-sampah",
    TUKAR_POIN: "/tukar-poin",
    HISTORY: "/history-transaksi",
  },
  ADMIN: {
    DASHBOARD: "/admin",
    HISTORY: "/history-transaksi",
  },
} as const

export const WASTE_TYPES = [
  { value: "Plastik", label: "Plastik", pricePerKg: 5000 },
  { value: "Kardus", label: "Kardus", pricePerKg: 5000 },
  { value: "Kayu", label: "Kayu", pricePerKg: 5000 },
  { value: "Logam", label: "Logam", pricePerKg: 8000 },
]

export const EWALLET_TYPES = [
  { value: "Gopay", label: "Gopay" },
  { value: "OVO", label: "OVO" },
  { value: "Dana", label: "Dana" },
  { value: "LinkAja", label: "LinkAja" },
]
