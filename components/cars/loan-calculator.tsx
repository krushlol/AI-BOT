"use client"

import { useState, useMemo } from "react"
import { Calculator } from "lucide-react"

interface LoanCalculatorProps {
  basePrice: number
  maxPrice: number
}

const TERMS = [24, 36, 48, 60, 72, 84]

export default function LoanCalculator({ basePrice, maxPrice }: LoanCalculatorProps) {
  const [price, setPrice] = useState(basePrice)
  const [downPayment, setDownPayment] = useState(Math.round(basePrice * 0.15))
  const [termMonths, setTermMonths] = useState(60)
  const [apr, setApr] = useState(7.0)
  const [aprInput, setAprInput] = useState("7.0")

  const { monthly, loanAmount, totalInterest, totalCost, principalPct } = useMemo(() => {
    const P = Math.max(0, price - downPayment)
    const n = termMonths
    const r = apr / 100 / 12

    let monthly: number
    if (r === 0) {
      monthly = P / n
    } else {
      monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    }

    const totalPaid = monthly * n
    const totalInterest = totalPaid - P
    const principalPct = P > 0 ? Math.round((P / totalPaid) * 100) : 100

    return {
      monthly,
      loanAmount: P,
      totalInterest: Math.max(0, totalInterest),
      totalCost: price - downPayment + totalInterest + downPayment,
      principalPct,
    }
  }, [price, downPayment, termMonths, apr])

  const fmt = (n: number) => "$" + Math.round(n).toLocaleString()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <Calculator className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-bold text-gray-900">Monthly Payment Estimator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: inputs */}
        <div className="space-y-5">
          {/* Vehicle price */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Vehicle price</label>
              <span className="text-sm font-bold text-gray-900">{fmt(price)}</span>
            </div>
            <input
              type="range"
              min={basePrice}
              max={maxPrice}
              step={500}
              value={price}
              onChange={(e) => {
                const p = Number(e.target.value)
                setPrice(p)
                setDownPayment(Math.min(downPayment, p))
              }}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>{fmt(basePrice)}</span>
              <span>{fmt(maxPrice)}</span>
            </div>
          </div>

          {/* Down payment */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Down payment</label>
              <span className="text-sm font-bold text-gray-900">{fmt(downPayment)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={price}
              step={500}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>$0</span>
              <span>{fmt(price)}</span>
            </div>
          </div>

          {/* APR */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Interest rate (APR)</label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={aprInput}
                  onChange={(e) => {
                    setAprInput(e.target.value)
                    const v = parseFloat(e.target.value)
                    if (!isNaN(v) && v >= 0 && v <= 25) setApr(v)
                  }}
                  className="w-14 text-sm font-bold text-right border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-orange-300"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
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
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>0%</span>
              <span>25%</span>
            </div>
          </div>

          {/* Loan term */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Loan term</label>
            <div className="flex gap-2 flex-wrap">
              {TERMS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTermMonths(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    termMonths === t
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t}mo
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: output */}
        <div className="flex flex-col justify-center">
          <div className="bg-orange-50 rounded-xl p-5 text-center mb-4">
            <p className="text-xs text-orange-600 font-medium uppercase tracking-wide mb-1">Est. monthly payment</p>
            <p className="text-4xl font-bold text-orange-600">{fmt(monthly)}<span className="text-lg font-normal text-orange-400">/mo</span></p>
            <p className="text-xs text-gray-400 mt-1">Based on {termMonths}-month loan at {apr.toFixed(1)}% APR</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Loan amount</span>
              <span className="font-medium text-gray-900">{fmt(loanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total interest</span>
              <span className="font-medium text-gray-900">{fmt(totalInterest)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <span className="text-gray-700 font-medium">Total cost</span>
              <span className="font-bold text-gray-900">{fmt(totalCost)}</span>
            </div>
          </div>

          {/* Principal vs interest bar */}
          <div className="mt-4">
            <div className="flex rounded-full overflow-hidden h-2">
              <div className="bg-orange-500 transition-all" style={{ width: `${principalPct}%` }} />
              <div className="bg-amber-200 flex-1" />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />Principal {principalPct}%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-200 inline-block" />Interest {100 - principalPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
