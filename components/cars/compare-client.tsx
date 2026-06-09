"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { X, Plus, CheckCircle, XCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Navbar from "./navbar"
import { Car } from "@/lib/cars/types"
import { useProStatus } from "@/hooks/useProStatus"
import UpgradeModal from "@/components/pricing/upgrade-modal"
import { FREE_COMPARE_LIMIT, PRO_COMPARE_LIMIT } from "@/lib/plans"

interface CompareClientProps {
  user: { email?: string } | null
  allCars: Car[]
  initialIds: string[]
}

const fuelLabel = (f: string) => (f === "plug-in hybrid" ? "PHEV" : f.charAt(0).toUpperCase() + f.slice(1))

type RowGroup = {
  group: string
  rows: { label: string; key: (car: Car) => string | number | null }[]
}

const specGroups: RowGroup[] = [
  {
    group: "Performance",
    rows: [
      { label: "Horsepower", key: (c) => `${c.specs.horsepower} hp` },
      { label: "Torque", key: (c) => `${c.specs.torque} lb-ft` },
      { label: "0–60 mph", key: (c) => c.specs.zeroToSixty ? `${c.specs.zeroToSixty}s` : "N/A" },
      { label: "Top Speed", key: (c) => c.specs.topSpeed ? `${c.specs.topSpeed} mph` : "N/A" },
      { label: "Engine", key: (c) => c.specs.engine },
      { label: "Transmission", key: (c) => c.specs.transmission },
      { label: "Drive Type", key: (c) => c.specs.driveType },
    ],
  },
  {
    group: "Efficiency",
    rows: [
      { label: "MPG City", key: (c) => c.specs.mpgCity ?? "—" },
      { label: "MPG Highway", key: (c) => c.specs.mpgHighway ?? "—" },
      { label: "MPG Combined", key: (c) => c.specs.mpgCombined ?? "—" },
      { label: "Electric Range", key: (c) => c.specs.electricRange ? `${c.specs.electricRange} mi` : "—" },
      { label: "Total Range", key: (c) => c.specs.totalRange ? `${c.specs.totalRange} mi` : "—" },
      { label: "Battery", key: (c) => c.specs.batteryCapacity ? `${c.specs.batteryCapacity} kWh` : "—" },
      { label: "Charge Time", key: (c) => c.specs.chargingTime ?? "—" },
    ],
  },
  {
    group: "Practicality",
    rows: [
      { label: "Seating", key: (c) => `${c.specs.seating} passengers` },
      { label: "Cargo Space", key: (c) => `${c.specs.cargo} cu.ft.` },
      { label: "Towing Capacity", key: (c) => c.specs.towingCapacity ? `${c.specs.towingCapacity.toLocaleString()} lbs` : "—" },
    ],
  },
  {
    group: "Pricing",
    rows: [
      { label: "Starting Price", key: (c) => `$${c.basePrice.toLocaleString()}` },
      { label: "Top Price", key: (c) => `$${c.maxPrice.toLocaleString()}` },
      { label: "Body Style", key: (c) => c.bodyStyle },
      { label: "Fuel Type", key: (c) => fuelLabel(c.fuelType) },
    ],
  },
  {
    group: "Safety",
    rows: [
      { label: "Safety Rating", key: (c) => c.safety.rating ?? "—" },
      { label: "Rating Source", key: (c) => c.safety.ratingSource ?? "—" },
    ],
  },
]

