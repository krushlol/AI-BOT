import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ChatWidget from "@/components/chat/chat-widget"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CarAdvisor — Car Research & Comparison",
  description: "Research, compare, and find your perfect car. Compare specs, prices, features, and reviews for every make and model.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
