import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CashVault - Save, Secure, and Grow Your Finances",
  description:
    "The savings-first platform built to help you lock your money, save toward your goals, and build wealth through disciplined saving and DCA strategies.",
  generator: "v0.app",
  openGraph: {
    title: "CashVault - Save, Secure, and Grow Your Finances",
    description:
      "The savings-first platform built to help you lock your money, save toward your goals, and build wealth through disciplined saving and DCA strategies.",
    url: "https://cashvault.app",
    siteName: "CashVault",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CashVault - Your Financial Savings Partner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CashVault - Save, Secure, and Grow Your Finances",
    description:
      "The savings-first platform built to help you lock your money, save toward your goals, and build wealth through disciplined saving.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
