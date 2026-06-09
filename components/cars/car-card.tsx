"use client"

import { Car } from "@/lib/cars/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, GitCompare, Zap, Fuel, Gauge } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getBestForTags } from "@/lib/cars/tags"
import { scoreCarForAnswers } from "@/lib/cars/quiz"
import { useQuizAnswers } from "@/hooks/useQuizAnswers"
import MatchBadge from "@/components/quiz/match-badge"

interface CarCardProps {
  car: Car
  savedCarIds?: string[]
  compareIds?: string[]
  onSave?: (carId: string) => void
  onCompare?: (carId: string) => void
  isLoggedIn?: boolean
  hideMatchBadge?: boolean
}

const fuelColors: Record<string, string> = {
  electric: "bg-green-100 text-green-800",
  hybrid: "bg-teal-100 text-teal-800",
  "plug-in hybrid": "bg-blue-100 text-blue-800",
  gasoline: "bg-orange-100 text-orange-800",
  diesel: "bg-yellow-100 text-yellow-800",
}

const fuelIcons: Record<string, React.ReactNode> = {
  electric: <Zap className="w-3 h-3" />,
  hybrid: <Zap className="w-3 h-3" />,
  "plug-in hybrid": <Zap className="w-3 h-3" />,
  gasoline: <Fuel className="w-3 h-3" />,
  diesel: <Fuel className="w-3 h-3" />,
}

export default function CarCard({ car, savedCarIds = [], compareIds = [], onSave, onCompare, isLoggedIn, hideMatchBadge = false }: CarCardProps) {
  const isSaved = savedCarIds.includes(car.id)
  const isInCompare = compareIds.includes(car.id)
  const { answers } = useQuizAnswers()
  const matchScore = answers && !hideMatchBadge ? scoreCarForAnswers(car, answers) : null
  const bestForTags = getBestForTags(car)

  const fuelStat = car.fuelType === "electric"
    ? `${car.specs.electricRange} mi range`
    : car.fuelType.includes("hybrid") && car.specs.electricRange
    ? `${car.specs.electricRange} mi EV`
    : `${car.specs.mpgCombined} MPG`

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      <Link href={`/cars/${car.id}`} className="block">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={car.image}
            alt={`${car.year} ${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge className={`text-xs gap-1 ${fuelColors[car.fuelType]}`}>
              {fuelIcons[car.fuelType]}
              {car.fuelType === "plug-in hybrid" ? "PHEV" : car.fuelType.charAt(0).toUpperCase() + car.fuelType.slice(1)}
            </Badge>
          </div>
          {matchScore !== null && (
            <div className="absolute top-3 right-3">
              <MatchBadge score={matchScore} />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/cars/${car.id}`}>
          <div className="mb-1">
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">{car.brand}</span>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {car.year} {car.model}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{car.tagline}</p>
          {bestForTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {bestForTags.map((tag) => (
                <span key={tag.label} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                  {tag.emoji} {tag.label}
                </span>
              ))}
            </div>
          )}
        </Link>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">HP</p>
            <p className="text-sm font-semibold">{car.specs.horsepower}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">0-60</p>
            <p className="text-sm font-semibold">
              {car.specs.zeroToSixty ? `${car.specs.zeroToSixty}s` : "—"}
            </p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">{car.fuelType === "electric" ? "Range" : car.specs.electricRange ? "EV Range" : "MPG"}</p>
            <p className="text-sm font-semibold">{fuelStat}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Starting at</p>
            <p className="text-lg font-bold text-gray-900">${car.basePrice.toLocaleString()}</p>
          </div>
          <Badge variant="outline" className="text-xs capitalize">{car.bodyStyle}</Badge>
        </div>

        <div className="flex gap-2">
          <Link href={`/cars/${car.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">View Details</Button>
          </Link>
          {onSave && (
            <Button
              variant="outline"
              size="sm"
              className={`px-3 ${isSaved ? "text-red-500 border-red-200 bg-red-50" : ""}`}
              onClick={() => onSave(car.id)}
              title={isLoggedIn ? (isSaved ? "Remove from saved" : "Save car") : "Sign in to save"}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            </Button>
          )}
          {onCompare && (
            <Button
              variant="outline"
              size="sm"
              className={`px-3 ${isInCompare ? "text-blue-500 border-blue-200 bg-blue-50" : ""}`}
              onClick={() => onCompare(car.id)}
              title={isInCompare ? "Remove from compare" : "Add to compare"}
            >
              <GitCompare className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
