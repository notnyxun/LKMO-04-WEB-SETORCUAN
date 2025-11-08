"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth-store" // 2. Impor auth store

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-500 to-emerald-500">
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-4">Welcome to SetorCuan!</h1>
          <p className="text-xl text-black mb-8">Tukarkan Sampah Kalian dengan Cuan!</p>
          
          {}
          <Link href={isAuthenticated ? "/prices" : "/register"}>
            <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white">
              Get Started →
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}