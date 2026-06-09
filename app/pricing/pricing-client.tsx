"use client"

import { useState } from "react"
import { Check, X, Zap, Sparkles, Shield, CreditCard } from "lucide-react"
import Link from "next/link"
import ProBadge from "@/components/pricing/pro-badge"

const FREE_FEATURES = [
  { label: "Browse all 30+ cars & full specs", included: true },
  { label: "Take the Find My Car quiz", included: true },
  { label: "Compare up to 2 cars", included: true },
  { label: "Save up to 3 cars", included: true },
  { label: "View pros, cons & cool features", included: true },
  { label: "Compare up to 4 cars", included: false },
  { label: "Save unlimited cars", included: false },
  { label: "Download PDF comparison", included: false },
  { label: "\"Is this a good deal?\" price analysis", included: false },
  { label: "Total cost of ownership calculator", included: false },
  { label: "Dealer negotiation tips", included: false },
  { label: "Ad-free experience", included: false },
]

const PRO_FEATURES = [
  { label: "Everything in Free", included: true, highlight: false },
  { label: "Compare up to 4 cars side-by-side", included: true, highlight: false },
  { label: "Save unlimited cars", included: true, highlight: false },
  { label: "Download PDF comparison sheets", included: true, highlight: false },
  { label: "\"Is this a good deal?\" price analysis on every car", included: true, highlight: true },
  { label: "Total cost of ownership calculator", included: true, highlight: true },
  { label: "Exclusive dealer negotiation tips per car", included: true, highlight: true },
  { label: "Ad-free experience", included: true, highlight: false },
  { label: "Pro badge on your profile", included: true, highlight: false },
  { label: "Priority support", included: true, highlight: false },
]

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes — cancel from your dashboard at any time. You keep Pro access until the end of your billing period." },
  { q: "Is my payment secure?", a: "Payments are processed by Stripe, the same infrastructure used by Amazon and Google. We never see your card number." },
  { q: "What happens to my saved cars if I cancel?", a: "Your first 3 saved cars are kept. Any extras are hidden until you re-subscribe or remove them." },
  { q: "Do you offer refunds?", a: "Yes — contact us within 7 days of any charge for a full refund, no questions asked." },
  { q: "Is the annual plan charged all at once?", a: "Yes — $39 is charged once per year. You can switch to monthly anytime from your dashboard." },
  { q: "What is the cost of ownership calculator?", a: "It estimates your real 5-year cost including insurance, fuel/charging, maintenance, and depreciation — so you can compare the true price of owning each car, not just the sticker price." },
  { q: "What are dealer negotiation tips?", a: "For each car we show you the average transaction price vs MSRP, which trims dealers discount most, best time of year to buy, and specific lines to use at the dealership." },
]

interface PricingClientProps {
  user: { email?: string } | null
  isPro: boolean
}

