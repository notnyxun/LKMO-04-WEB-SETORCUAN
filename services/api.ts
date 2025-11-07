"use client"

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export const api = {
  // Auth endpoints
  auth: {
    register: async (data: any) => {
      if (API_MODE === "mock") return { success: true }
      return fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json())
    },
    login: async (username: string, password: string) => {
      if (API_MODE === "mock") {
        const key =
          username === "admin" || username === "admin@example.com"
            ? "admin|admin@example.com"
            : "johndoe|john@example.com"
        const mockUser = {
          "johndoe|john@example.com": {
            id: "1231456",
            username: "johndoe",
            email: "john@example.com",
            password: "password123",
            whatsapp: "081234567890",
            ewallet: "ovo",
            ewalletNumber: "081234567890",
            role: "user",
            totalKg: 10,
            totalCoins: 5,
            coinExchanged: 10000,
            coinRemaining: 1000,
            transactions: [],
            profileCompleted: true,
          },
          "admin|admin@example.com": {
            id: "ADMIN001",
            username: "admin",
            email: "admin@example.com",
            password: "admin123",
            whatsapp: "081234567891",
            ewallet: "none",
            ewalletNumber: "",
            role: "admin",
            totalKg: 0,
            totalCoins: 0,
            coinExchanged: 0,
            coinRemaining: 0,
            transactions: [],
            profileCompleted: true,
          },
        }
        return {
          token: "mock-token-" + Date.now(),
          user: mockUser[key],
        }
      }
      return fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }).then((r) => r.json())
    },
    logout: async () => {
      if (API_MODE === "mock") return { success: true }
      return fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((r) => r.json())
    },
  },

  // User endpoints
  user: {
    getProfile: async () => {
      if (API_MODE === "mock") return { id: 1, username: "john_doe", email: "john@example.com" }
      return fetch(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((r) => r.json())
    },
    updateProfile: async (data: any) => {
      if (API_MODE === "mock") return { success: true }
      return fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      }).then((r) => r.json())
    },
    updatePassword: async (oldPassword: string, newPassword: string) => {
      if (API_MODE === "mock") return { success: true }
      return fetch(`${API_URL}/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      }).then((r) => r.json())
    },
  },

  // Transaction endpoints
  transaction: {
    submitSampah: async (data: any) => {
      if (API_MODE === "mock") return { success: true, id: "TRX-" + Date.now() }
      return fetch(`${API_URL}/transactions/sampah`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      }).then((r) => r.json())
    },
    submitPoin: async (data: any) => {
      if (API_MODE === "mock") return { success: true, id: "TRX-" + Date.now() }
      return fetch(`${API_URL}/transactions/poin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      }).then((r) => r.json())
    },
    getHistory: async () => {
      if (API_MODE === "mock") return []
      return fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((r) => r.json())
    },
  },

  // Admin endpoints
  admin: {
    getTransactions: async () => {
      if (API_MODE === "mock") return []
      return fetch(`${API_URL}/admin/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((r) => r.json())
    },
    updateTransactionStatus: async (id: string, status: string) => {
      if (API_MODE === "mock") return { success: true }
      return fetch(`${API_URL}/admin/transactions/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      }).then((r) => r.json())
    },
    cancelTransaction: async (id: string) => {
      if (API_MODE === "mock") return { success: true }
      return fetch(`${API_URL}/admin/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((r) => r.json())
    },
    adjustPoints: async (userId: string, amount: number) => {
      if (API_MODE === "mock") return { success: true }
      return fetch(`${API_URL}/admin/points/adjust`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId, amount }),
      }).then((r) => r.json())
    },
  },

  // Location endpoints
  location: {
    getAll: async () => {
      if (API_MODE === "mock") {
        return [
          { id: 1, name: "Lokasi 1", lat: -6.2088, lng: 106.8456 },
          { id: 2, name: "Lokasi 2", lat: -6.1944, lng: 106.8296 },
          { id: 3, name: "Lokasi 3", lat: -6.1753, lng: 106.8249 },
        ]
      }
      return fetch(`${API_URL}/locations`).then((r) => r.json())
    },
  },

  // Waste prices endpoints
  wastePrice: {
    getAll: async () => {
      if (API_MODE === "mock") {
        return [
          { id: 1, category: "Plastik", points: 5000 },
          { id: 2, category: "Kardus", points: 4000 },
          { id: 3, category: "Kaca", points: 7000 },
        ]
      }
      return fetch(`${API_URL}/waste-prices`).then((r) => r.json())
    },
  },
}
