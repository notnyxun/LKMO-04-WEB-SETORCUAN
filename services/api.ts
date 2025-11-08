"use client"

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "real" 
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

// Helper untuk otentikasi JSON
const getAuthHeaders = () => {
  const persistedState = localStorage.getItem("auth-store");
  if (!persistedState) {
    return { "Content-Type": "application/json" };
  }
  try {
    const authState = JSON.parse(persistedState);
    const token = authState?.state?.token;
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    }
  } catch (e) {
    console.error("Gagal parse auth-store from localStorage:", e);
  }
  return { "Content-Type": "application/json" };
};

// Helper untuk otentikasi FormData (Upload File)
// Perhatikan: Kita TIDAK set 'Content-Type'. Browser akan melakukannya.
const getAuthHeadersForUpload = () => {
  const persistedState = localStorage.getItem("auth-store");
  if (!persistedState) {
    return {};
  }
  try {
    const authState = JSON.parse(persistedState);
    const token = authState?.state?.token;
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
  } catch (e) {
    console.error("Gagal parse auth-store from localStorage:", e);
  }
  return {};
};


export const api = {
  // ... (auth, user, transaction endpoints tetap sama) ...
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
    login: async (usernameOrEmail: string, password: string) => {
      if (API_MODE === "mock") {
        const key =
          usernameOrEmail === "admin" || usernameOrEmail === "admin@example.com"
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
            role: "customer",
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
        // @ts-ignore
        const user = mockUser[key]
        return {
          token: "mock-token-" + Date.now(),
          user: user,
        }
      }
      return fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail: usernameOrEmail, password: password }),
      }).then((r) => r.json())
    },
    logout: async () => {
      return Promise.resolve({ success: true })
    },
  },

  // User endpoints
  user: {
    getProfile: async () => {
      if (API_MODE === "mock") return { id: 1, username: "john_doe", email: "john@example.com" }
      return fetch(`${API_URL}/user/profile`, {
        headers: getAuthHeaders(),
      }).then((r) => r.json())
    },
    updateProfile: async (data: any) => {
      if (API_MODE === "mock") return { success: true }
      return fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then((r) => r.json())
    },
    updatePassword: async (currentPassword: string, newPassword: string) => {
      if (API_MODE === "mock") return { success: true }
      return fetch(`${API_URL}/user/password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      }).then((r) => r.json())
    },
  },

  // Transaction endpoints
  transaction: {
    submitSampah: async (data: any) => {
      if (API_MODE === "mock") return { success: true, id: "TRX-" + Date.now() }
      return fetch(`${API_URL}/transactions/sampah`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then((r) => r.json())
    },
    submitPoin: async (data: any) => {
      if (API_MODE === "mock") return { success: true, id: "TRX-" + Date.now() }
      return fetch(`${API_URL}/transactions/poin`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then((r) => r.json())
    },
    getHistory: async () => {
      if (API_MODE === "mock") return []
      return fetch(`${API_URL}/transactions`, {
        headers: getAuthHeaders(),
      }).then((r) => r.json())
    },
  },

  // Admin endpoints
  admin: {
    getUsers: async () => {
      if (API_MODE === "mock") return []
      return fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeaders(),
      }).then((r) => r.json())
    },
    getTransactions: async () => {
      if (API_MODE === "mock") return []
      return fetch(`${API_URL}/admin/transactions`, {
        headers: getAuthHeaders(),
      }).then((r) => r.json())
    },
    
    // --- FUNGSI BARU UNTUK UPLOAD ---
    uploadProof: async (file: File) => {
      const formData = new FormData();
      formData.append('proof', file); // 'proof' harus sama dengan di upload.single('proof')

      return fetch(`${API_URL}/admin/upload-proof`, {
        method: "POST",
        headers: getAuthHeadersForUpload(), // Gunakan helper khusus upload
        body: formData,
      }).then((r) => r.json());
    },

    updateTransactionStatus: async (id: string, status: string, proofUrl?: string) => {
      if (API_MODE === "mock") return { success: true }
      return fetch(`${API_URL}/admin/transactions/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, proofUrl }),
      }).then((r) => r.json())
    },
    cancelTransaction: async (id: string) => {
      if (API_MODE === "mock") return { success: true }
      return fetch(`${API_URL}/admin/transactions/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: "cancelled" }),
      }).then((r) => r.json())
    },
    adjustPoints: async (userId: string, amount: number, operation: "add" | "subtract") => {
      if (API_MODE === "mock") return { success: true }
      return fetch(`${API_URL}/admin/points/adjust`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, amount, operation }),
      }).then((r) => r.json())
    },
  },

  // Public endpoints
  location: {
    getAll: async () => {
      if (API_MODE === "mock") {
         return [
          { id: "lokasi1", name: "Bank Sampah SetorCuan - Pulau Damar", lat: -5.376526338272906, lng: 105.28818970242115 },
          { id: "lokasi2", name: "Bank Sampah SetorCuan - Raden Saleh", lat: -5.3646679769006695, lng: 105.29603722423592 },
          { id: "lokasi3", name: "Bank Sampah SetorCuan - ITERA", lat: -5.3609809417718, lng: 105.32137968044056 },
        ]
      }
      return fetch(`${API_URL}/locations`).then((r) => r.json())
    },
  },
  wastePrice: {
    getAll: async () => {
      if (API_MODE === "mock") {
        return [
          { id: 1, category: "plastik", points: 5000 },
          { id: 2, category: "kardus", points: 4000 },
          { id: 3, category: "kaca", points: 7000 },
        ]
      }
      return fetch(`${API_URL}/waste-prices`).then((r) => r.json())
    },
  },
}