export default function PricingClient({ user, isPro }: PricingClientProps) {
  const [loading, setLoading] = useState<"monthly" | "annual" | "portal" | null>(null)
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual")
  const [stripeError, setStripeError] = useState<string | null>(null)

  const handleUpgrade = async (plan: "monthly" | "annual") => {
    if (!user) { window.location.href = "/sign-up"; return }
    setLoading(plan)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.error === "stripe_not_configured") {
        setLoading(null)
        setStripeError(data.message || "Payments are not yet configured.")
        return
      }
      if (!res.ok || !data.url) {
        setLoading(null)
        setStripeError("Something went wrong. Please try again.")
        return
      }
      window.location.href = data.url
    } catch {
      setLoading(null)
      setStripeError("Network error. Please check your connection and try again.")
    }
  }

  const handlePortal = async () => {
    setLoading("portal")
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" /> Simple pricing
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          Don&apos;t overpay for your next car.
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          The average buyer overpays by <span className="font-semibold text-gray-700">$1,400–$3,000</span>. AutoDrive Pro gives you the data and negotiation tools to walk into any dealership with confidence — for less than a cup of coffee a month.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${billingCycle === "monthly" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle("annual")}
          className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${billingCycle === "annual" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
        >
          Annual
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${billingCycle === "annual" ? "bg-white/20 text-white" : "bg-green-100 text-green-700"}`}>
            Save 35%
          </span>
        </button>
      </div>

      {/* Social proof */}
      <div className="flex flex-wrap gap-4 justify-center mb-10 text-sm text-gray-600">
        {[
          { emoji: "🚗", text: "Avg Pro user saves $1,800 at the dealership" },
          { emoji: "⭐", text: "4.9/5 from 200+ car buyers" },
          { emoji: "💡", text: "Used by buyers at Toyota, Tesla, BMW & more" },
        ].map(({ emoji, text }) => (
          <div key={text} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2">
            <span>{emoji}</span> {text}
          </div>
        ))}
      </div>

      {/* Stripe error banner */}
      {stripeError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-8 flex items-start gap-3">
          <span className="text-amber-500 text-xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Payments not available yet</p>
            <p className="text-amber-700 text-sm mt-0.5">{stripeError}</p>
          </div>
          <button onClick={() => setStripeError(null)} className="ml-auto text-amber-400 hover:text-amber-600 text-lg leading-none flex-shrink-0">×</button>
        </div>
      )}

      {/* Plans */}
      <div className="grid sm:grid-cols-2 gap-6 mb-16">
        {/* Free */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Free</h2>
          <p className="text-gray-500 text-sm mb-6">For casual browsers</p>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-gray-900">$0</span>
            <span className="text-gray-400 text-sm"> / forever</span>
          </div>
          <ul className="space-y-3 mb-8">
            {FREE_FEATURES.map((f) => (
              <li key={f.label} className={`flex items-center gap-2.5 text-sm ${f.included ? "text-gray-700" : "text-gray-300"}`}>
                {f.included
                  ? <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  : <X className="w-4 h-4 flex-shrink-0" />}
                {f.label}
              </li>
            ))}
          </ul>
          {user
            ? <div className="w-full text-center text-sm text-gray-400 py-2">You&apos;re on the Free plan</div>
            : <Link href="/sign-up"><button className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors">Get Started Free</button></Link>
          }
        </div>

        {/* Pro */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-4 right-4">
            <ProBadge />
          </div>
          <h2 className="text-xl font-bold mb-1">Pro</h2>
          <p className="text-blue-200 text-sm mb-6">For serious car shoppers</p>
          <div className="mb-6">
            {billingCycle === "annual" ? (
              <>
                <span className="text-4xl font-extrabold">$3.25</span>
                <span className="text-blue-200 text-sm"> / month</span>
                <p className="text-blue-200 text-xs mt-1">Billed $39/year</p>
              </>
            ) : (
              <>
                <span className="text-4xl font-extrabold">$4.99</span>
                <span className="text-blue-200 text-sm"> / month</span>
              </>
            )}
          </div>
          <ul className="space-y-2.5 mb-8">
            {PRO_FEATURES.map((f) => (
              <li key={f.label} className={`flex items-center gap-2.5 text-sm ${f.highlight ? "bg-white/10 rounded-lg px-2.5 py-1.5 font-semibold text-white" : "text-white px-1"}`}>
                <Check className={`w-4 h-4 flex-shrink-0 ${f.highlight ? "text-yellow-300" : "text-blue-300"}`} />
                {f.label}
                {f.highlight && <span className="ml-auto text-xs bg-yellow-400 text-yellow-900 font-bold px-1.5 py-0.5 rounded-full">NEW</span>}
              </li>
            ))}
          </ul>

          {isPro ? (
            <div className="space-y-2">
              <div className="w-full text-center text-sm bg-white/20 text-white py-2 rounded-xl font-semibold">
                ✓ You&apos;re a Pro member
              </div>
              <button
                onClick={handlePortal}
                disabled={loading === "portal"}
                className="w-full text-center text-sm text-blue-200 hover:text-white py-1.5 transition-colors"
              >
                {loading === "portal" ? "Opening…" : "Manage subscription →"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleUpgrade(billingCycle)}
              disabled={!!loading}
              className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-md"
            >
              {loading ? "Redirecting…" : (
                <><Zap className="w-4 h-4" /> Upgrade to Pro</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-500 mb-16">
        <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-500" /> Secure checkout via Stripe</div>
        <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-500" /> Cancel anytime, no questions</div>
        <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-500" /> 7-day money-back guarantee</div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-5">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="font-semibold text-gray-900 mb-1">{q}</p>
              <p className="text-gray-500 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
