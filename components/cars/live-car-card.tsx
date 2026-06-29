"use client"

import { LiveCar } from "@/lib/cars/live-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Fuel, Star } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

// Module-level cache so repeat renders don't re-fetch
const imageCache = new Map<string, string | null>()

function useLiveCarImage(car: LiveCar, index = 0): string | null {
  const [url, setUrl] = useState<string | null>(car.image ?? null)

  useEffect(() => {
    if (car.image) return
    const key = `${car.brand}|${car.model}|${car.year}`
    if (imageCache.has(key)) {
      setUrl(imageCache.get(key) ?? null)
      return
    }
    // Stagger requests: 300ms per card so we don't hammer Wikimedia all at once
    const delay = index * 300
    const timer = setTimeout(() => {
      fetch(`/api/car-image?brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}&year=${car.year}`)
        .then((r) => r.json())
        .then((data) => {
          imageCache.set(key, data.imageUrl ?? null)
          if (data.imageUrl) setUrl(data.imageUrl)
        })
        .catch(() => { /* leave as null — show brand letter placeholder */ })
    }, delay)
    return () => clearTimeout(timer)
  }, [car.brand, car.model, car.year, car.image, index])

  return url
}

interface LiveCarCardProps {
  car: LiveCar
  index?: number
}

export default function LiveCarCard({ car, index = 0 }: LiveCarCardProps) {
  const imageUrl = useLiveCarImage(car, index)
  const fuelLabel = car.specs?.fuelType ?? car.fuelType ?? "Gas"
  const isElectric = fuelLabel.toLowerCase().includes("electric")

  const slug = `${encodeURIComponent(car.brand.toLowerCase())}/${encodeURIComponent(car.model.toLowerCase().replace(/\s+/g, "-"))}/${car.year}`

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      <Link href={`/cars/live/${slug}`} className="block">
        <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${car.year} ${car.brand} ${car.model}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = "none"
              }}
            />
          ) : (
            <div className="text-center text-gray-400 animate-pulse">
              <div className="text-3xl font-bold">{car.brand[0]}</div>
              <div className="text-xs">{car.brand}</div>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge className="bg-indigo-600 text-white text-xs">Live</Badge>
            {car.bodyStyle && (
              <Badge variant="secondary" className="text-xs capitalize">{car.bodyStyle}</Badge>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/cars/live/${slug}`}>
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-0.5">{car.brand}</p>
          <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">
            {car.year} {car.model}
          </h3>
        </Link>

        {car.specs ? (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-1.5 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">HP</p>
              <p className="text-sm font-semibold">{car.specs.horsepower ?? "—"}</p>
            </div>
            <div className="text-center p-1.5 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">MPG</p>
              <p className="text-sm font-semibold">{car.specs.mpgCombined ?? "—"}</p>
            </div>
            <div className="text-center p-1.5 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Seats</p>
              <p className="text-sm font-semibold">{car.specs.seating ?? "—"}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3 py-2">
            <span>Specs load on detail page</span>
          </div>
        )}

        {car.safety?.overallRating && (
          <div className="flex items-center gap-1.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < (car.safety?.overallRating ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
              />
            ))}
            <span className="text-xs text-gray-500">NHTSA Safety</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 mb-3">
          {isElectric ? (
            <Zap className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Fuel className="w-3.5 h-3.5 text-orange-400" />
          )}
          <span className="text-xs text-gray-600 capitalize">{fuelLabel}</span>
        </div>

        <Link href={`/cars/live/${slug}`} className="block">
          <Button variant="outline" size="sm" className="w-full text-xs">View Details</Button>
        </Link>
      </div>
    </div>
  )
}
