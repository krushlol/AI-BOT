"use client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

import { ArrowLeft, Star, CheckCircle, AlertCircle, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Navbar from "./navbar"
import { LiveCar } from "@/lib/cars/live-types"
import Link from "next/link"
import { useState, useEffect } from "react"

const detailImageCache = new Map<string, string | null>()

interface LiveCarDetailClientProps {
  car: LiveCar
  user: SupabaseUser | null
}

function StarRating({ rating, label }: { rating?: number; label: string }) {
  if (!rating) return null
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
        ))}
        <span className="text-sm font-semibold ml-1">{rating}/5</span>
      </div>
    </div>
  )
}


export default function LiveCarDetailClient({ car, user }: LiveCarDetailClientProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(car.image ?? null)

  useEffect(() => {
    if (car.image) return
    const key = `${car.brand}|${car.model}|${car.year}`
    if (detailImageCache.has(key)) {
      setImageUrl(detailImageCache.get(key) ?? null)
      return
    }
    const bs = car.specs?.bodyClass ? `&bodyStyle=${encodeURIComponent(car.specs.bodyClass)}` : ""
    fetch(`/api/car-image?brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}&year=${car.year}${bs}`)
      .then((r) => r.json())
      .then((data) => {
        detailImageCache.set(key, data.imageUrl ?? null)
        if (data.imageUrl) setImageUrl(data.imageUrl)
      })
      .catch(() => { /* leave as null — show brand placeholder */ })
  }, [car.brand, car.model, car.year, car.image])

  const specRows = car.specs
    ? [
        { label: "Horsepower", value: car.specs.horsepower ? `${car.specs.horsepower} hp` : null },
        { label: "Torque", value: car.specs.torque ? `${car.specs.torque} lb-ft` : null },
        { label: "Cylinders", value: car.specs.cylinders ? String(car.specs.cylinders) : null },
        { label: "Displacement", value: car.specs.displacement ? `${car.specs.displacement}L` : null },
        { label: "Transmission", value: car.specs.transmission ?? null },
        { label: "Drive Type", value: car.specs.driveType ?? null },
        { label: "Fuel Type", value: car.specs.fuelType ?? null },
        { label: "Body Style", value: car.specs.bodyClass ?? null },
        { label: "Seating", value: car.specs.seating ? `${car.specs.seating} passengers` : null },
        { label: "MPG City", value: car.specs.mpgCity ? String(car.specs.mpgCity) : null },
        { label: "MPG Highway", value: car.specs.mpgHighway ? String(car.specs.mpgHighway) : null },
        { label: "MPG Combined", value: car.specs.mpgCombined ? String(car.specs.mpgCombined) : null },
      ].filter((r) => r.value !== null)
    : []

  const hasSpecs = specRows.length > 0
  const hasSafety = !!car.safety

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 mb-6">
          <div className="grid lg:grid-cols-2">
            <div className="relative h-56 lg:h-80 bg-gradient-to-br from-indigo-50 to-gray-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${car.year} ${car.brand} ${car.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-300">
                    <div className="text-7xl font-black">{car.brand[0]}</div>
                    <div className="text-lg">{car.brand}</div>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge className="bg-indigo-600 text-white">Live Data</Badge>
              </div>
            </div>
            <div className="p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">{car.brand}</p>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
                  {car.year} {car.model}
                </h1>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  Live data sourced from NHTSA and API Ninjas. Editorial content (pros/cons, feature lists, pricing) is not available for this vehicle.
                </p>
                {car.safety?.overallRating && (
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (car.safety?.overallRating ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">NHTSA Overall Safety</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Want a full review? Search our <Link href="/search" className="underline font-medium">curated cars</Link> for detailed specs, pros/cons, and trim guides.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        {hasSpecs && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "HP", value: car.specs?.horsepower ? `${car.specs.horsepower} hp` : "—" },
              { label: "MPG", value: car.specs?.mpgCombined ? `${car.specs.mpgCombined} comb` : "—" },
              { label: "Drive", value: car.specs?.driveType ?? "—" },
              { label: "Seats", value: car.specs?.seating ? `${car.specs.seating}` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="font-bold text-gray-900 text-sm">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Specs */}
          {hasSpecs && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                Specifications
                <Badge variant="secondary" className="text-xs font-normal">API Ninjas</Badge>
              </h2>
              <div className="space-y-0">
                {specRows.map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety */}
          {hasSafety && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                Safety Ratings
                <Badge variant="secondary" className="text-xs font-normal">NHTSA</Badge>
              </h2>
              <div className="space-y-0">
                <StarRating rating={car.safety?.overallRating} label="Overall Rating" />
                <StarRating rating={car.safety?.frontCrashRating} label="Front Crash" />
                <StarRating rating={car.safety?.sideCrashRating} label="Side Crash" />
                <StarRating rating={car.safety?.rolloverRating} label="Rollover" />
                {car.safety?.complaintsCount !== undefined && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Complaints</span>
                    <span className="text-sm font-semibold">{car.safety.complaintsCount}</span>
                  </div>
                )}
                {car.safety?.recallsCount !== undefined && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Recalls</span>
                    <span className="text-sm font-semibold">{car.safety.recallsCount}</span>
                  </div>
                )}
                <div className="mt-3 space-y-1.5">
                  {[
                    { label: "Electronic Stability Control", active: car.safety?.hasESC },
                    { label: "Forward Collision Warning", active: car.safety?.hasFCW },
                    { label: "Lane Departure Warning", active: car.safety?.hasLDW },
                  ].map(({ label, active }) =>
                    active !== undefined ? (
                      <div key={label} className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 ${active ? "text-green-500" : "text-gray-300"}`} />
                        <span className={active ? "text-gray-900" : "text-gray-400"}>{label}</span>
                        <Badge variant={active ? "default" : "secondary"} className="text-xs ml-auto">
                          {active ? "Standard" : "Not Standard"}
                        </Badge>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No data fallback */}
          {!hasSpecs && !hasSafety && (
            <div className="sm:col-span-2 bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              <AlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <p className="font-semibold mb-1">No live data available for this vehicle</p>
              <p className="text-sm">This vehicle may be outside API coverage. Try our curated cars for detailed reviews.</p>
              <Link href="/search" className="mt-4 inline-block">
                <Button variant="outline" size="sm">Browse Curated Cars</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
