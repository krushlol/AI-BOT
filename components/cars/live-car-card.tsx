"use client"

import { LiveCar } from "@/lib/cars/live-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Fuel, Star } from "lucide-react"
import Link from "next/link"

const BRAND_IMAGES: Record<string, string> = {
  toyota: "photo-1621007947382-bb3c3994e3fb",
  honda: "photo-1606152421802-db97b4c7f3b0",
  ford: "photo-1614484393797-257ee1d83a1e",
  chevrolet: "photo-1603386329225-868f9b1ee6c9",
  buick: "photo-1503376780353-7e6692767b70",
  gmc: "photo-1551522435-a13afa10f103",
  bmw: "photo-1594051673969-172a6f721d3c",
  mercedes: "photo-1617654112368-307921291f42",
  audi: "photo-1622701579527-dcd1bb5fbb9b",
  tesla: "photo-1560958089-b8a1929cea89",
  hyundai: "photo-1647418552401-f3958302b72a",
  kia: "photo-1665127771643-0bc02014da61",
  nissan: "photo-1550355291-bbee04a92027",
  subaru: "photo-1609772168547-d216c44c3f85",
  volkswagen: "photo-1571872580550-5a0570339714",
  jeep: "photo-1533473359331-0135ef1b58bf",
  ram: "photo-1672125052834-937014e540c2",
  dodge: "photo-1612544448445-b8232cff3b6c",
  mazda: "photo-1687292625389-664f8c39586b",
  lexus: "photo-1633579706905-7be6a3c3f4dc",
  volvo: "photo-1617806118233-18e1de247200",
  porsche: "photo-1584060622420-0673aad46076",
  genesis: "photo-1709104761873-24cc12d23b28",
  cadillac: "photo-1552519507-da3b142c6e3d",
  lincoln: "photo-1619279257014-3de5c279ed3e",
  acura: "photo-1606611013016-969c19ba27bb",
  infiniti: "photo-1631295868223-63265b2b8f23",
  chrysler: "photo-1502161254066-6c74afbf07aa",
}

interface LiveCarCardProps {
  car: LiveCar
}

export default function LiveCarCard({ car }: LiveCarCardProps) {
  const brandKey = car.brand.toLowerCase().split("-")[0].split(" ")[0]
  const photoId = BRAND_IMAGES[brandKey] ?? "photo-1502877338535-766e1452684a"
  const imageUrl = car.image ?? `https://images.unsplash.com/${photoId}?w=400&q=80`
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
            <div className="text-center text-gray-400">
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
