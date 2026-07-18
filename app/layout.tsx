import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import ChatWidget from "@/components/chat/chat-widget"

const GA_ID = "G-KYFYQWTP2X"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://caradvisorusa.com"),
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
      <head>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
      </head>
      <body className={inter.className}>
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
