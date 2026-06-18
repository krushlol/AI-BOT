"use client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

import { useState, useMemo } from "react"
import { X, Plus, CheckCircle, XCircle, Zap, DollarSign, Gauge, Leaf, Link2, Check, Printer } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "./navbar"
import { Car } from "@/lib/cars/types"

interface CompareClientProps {
  user: SupabaseUser | null
  allCars: Car[]
  initialIds: string[]
}

const COMPARE_LIMIT = 4

const fuelLabel = (f: string) => (f === "plug-in hybrid" ? "PHEV" : f.charAt(0).toUpperCase() + f.slice(1))

type RowGroup = {
  group: string
  rows: { label: string; key: (car: Car) => string | number | null; goodHigher?: boolean; goodLower?: boolean }[]
}

const specGroups: RowGroup[] = [
  {
    group: "Performance",
    rows: [
      { label: "Horsepower", key: (c) => `${c.specs.horsepower} hp`, goodHigher: true },
      { label: "Torque", key: (c) => `${c.specs.torque} lb-ft`, goodHigher: true },
      { label: "0–60 mph", key: (c) => c.specs.zeroToSixty ? `${c.specs.zeroToSixty}s` : "N/A", goodLower: true },
      { label: "Top Speed", key: (c) => c.specs.topSpeed ? `${c.specs.topSpeed} mph` : "N/A", goodHigher: true },
      { label: "Engine", key: (c) => c.specs.engine },
      { label: "Transmission", key: (c) => c.specs.transmission },
      { label: "Drive Type", key: (c) => c.specs.driveType },
    ],
  },
  {
    group: "Efficiency",
    rows: [
      { label: "MPG City", key: (c) => c.specs.mpgCity ?? "—", goodHigher: true },
      { label: "MPG Highway", key: (c) => c.specs.mpgHighway ?? "—", goodHigher: true },
      { label: "MPG Combined", key: (c) => c.specs.mpgCombined ?? "—", goodHigher: true },
      { label: "Electric Range", key: (c) => c.specs.electricRange ? `${c.specs.electricRange} mi` : "—", goodHigher: true },
      { label: "Total Range", key: (c) => c.specs.totalRange ? `${c.specs.totalRange} mi` : "—", goodHigher: true },
      { label: "Battery", key: (c) => c.specs.batteryCapacity ? `${c.specs.batteryCapacity} kWh` : "—" },
      { label: "Charge Time", key: (c) => c.specs.chargingTime ?? "—" },
    ],
  },
  {
    group: "Dimensions & Capacity",
    rows: [
      { label: "Seating", key: (c) => `${c.specs.seating} passengers`, goodHigher: true },
      { label: "Cargo Space", key: (c) => `${c.specs.cargo} cu.ft.`, goodHigher: true },
      { label: "Towing Capacity", key: (c) => c.specs.towingCapacity ? `${c.specs.towingCapacity.toLocaleString()} lbs` : "—", goodHigher: true },
      { label: "Payload", key: (c) => c.specs.payloadCapacity ? `${c.specs.payloadCapacity.toLocaleString()} lbs` : "—", goodHigher: true },
    ],
  },
  {
    group: "Pricing",
    rows: [
      { label: "Starting Price", key: (c) => `$${c.basePrice.toLocaleString()}`, goodLower: true },
      { label: "Top Price", key: (c) => `$${c.maxPrice.toLocaleString()}`, goodLower: true },
    ],
  },
]

