"use client"

import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import Navbar from "./navbar"
import DepreciationCard from "./depreciation-card"
import { Car } from "@/lib/cars/types"

interface Props {
  user: SupabaseUser | null
  cars: Car[]
}

export default function DepreciationPageClient({ user, cars }: Props) {
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string>(cars[0].id)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return cars.slice(0, 8)
    return cars.filter(c =>
      `${c.year} ${c.brand} ${c.model}`.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [query, cars])

  const selectedCar = cars.find(c => c.id === selectedId) ?? cars[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            📉 Resale Value & Depreciation
          </h1>
          <p className="text-gray-500 text-base">
            See how much any car loses per day — and what it'll be worth in 1, 3, and 5 years.
          </p>
        </div>

        {/* Car picker */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Select a car</p>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by brand, model, or year…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Results list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map(car => (
              <button
                key={car.id}
                onClick={() => setSelectedId(car.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  car.id === selectedId
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"
                }`}
              >
                <img
                  src={car.image}
                  alt={car.model}
                  className="w-14 h-10 object-cover rounded-lg shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs text-orange-500 font-semibold">{car.brand}</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{car.year} {car.model}</p>
                  <p className="text-xs text-gray-400">${car.basePrice.toLocaleString()}</p>
                </div>
                {car.id === selectedId && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No cars match "{query}"</p>
          )}
        </div>

        {/* Depreciation card for selected car */}
        <DepreciationCard car={selectedCar} />
      </div>
    </div>
  )
}
