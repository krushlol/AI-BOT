"use client"

import { useState, useEffect } from "react"
import Navbar from "./navbar"
import { DollarSign, Percent, Calendar, TrendingDown, Info } from "lucide-react"
import Link from "next/link"
import { cars } from "@/lib/cars/data"

interface CalculatorClientProps {
  user: { email?: string } | null
}

const TERMS = [24, 36, 48, 60, 72, 84]

function calcPayment(price: number, downPayment: number, termMonths: number, aprPercent: number) {
  const principal = Math.max(0, price - downPayment)
  if (principal === 0) return { monthly: 0, totalInterest: 0, totalCost: price, principal: 0 }
  if (aprPercent === 0) {
    const monthly = principal / termMonths
    return { monthly, totalInterest: 0, totalCost: price, principal }
  }
  const r = aprPercent / 100 / 12
  const n = termMonths
  const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const totalPaid = monthly * n
  const totalInterest = totalPaid - principal
  const totalCost = downPayment + totalPaid
  return { monthly, totalInterest, totalCost, principal }
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 })
}

export default function CalculatorClient({ user }: CalculatorClientProps) {
  const [price, setPrice] = useState(35000)
  const [downPct, setDownPct] = useState(15)
  const [downAmt, setDownAmt] = useState(Math.round(35000 * 0.15))
  const [lastEdited, setLastEdited] = useState<"pct" | "amt">("pct")
  const [term, setTerm] = useState(60)
  const [apr, setApr] = useState(7.0)
  const [aprInput, setAprInput] = useState("7.0")

  // Keep down payment in sync
  useEffect(() => {
    if (lastEdited === "pct") {
      setDownAmt(Math.round(price * downPct / 100))
    }
  }, [price, downPct, lastEdited])

  const downPayment = Math.min(downAmt, price)
  const { monthly, totalInterest, totalCost, principal } = calcPayment(price, downPayment, term, apr)
  const principalPct = totalCost > 0 ? (price / totalCost) * 100 : 100
  const interestPct = 100 - principalPct

  // Popular cars for quick-select
  const popularCars = cars.slice(0, 8)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Car Loan Calculator</h1>
          <p className="text-gray-500">Estimate your monthly payment before you visit the dealership.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Inputs — left/top */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 space-y-6">

            {/* Vehicle Price */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-blue-500" /> Vehicle Price
                </label>
                <span className="text-sm font-bold text-gray-900">${fmt(price)}</span>
              </div>
              <input
                type="range"
                min={5000}
                max={200000}
                step={500}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>$5,000</span><span>$200,000</span>
              </div>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Down Payment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-green-500" /> Down Payment
                </label>
                <span className="text-sm font-bold text-gray-900">${fmt(downPayment)} ({Math.round((downPayment / price) * 100)}%)</span>
              </div>
              <input
                type="range"
                min={0}
                max={price}
                step={500}
                value={downPayment}
                onChange={(e) => {
                  const amt = Number(e.target.value)
                  setDownAmt(amt)
                  setDownPct(Math.round((amt / price) * 100))
                  setLastEdited("amt")
                }}
                className="w-full accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>$0</span><span>${fmt(price)}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  value={downAmt}
                  onChange={(e) => {
                    const amt = Math.min(price, Math.max(0, Number(e.target.value)))
                    setDownAmt(amt)
                    setDownPct(Math.round((amt / price) * 100))
                    setLastEdited("amt")
                  }}
                  placeholder="$ Amount"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="relative">
                  <input
                    type="number"
                    value={downPct}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const pct = Math.min(100, Math.max(0, Number(e.target.value)))
                      setDownPct(pct)
                      setDownAmt(Math.round(price * pct / 100))
                      setLastEdited("pct")
                    }}
                    className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                </div>
              </div>
            </div>

            {/* Loan Term */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                <Calendar className="w-4 h-4 text-purple-500" /> Loan Term
              </label>
              <div className="grid grid-cols-6 gap-2">
                {TERMS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTerm(t)}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                      term === t
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {t}mo
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{term} months = {(term / 12).toFixed(1)} years</p>
            </div>

            {/* APR */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-amber-500" /> Interest Rate (APR)
                </label>
                <span className="text-sm font-bold text-gray-900">{apr.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={0.1}
                value={apr}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setApr(v)
                  setAprInput(v.toFixed(1))
                }}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span><span>25%</span>
              </div>
              <div className="flex gap-2 mt-2 items-center">
                <input
                  type="number"
                  value={aprInput}
                  step={0.1}
                  min={0}
                  max={25}
                  onChange={(e) => setAprInput(e.target.value)}
                  onBlur={() => {
                    const v = Math.min(25, Math.max(0, parseFloat(aprInput) || 0))
                    setApr(v)
                    setAprInput(v.toFixed(1))
                  }}
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">% APR</span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Info className="w-3 h-3" /> Avg new car: ~7–8%</span>
              </div>
            </div>
          </div>

          {/* Results — right/bottom */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Monthly payment highlight */}
            <div className="bg-blue-600 text-white rounded-2xl p-6 text-center">
              <p className="text-blue-200 text-sm font-medium mb-1">Estimated Monthly Payment</p>
              <p className="text-5xl font-extrabold">${fmt(monthly)}</p>
              <p className="text-blue-200 text-sm mt-2">{term} months · {apr.toFixed(1)}% APR</p>
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Cost Breakdown</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vehicle price</span>
                <span className="font-semibold">${fmt(price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Down payment</span>
                <span className="font-semibold text-green-600">− ${fmt(downPayment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Loan amount</span>
                <span className="font-semibold">${fmt(principal)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                <span className="text-gray-500">Total interest</span>
                <span className="font-semibold text-amber-600">${fmt(totalInterest)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-700">Total cost</span>
                <span>${fmt(totalCost)}</span>
              </div>

              {/* Visual bar */}
              <div className="mt-2">
                <div className="h-3 rounded-full overflow-hidden flex bg-gray-100">
                  <div
                    className="bg-blue-500 transition-all duration-300"
                    style={{ width: `${principalPct}%` }}
                  />
                  <div
                    className="bg-amber-400 transition-all duration-300"
                    style={{ width: `${interestPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="flex items-center gap-1 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Principal {Math.round(principalPct)}%</span>
                  <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Interest {Math.round(interestPct)}%</span>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-xs text-green-700">
              <p className="font-semibold mb-1">💡 Quick tip</p>
              A larger down payment or shorter term saves on interest — but increases monthly payments. Aim to keep your monthly payment under 15% of take-home pay.
            </div>
          </div>
        </div>

        {/* Quick-pick from catalog */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Start with a car from our catalog</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularCars.map((car) => (
              <button
                key={car.id}
                onClick={() => setPrice(car.basePrice)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  price === car.basePrice
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <p className="text-xs text-blue-600 font-medium">{car.brand}</p>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{car.year} {car.model}</p>
                <p className="text-xs text-gray-500 mt-0.5">${car.basePrice.toLocaleString()}</p>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Want full specs?{" "}
            <Link href="/search" className="text-blue-600 hover:underline font-medium">Browse all cars →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
