"use client"

import { useAuthStore } from "@/lib/auth-store"

export function useTransaction() {
  const transactions = useAuthStore((state) => state.transactions)
  const addTransaction = useAuthStore((state) => state.addTransaction)
  const updateTransactionStatus = useAuthStore((state) => state.updateTransactionStatus)
  const getTransactions = useAuthStore((state) => state.getTransactions)

  return {
    transactions,
    addTransaction,
    updateTransactionStatus,
    getTransactions,
  }
}
