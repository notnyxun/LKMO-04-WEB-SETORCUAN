export interface WasteTransaction {
  id: string
  userId: string
  username: string
  wasteType: "Plastik" | "Kardus" | "Kayu" | "Logam"
  weight: number
  location: Location
  status: "pending" | "berhasil"
  points: number
  createdAt: Date
  completedAt?: Date
}

export interface PointTransaction {
  id: string
  userId: string
  username: string
  points: number
  amount: number
  eWalletType: string
  eWalletNumber: string
  status: "pending" | "berhasil"
  createdAt: Date
  completedAt?: Date
}

export interface Location {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  phone: string
}

export type Transaction = WasteTransaction | PointTransaction