export default function CompareClient({ user, allCars, initialIds }: CompareClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const router = useRouter()
  const { isPro } = useProStatus()

  const compareLimit = isPro ? PRO_COMPARE_LIMIT : FREE_COMPARE_LIMIT

  const selectedCars = useMemo(
    () => selectedIds.map((id) => allCars.find((c) => c.id === id)).filter(Boolean) as Car[],
    [selectedIds, allCars]
  )

  const addCar = (id: string) => {
    if (selectedIds.includes(id)) return
    if (selectedIds.length >= compareLimit) {
      setShowUpgradeModal(true)
      return
    }
    setSelectedIds([...selectedIds, id])
  }

  const removeCar = (id: string) => setSelectedIds(selectedIds.filter((i) => i !== id))

  const availableCars = allCars.filter((c) => !selectedIds.includes(c.id))

  const getCellClass = (label: string, values: (string | number | null)[]) => {
    if (selectedCars.length < 2) return ""
    const numVals = values.map((v) => typeof v === "string" ? parseFloat(v.replace(/[^0-9.]/g, "")) : null).filter((n) => n !== null && !isNaN(n as number)) as number[]
    if (numVals.length < 2) return ""
    const max = Math.max(...numVals)
    const min = Math.min(...numVals)
    const goodHigher = ["Horsepower", "Torque", "Top Speed", "Electric Range", "Total Range", "MPG City", "MPG Highway", "MPG Combined", "Seating", "Cargo Space", "Towing Capacity"]
    const goodLower = ["0–60 mph", "Starting Price", "Top Price", "Charge Time"]
    return { max, min, goodHigher: goodHigher.includes(label), goodLower: goodLower.includes(label) } as any
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} reason="compare" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Cars</h1>
          <p className="text-gray-600">
            {isPro ? "Compare up to 4 cars side-by-side" : `Compare up to ${FREE_COMPARE_LIMIT} cars · `}
            {!isPro && <a href="/pricing" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"><Zap className="w-3 h-3" />Upgrade for 4</a>}
          </p>
        </div>

        {/* Car selector row */}
        <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: `repeat(${Math.max(selectedCars.length + (selectedCars.length < 4 ? 1 : 0), 2)}, minmax(0, 1fr))` }}>
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
                <p className="text-xs text-blue-600 font-semibold">{car.brand}</p>
                <p className="font-bold text-sm">{car.year} {car.model}</p>
                <p className="text-xs text-gray-500">${car.basePrice.toLocaleString()}</p>
              </div>
            </div>
          ))}
          {selectedCars.length < compareLimit && (
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
          {selectedCars.length >= compareLimit && !isPro && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-dashed border-blue-300 p-4 flex flex-col items-center justify-center gap-2 min-h-[160px] hover:border-blue-400 transition-colors"
            >
              <Zap className="w-6 h-6 text-blue-500" />
              <p className="text-xs text-blue-700 font-semibold text-center">Add 2 more with Pro</p>
              <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-bold">Upgrade</span>
            </button>
          )}
        </div>

        {selectedCars.length < 2 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Select at least 2 cars to start comparing</p>
          </div>
        ) : (
          <div className="space-y-4">
            {specGroups.map(({ group, rows }) => (
              <div key={group} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <h3 className="font-bold text-gray-900">{group}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {rows.map(({ label, key }) => {
                    const values = selectedCars.map((c) => key(c))
                    const numVals = values.map((v) => {
                      const n = parseFloat(String(v).replace(/[^0-9.]/g, ""))
                      return isNaN(n) ? null : n
                    })
                    const goodHigher = ["Horsepower", "Torque", "Top Speed", "Electric Range", "Total Range", "MPG City", "MPG Highway", "MPG Combined", "Seating", "Cargo Space", "Towing Capacity"]
                    const goodLower = ["0–60 mph", "Starting Price", "Top Price"]
                    const validNums = numVals.filter((n) => n !== null) as number[]
                    const maxVal = validNums.length > 0 ? Math.max(...validNums) : null
                    const minVal = validNums.length > 0 ? Math.min(...validNums) : null

                    return (
                      <div key={label} className="grid px-6 py-3" style={{ gridTemplateColumns: `180px repeat(${selectedCars.length}, minmax(0, 1fr))` }}>
                        <span className="text-sm text-gray-600 font-medium self-center">{label}</span>
                        {values.map((val, idx) => {
                          const num = numVals[idx]
                          let cellClass = ""
                          if (validNums.length > 1 && num !== null && maxVal !== null && minVal !== null && maxVal !== minVal) {
                            if (goodHigher.includes(label)) {
                              cellClass = num === maxVal ? "text-green-700 font-semibold bg-green-50 rounded" : num === minVal ? "text-red-600" : ""
                            } else if (goodLower.includes(label)) {
                              cellClass = num === minVal ? "text-green-700 font-semibold bg-green-50 rounded" : num === maxVal ? "text-red-600" : ""
                            }
                          }
                          return (
                            <span key={idx} className={`text-sm text-center px-2 py-0.5 ${cellClass}`}>
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

            {/* Pros vs Cons comparison */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h3 className="font-bold text-gray-900">Pros & Cons</h3>
              </div>
              <div className="grid divide-x divide-gray-100" style={{ gridTemplateColumns: `repeat(${selectedCars.length}, minmax(0, 1fr))` }}>
                {selectedCars.map((car) => (
                  <div key={car.id} className="p-4">
                    <p className="font-semibold text-xs text-gray-600 mb-2">{car.brand} {car.model}</p>
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
