"use client"

import { useEffect, useRef, useState } from "react"
import { TrendingDown } from "lucide-react"
import { Car } from "@/lib/cars/types"
import { computeDepreciation } from "@/lib/cars/depreciation"

interface Props { car: Car }

export default function DepreciationCard({ car }: Props) {
  const dep = computeDepreciation(car)
  const [displayedDaily, setDisplayedDaily] = useState(0)
  const rafRef = useRef<number | null>(null)

  // Animate the daily loss ticker from $0 → actual value over ~2s
  useEffect(() => {
    const duration = 2000
    const start = performance.now()
    const target = dep.dailyLoss

    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayedDaily(eased * target)
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [dep.dailyLoss])

  const vsLabel =
    dep.vsSegmentAvg === "better"
      ? `Holds value better than most ${dep.fuelLabel} cars ✅`
      : dep.vsSegmentAvg === "worse"
      ? `Depreciates faster than most ${dep.fuelLabel} cars ⚠️`
      : `Depreciates about average for a ${dep.fuelLabel} car`

  const vsColor =
    dep.vsSegmentAvg === "better" ? "text-green-600" :
    dep.vsSegmentAvg === "worse" ? "text-red-500" : "text-gray-500"

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <TrendingDown className="w-5 h-5 text-orange-500" />
        <h2 className="text-base font-bold text-gray-900">Value Over Time</h2>
        <span className="ml-auto text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
          Est. based on segment averages
        </span>
      </div>

      {/* Depreciation clock */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-5 flex items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide mb-1">Loses today</p>
          <p className="text-3xl font-black text-orange-600 tabular-nums">
            ${displayedDaily.toFixed(2)}
          </p>
        </div>
        <div className="w-px h-12 bg-orange-200" />
        <div className="text-center">
          <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide mb-1">This year</p>
          <p className="text-3xl font-black text-orange-600">
            ${Math.round(dep.yearlyLoss).toLocaleString()}
          </p>
        </div>
        <div className="ml-auto text-xs text-gray-400 text-right leading-relaxed hidden sm:block">
          Based on $
          {car.basePrice.toLocaleString()}<br />purchase price
        </div>
      </div>

      {/* Resale value cards */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Estimated Resale Value</p>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "1 Year", value: dep.values.year1, loss: Math.round((1 - dep.values.year1 / car.basePrice) * 100) },
          { label: "3 Years", value: dep.values.year3, loss: Math.round((1 - dep.values.year3 / car.basePrice) * 100) },
          { label: "5 Years", value: dep.values.year5, loss: Math.round((1 - dep.values.year5 / car.basePrice) * 100) },
        ].map(({ label, value, loss }) => (
          <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-lg font-black text-gray-900">${value.toLocaleString()}</p>
            <p className="text-xs text-red-500 font-semibold mt-0.5">−{loss}%</p>
          </div>
        ))}
      </div>

      {/* Retention bars */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">5-Year Value Retention</p>
      <div className="space-y-2.5 mb-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-700">This car</span>
            <span className="font-bold text-orange-600">{dep.retentionPct5yr}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-1000"
              style={{ width: `${dep.retentionPct5yr}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Avg {dep.fuelLabel} car</span>
            <span className="text-gray-400">{dep.segmentAvgRetention}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-300 rounded-full transition-all duration-1000"
              style={{ width: `${dep.segmentAvgRetention}%` }}
            />
          </div>
        </div>
      </div>

      <p className={`text-xs font-medium ${vsColor}`}>{vsLabel}</p>
    </div>
  )
}