function generateSummary(cars: Car[]): string[] {
  const lines: string[] = []

  if (cars.length < 2) return lines

  // Best performance (horsepower)
  const sorted = [...cars].sort((a, b) => b.specs.horsepower - a.specs.horsepower)
  if (sorted[0].specs.horsepower > sorted[1].specs.horsepower) {
    lines.push(`⚡ The ${sorted[0].brand} ${sorted[0].model} has the most power with ${sorted[0].specs.horsepower} hp — ${sorted[0].specs.horsepower - sorted[sorted.length - 1].specs.horsepower} hp more than the ${sorted[sorted.length - 1].model}.`)
  }

  // Best 0-60
  const with060 = cars.filter((c) => c.specs.zeroToSixty)
  if (with060.length >= 2) {
    const fastest = [...with060].sort((a, b) => a.specs.zeroToSixty! - b.specs.zeroToSixty!)[0]
    const slowest = [...with060].sort((a, b) => b.specs.zeroToSixty! - a.specs.zeroToSixty!)[0]
    if (fastest.id !== slowest.id) {
      lines.push(`🏎 The ${fastest.brand} ${fastest.model} reaches 60 mph in just ${fastest.specs.zeroToSixty}s — ${(slowest.specs.zeroToSixty! - fastest.specs.zeroToSixty!).toFixed(1)}s faster than the ${slowest.model}.`)
    }
  }

  // Best fuel economy
  const withMpg = cars.filter((c) => c.specs.mpgCombined)
  if (withMpg.length >= 2) {
    const best = [...withMpg].sort((a, b) => b.specs.mpgCombined! - a.specs.mpgCombined!)[0]
    const worst = [...withMpg].sort((a, b) => a.specs.mpgCombined! - b.specs.mpgCombined!)[0]
    if (best.id !== worst.id) {
      lines.push(`⛽ For fuel savings, the ${best.brand} ${best.model} leads with ${best.specs.mpgCombined} MPG combined, beating the ${worst.model} by ${best.specs.mpgCombined! - worst.specs.mpgCombined!} MPG.`)
    }
  }

  // Electric range
  const withEv = cars.filter((c) => c.specs.electricRange && c.specs.electricRange > 0)
  if (withEv.length === 1) {
    const others = cars.filter((c) => c !== withEv[0])
    const restDesc = others.every((c) => c.fuelType === "gasoline" || c.fuelType === "diesel")
      ? "the others run on gasoline only"
      : "the others have no dedicated EV range"
    lines.push(`🔋 Only the ${withEv[0].brand} ${withEv[0].model} offers electric range (${withEv[0].specs.electricRange} mi) — ${restDesc}.`)
  } else if (withEv.length >= 2) {
    const bestEv = [...withEv].sort((a, b) => b.specs.electricRange! - a.specs.electricRange!)[0]
    lines.push(`🔋 The ${bestEv.brand} ${bestEv.model} has the longest electric range at ${bestEv.specs.electricRange} miles.`)
  }

  // Best value (lowest price)
  const cheapest = [...cars].sort((a, b) => a.basePrice - b.basePrice)[0]
  const priciest = [...cars].sort((a, b) => b.basePrice - a.basePrice)[0]
  if (cheapest.id !== priciest.id) {
    lines.push(`💰 The ${cheapest.brand} ${cheapest.model} is the most affordable at $${cheapest.basePrice.toLocaleString()} — $${(priciest.basePrice - cheapest.basePrice).toLocaleString()} less than the ${priciest.model}.`)
  }

  // Most seating
  const mostSeats = [...cars].sort((a, b) => b.specs.seating - a.specs.seating)[0]
  const leastSeats = [...cars].sort((a, b) => a.specs.seating - b.specs.seating)[0]
  if (mostSeats.specs.seating > leastSeats.specs.seating) {
    lines.push(`👨‍👩‍👧 Need more room? The ${mostSeats.brand} ${mostSeats.model} seats ${mostSeats.specs.seating} — ${mostSeats.specs.seating - leastSeats.specs.seating} more than the ${leastSeats.model}.`)
  }

  // Best cargo
  const mostCargo = [...cars].sort((a, b) => b.specs.cargo - a.specs.cargo)[0]
  const leastCargo = [...cars].sort((a, b) => a.specs.cargo - b.specs.cargo)[0]
  if (mostCargo.specs.cargo > leastCargo.specs.cargo + 5) {
    lines.push(`📦 The ${mostCargo.brand} ${mostCargo.model} offers ${mostCargo.specs.cargo} cu.ft. of cargo space — significantly more than the ${leastCargo.model}'s ${leastCargo.specs.cargo} cu.ft.`)
  }

  // Towing
  const withTowing = cars.filter((c) => c.specs.towingCapacity && c.specs.towingCapacity > 0)
  if (withTowing.length === 1) {
    lines.push(`🚛 Only the ${withTowing[0].brand} ${withTowing[0].model} is rated for towing (${withTowing[0].specs.towingCapacity!.toLocaleString()} lbs).`)
  } else if (withTowing.length >= 2) {
    const bestTow = [...withTowing].sort((a, b) => b.specs.towingCapacity! - a.specs.towingCapacity!)[0]
    lines.push(`🚛 For towing, the ${bestTow.brand} ${bestTow.model} tops the group at ${bestTow.specs.towingCapacity!.toLocaleString()} lbs capacity.`)
  }

  return lines.slice(0, 5) // max 5 bullets
}

