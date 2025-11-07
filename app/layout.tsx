import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"

// Load font dari Google
const inter = Inter({ subsets: ["latin"] })
const robotoMono = Roboto_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SetorCuan - Tukar Sampah dengan Cuan",
  description: "Platform pertukaran sampah dengan sistem poin yang menguntungkan",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2ecc71" />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
