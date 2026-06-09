"use client"

import { useState } from "react"
import { X, Sparkles, Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  reason: "compare" | "save"
}

const PRO_FEATURES = [
  "Compare up to 4 cars side-by-side",
  "Save unlimited cars to your dashboard",
  "Download PDF comparison sheets",
  "\"Is this a good deal?\" price analysis on every car",
  "Total cost of ownership calculator (insurance + fuel + maintenance)",
  "Exclusive dealer negotiation tips for each car",
  "Ad-free experience",
  "Pro badge on your profile",
]

export default function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const headline = reason === "compare"
    ? "Compare more cars with Pro"
    : "Save more cars with Pro"
  const subtext = reason === "compare"
    ? "Free accounts can compare 2 cars. Upgrade to compare up to 4 at once."
    : "Free accounts can save 3 cars. Upgrade to save as many as you want."

  const handleUpgrade = async (plan: "monthly" | "annual") => {
    setLoading(plan)
    setError(null)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.error === "stripe_not_configured") {
        setLoading(null)
        setError("Payments are not yet fully configured. The owner needs to connect Stripe.")
        return
      }
      if (!res.ok || !data.url) {
        setLoading(null)
        setError("Something went wrong. Please try again.")
        return
      }
      window.location.href = data.url
    } catch {
      setLoading(null)
      setError("Network error. Please check your connection.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">{headline}</h2>
          <p className="text-gray-500 text-sm">{subtext}</p>
        </div>

        <ul className="space-y-2 mb-6">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm text-amber-800">⚠️ {error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleUpgrade("annual")}
            disabled={!!loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading === "annual" ? "Redirecting…" : (
              <>
                <Zap className="w-4 h-4" />
                Get Pro — $39/year
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Save 35%</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleUpgrade("monthly")}
            disabled={!!loading}
            className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-all text-sm disabled:opacity-60"
          >
            {loading === "monthly" ? "Redirecting…" : "$4.99/month"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          Cancel anytime · Secure checkout via Stripe ·{" "}
          <Link href="/pricing" className="text-blue-500 hover:underline" onClick={onClose}>
            See full plan details
          </Link>
        </p>
      </div>
    </div>
  )
}