export default function CompareClient({ user, allCars, initialIds }: CompareClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedCars = useMemo(
    () => selectedIds.map((id) => allCars.find((c) => c.id === id)).filter(Boolean) as Car[],
    [selectedIds, allCars]
  )

  const addCar = (id: string) => {
    if (selectedIds.includes(id) || selectedIds.length >= COMPARE_LIMIT) return
    setSelectedIds([...selectedIds, id])
  }

  const removeCar = (id: string) => setSelectedIds(selectedIds.filter((i) => i !== id))

  const availableCars = allCars.filter((c) => !selectedIds.includes(c.id))
  const summaryLines = useMemo(() => generateSummary(selectedCars), [selectedCars])

  const colCount = selectedCars.length + (selectedCars.length < COMPARE_LIMIT ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Cars</h1>
            <p className="text-gray-600">Compare up to {COMPARE_LIMIT} cars side-by-side</p>
          </div>
          {selectedCars.length >= 2 && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-orange-600 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-orange-600 transition-all print:hidden"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          )}
        </div>

        {/* Car selector row */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${Math.max(colCount, 2)}, minmax(0, 1fr))` }}>
          {selectedCars.map((car) => (
            <div key={car.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="relative">
                <img src={car.image} alt={`${car.brand} ${car.model}`} className="w-full h-32 object-cover" />
                <button
                  onClick={() => removeCar(car.id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs text-orange-500 font-semibold">{car.brand}</p>
                <p className="font-bold text-sm">{car.year} {car.model}</p>
                <p className="text-xs text-gray-500">${car.basePrice.toLocaleString()}</p>
              </div>
            </div>
          ))}
          {selectedCars.length < COMPARE_LIMIT && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center gap-2 min-h-[160px]">
              <Plus className="w-6 h-6 text-gray-400" />
              <p className="text-xs text-gray-500 text-center">Add a car</p>
              <Select onValueChange={addCar}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCars.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.year} {c.brand} {c.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {selectedCars.length < 2 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Select at least 2 cars to start comparing</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Quick Summary */}
            {summaryLines.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-orange-500 px-6 py-3">
                  <h3 className="font-bold text-white">Quick Summary</h3>
                  <p className="text-orange-200 text-xs mt-0.5">Key differences at a glance</p>
                </div>
                <div className="p-5 space-y-3">
                  {summaryLines.map((line, i) => (
                    <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Spec tables */}
            {specGroups.map(({ group, rows }) => (
              <div key={group} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header row with car names */}
                <div
                  className="grid bg-gray-50 border-b"
                  style={{ gridTemplateColumns: `180px repeat(${selectedCars.length}, minmax(0, 1fr))` }}
                >
                  <div className="px-6 py-3">
                    <h3 className="font-bold text-gray-900">{group}</h3>
                  </div>
                  {selectedCars.map((car) => (
                    <div key={car.id} className="px-4 py-3 text-center border-l border-gray-200">
                      <p className="text-xs text-orange-500 font-semibold">{car.brand}</p>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{car.model}</p>
                    </div>
                  ))}
                </div>

                {/* Data rows */}
                <div className="divide-y divide-gray-100">
                  {rows.map(({ label, key, goodHigher, goodLower }) => {
                    const values = selectedCars.map((c) => key(c))
                    const numVals = values.map((v) => {
                      const n = parseFloat(String(v).replace(/[^0-9.]/g, ""))
                      return isNaN(n) ? null : n
                    })
                    const validNums = numVals.filter((n) => n !== null) as number[]
                    const maxVal = validNums.length > 0 ? Math.max(...validNums) : null
                    const minVal = validNums.length > 0 ? Math.min(...validNums) : null

                    return (
                      <div
                        key={label}
                        className="grid"
                        style={{ gridTemplateColumns: `180px repeat(${selectedCars.length}, minmax(0, 1fr))` }}
                      >
                        <span className="px-6 py-3 text-sm text-gray-500 font-medium self-center">{label}</span>
                        {values.map((val, idx) => {
                          const num = numVals[idx]
                          let cellClass = "text-gray-800"
                          if (validNums.length > 1 && num !== null && maxVal !== null && minVal !== null && maxVal !== minVal) {
                            if (goodHigher) {
                              cellClass = num === maxVal ? "text-green-700 font-semibold bg-green-50" : num === minVal ? "text-red-500" : "text-gray-800"
                            } else if (goodLower) {
                              cellClass = num === minVal ? "text-green-700 font-semibold bg-green-50" : num === maxVal ? "text-red-500" : "text-gray-800"
                            }
                          }
                          return (
                            <span
                              key={idx}
                              className={`px-4 py-3 text-sm text-center border-l border-gray-100 self-center ${cellClass}`}
                            >
                              {String(val)}
                            </span>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Pros vs Cons */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header row */}
              <div
                className="grid bg-gray-50 border-b"
                style={{ gridTemplateColumns: `repeat(${selectedCars.length}, minmax(0, 1fr))` }}
              >
                {selectedCars.map((car, i) => (
                  <div key={car.id} className={`px-5 py-3 ${i > 0 ? "border-l border-gray-200" : ""}`}>
                    <p className="text-xs text-orange-500 font-semibold">{car.brand}</p>
                    <p className="font-bold text-gray-900 text-sm">{car.model} — Pros & Cons</p>
                  </div>
                ))}
              </div>
              <div
                className="grid divide-x divide-gray-100"
                style={{ gridTemplateColumns: `repeat(${selectedCars.length}, minmax(0, 1fr))` }}
              >
                {selectedCars.map((car) => (
                  <div key={car.id} className="p-4">
                    <div className="space-y-1 mb-3">
                      {car.pros.map((p) => (
                        <div key={p} className="flex items-start gap-1.5 text-xs text-green-800">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {p}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      {car.cons.map((c) => (
                        <div key={c} className="flex items-start gap-1.5 text-xs text-red-800">
                          <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
