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
  bentley: "photo-1563720223185-11003d516935",
  "rolls-royce": "photo-1631295868223-63265b2b8f23",
  ferrari: "photo-1583121274602-3e2820c69888",
  lamborghini: "photo-1544636331-e26879cd4d9b",
  maserati: "photo-1637466603-6fc1f0e2fc0c",
  aston: "photo-1555215695-3004980ad54e",
  jaguar: "photo-1568605117036-5fe5e7bab0b7",
  "land rover": "photo-1551522435-a13afa10f103",
  "land": "photo-1551522435-a13afa10f103",
  polestar: "photo-1560958089-b8a1929cea89",
  rivian: "photo-1671219558085-9a09c6148930",
  lucid: "photo-1657303916369-dbbeb3dc3738",
  mini: "photo-1494976388531-d1058494cdd8",
  mitsubishi: "photo-1570733117-9c0cf1a09a44",
  alfa: "photo-1583121274602-3e2820c69888",
  fiat: "photo-1494976388531-d1058494cdd8",
}

// Large pool of diverse car photos — each model gets a unique one via hash
const CAR_PHOTO_POOL = [
  "photo-1494976388531-d1058494cdd8",
  "photo-1502877338535-766e1452684a",
  "photo-1555215695-3004980ad54e",
  "photo-1568605117036-5fe5e7bab0b7",
  "photo-1570733117-9c0cf1a09a44",
  "photo-1583121274602-3e2820c69888",
  "photo-1609772168547-d216c44c3f85",
  "photo-1614484393797-257ee1d83a1e",
  "photo-1637466603-6fc1f0e2fc0c",
  "photo-1650103071985-a62b678d9dc7",
  "photo-1657303916369-dbbeb3dc3738",
  "photo-1671219558085-9a09c6148930",
  "photo-1550355291-bbee04a92027",
  "photo-1503376780353-7e6692767b70",
  "photo-1533473359331-0135ef1b58bf",
  "photo-1571872580550-5a0570339714",
  "photo-1584060622420-0673aad46076",
  "photo-1560958089-b8a1929cea89",
  "photo-1647418552401-f3958302b72a",
  "photo-1665127771643-0bc02014da61",
]

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

interface LiveCarCardProps {
  car: LiveCar
}

export default function LiveCarCard({ car }: LiveCarCardProps) {
  const brandLower = car.brand.toLowerCase()
  const brandPhoto = BRAND_IMAGES[brandLower] ?? BRAND_IMAGES[brandLower.split(/[\s-]/)[0]]
  // Each model gets its own image: cycle through pool offset by model hash
  const poolIndex = hashStr(`${car.brand}-${car.model}`) % CAR_PHOTO_POOL.length
  const photoId = poolIndex % 3 === 0 && brandPhoto ? brandPhoto : (CAR_PHOTO_POOL[poolIndex] ?? brandPhoto ?? "photo-1502877338535-766e1452684a")
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
