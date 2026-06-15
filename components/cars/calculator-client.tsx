"use client"

import { useState } from "react"
import Navbar from "./navbar"
import Link from "next/link"
import { cars } from "@/lib/cars/data"

interface CalculatorClientProps {
  user: { email?: string } | null
}

const TERMS = [36, 48, 60, 72, 84]

function calcMonthly(price: number, downPct: number, termMonths: number, apr: number) {
  const principal = Math.max(0, price * (1 - downPct / 100))
  if (principal === 0 || apr === 0) return principal / termMonths
  const r = apr / 100 / 12
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1)
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("en-US")
}

export default function CalculatorClient({ user }: CalculatorClientProps) {
  const [price, setPrice] = useState(35000)
  const [downPct, setDownPct] = useState(15)
  const [term, setTerm] = useState(60)
  const [apr, setApr] = useState(7)

  const downAmt = Math.round(price * downPct / 100)
  const principal = price - downAmt
  const monthly = calcMonthly(price, downPct, term, apr)
  const totalPaid = monthly * term + downAmt
  const totalInterest = Math.max(0, totalPaid - price)

  const popularCars = cars.slice(0, 6)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Car Payment Calculator</h1>
          <p className="text-gray-500">See what your monthly payment might look like.</p>
        </div>

        {/* Monthly payment result — always visible at top */}
        <div className="bg-blue-600 text-white rounded-2xl p-8 text-center mb-6 shadow-lg">
          <p className="text-blue-200 text-sm font-medium mb-1">Estimated Monthly Payment</p>
          <p className="text-6xl font-extrabold tracking-tight">${fmt(monthly)}</p>
          <p className="text-blue-200 text-sm mt-3">
            {term} months &nbsp;·&nbsp; {apr}% interest &nbsp;·&nbsp; ${fmt(downAmt)} down
          </p>
        </div>

        {/* Inputs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-7 mb-6">

          {/* Vehicle Price */}
          <div>
            <div className="flex justify-between items-baseline mb-3">
              <label className="font-semibold text-gray-800">Vehicle Price</label>
              <span className="text-2xl font-bold text-gray-900">${fmt(price)}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={150000}
              step={1000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>$5,000</span><span>$150,000</span>
            </div>
          </div>

          {/* Down Payment */}
          <div>
            <div className="flex justify-between items-baseline mb-3">
              <label className="font-semibold text-gray-800">Down Payment</label>
              <span className="text-2xl font-bold text-gray-900">${fmt(downAmt)} <span className="text-base font-normal text-gray-400">({downPct}%)</span></span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
              className="w-full accent-green-500 h-2 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span><span>50%</span>
            </div>
          </div>

          {/* Loan Term */}
          <div>
            <label className="font-semibold text-gray-800 block mb-3">Loan Length</label>
            <div className="grid grid-cols-5 gap-2">
              {TERMS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTerm(t)}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    term === t
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t / 12}yr
                </button>
              ))}
            </div>
          </div>

          {/* APR */}
          <div>
            <div className="flex justify-between items-baseline mb-3">
              <label className="font-semibold text-gray-800">Interest Rate</label>
              <span className="text-2xl font-bold text-gray-900">{apr}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={apr}
              onChange={(e) => setApr(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1%</span><span className="text-center">Typical: 6–8%</span><span>20%</span>
            </div>
          </div>
        </div>

        {/* Simple summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Car price</span>
              <span className="font-medium">${fmt(price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">You pay upfront</span>
              <span className="font-medium text-green-600">−${fmt(downAmt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount you're financing</span>
              <span className="font-medium">${fmt(principal)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-sm">
              <span className="text-gray-500">Total interest paid</span>
              <span className="font-medium text-amber-600">${fmt(totalInterest)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-gray-800">Total you'll pay</span>
              <span>${fmt(totalPaid)}</span>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 mb-10">
          💡 A good rule of thumb: keep your monthly payment under <strong>15% of your take-home pay</strong>. A bigger down payment means less interest overall.
        </div>

        {/* Quick-pick from catalog */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Try a car from our catalog</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {popularCars.map((car) => (
              <button
                key={car.id}
                onClick={() => setPrice(car.basePrice)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  price === car.basePrice
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <img src={car.image} alt={car.model} className="w-full h-20 object-cover rounded-lg mb-2" />
                <p className="text-xs text-blue-600 font-medium">{car.brand}</p>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{car.model}</p>
                <p className="text-xs text-gray-500 mt-0.5">${car.basePrice.toLocaleString()}</p>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            <Link href="/search" className="text-blue-600 hover:underline font-medium">Browse all 29 cars →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
