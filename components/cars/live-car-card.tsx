"use client"

import { LiveCar } from "@/lib/cars/live-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Fuel, Star } from "lucide-react"
import Link from "next/link"

// Multiple verified Unsplash photos per brand — model hash picks which one
const BRAND_PHOTOS: Record<string, string[]> = {
  toyota:     ["photo-1621007947382-bb3c3994e3fb","photo-1617469767053-d3b523a0b982","photo-1618609740315-de8a9088ea77","photo-1503376780353-7e6692767b70"],
  honda:      ["photo-1571127236794-81c0bbfe1ce3","photo-1605816988069-b11383b50717","photo-1547245324-d777c6f05e80","photo-1503376780353-7e6692767b70"],
  ford:       ["photo-1551830820-330a71b99659","photo-1625231334168-35067f8853ed","photo-1677739115529-abf0fa4d3ea2","photo-1551522435-a13afa10f103"],
  chevrolet:  ["photo-1697989716697-e1964f9fbc85","photo-1619405399517-d7fce0f13302","photo-1697989716693-092a7ed5a21a"],
  bmw:        ["photo-1588568913041-b72063097be7","photo-1701985470695-e430a8fdc8d6","photo-1696294586764-6baffd088b71","photo-1615908397724-6dc711db34a7","photo-1643793019410-b6ff1112da9b","photo-1605822102629-918beea85679","photo-1615644190630-c6c6f230a6ed","photo-1555215695-3004980ad54e"],
  mercedes:   ["photo-1616874946938-69c1374f3e60","photo-1563721911289-ada2924d66f1"],
  "mercedes-benz": ["photo-1616874946938-69c1374f3e60","photo-1563721911289-ada2924d66f1"],
  audi:       ["photo-1622701579527-dcd1bb5fbb9b"],
  tesla:      ["photo-1560958089-b8a1929cea89","photo-1669625397388-32934837bd3a"],
  hyundai:    ["photo-1647418552401-f3958302b72a","photo-1575090536203-2a6193126514"],
  kia:        ["photo-1665127771643-0bc02014da61"],
  nissan:     ["photo-1581540222194-0def2dda95b8","photo-1551817280-6d59c77ce1b8"],
  subaru:     ["photo-1609772168547-d216c44c3f85"],
  volkswagen: ["photo-1628753495700-603e492d16e4"],
  jeep:       ["photo-1506015391300-4802dc74de2e","photo-1533473359331-0135ef1b58bf"],
  ram:        ["photo-1649793395985-967862a3b73f"],
  mazda:      ["photo-1687292625389-664f8c39586b"],
  lexus:      ["photo-1540066019607-e5f69323a8dc"],
  volvo:      ["photo-1629897048514-3dd7414fe72a"],
  porsche:    ["photo-1774740460595-a16168fdc452"],
  genesis:    ["photo-1709104761873-24cc12d23b28"],
  rivian:     ["photo-1689702302312-8ef703f0d1d5"],
  lucid:      ["photo-1666846865276-a997a6ada2c3"],
  // less-common brands: use verified general car photos
  buick:      ["photo-1503376780353-7e6692767b70","photo-1617469767053-d3b523a0b982"],
  gmc:        ["photo-1551522435-a13afa10f103","photo-1672125052834-937014e540c2"],
  cadillac:   ["photo-1619405399517-d7fce0f13302","photo-1611168935847-4bf3f7291cde"],
  lincoln:    ["photo-1503376780353-7e6692767b70","photo-1594070319944-7c0cbebb6f58"],
  acura:      ["photo-1571127236794-81c0bbfe1ce3","photo-1594070319944-7c0cbebb6f58"],
  infiniti:   ["photo-1550355291-bbee04a92027","photo-1609772168547-d216c44c3f85"],
  chrysler:   ["photo-1617469767053-d3b523a0b982"],
  dodge:      ["photo-1625231334168-35067f8853ed","photo-1619405399517-d7fce0f13302"],
  mitsubishi: ["photo-1609772168547-d216c44c3f85"],
  mini:       ["photo-1594070319944-7c0cbebb6f58"],
  polestar:   ["photo-1560958089-b8a1929cea89","photo-1676754568744-7852efc67c40"],
  jaguar:     ["photo-1611168935847-4bf3f7291cde","photo-1617654112368-307921291f42"],
  "land rover": ["photo-1551522435-a13afa10f103","photo-1533473359331-0135ef1b58bf"],
  bentley:    ["photo-1617654112368-307921291f42","photo-1611168935847-4bf3f7291cde"],
  "rolls-royce": ["photo-1617654112368-307921291f42"],
  ferrari:    ["photo-1619405399517-d7fce0f13302","photo-1625231334168-35067f8853ed"],
  lamborghini:["photo-1619405399517-d7fce0f13302"],
  maserati:   ["photo-1617654112368-307921291f42"],
  "aston martin": ["photo-1625231334168-35067f8853ed","photo-1555215695-3004980ad54e"],
  alfa:       ["photo-1594070319944-7c0cbebb6f58"],
  "alfa romeo": ["photo-1594070319944-7c0cbebb6f58"],
  fiat:       ["photo-1594070319944-7c0cbebb6f58"],
}

function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) & 0x7fffffff
  return h
}

function getBrandPhotos(brand: string): string[] {
  const b = brand.toLowerCase()
  return BRAND_PHOTOS[b] ?? BRAND_PHOTOS[b.split(/[\s-]/)[0]] ?? [
    "photo-1621007947382-bb3c3994e3fb",
    "photo-1588568913041-b72063097be7",
    "photo-1560958089-b8a1929cea89",
    "photo-1774740460595-a16168fdc452",
    "photo-1614484393797-257ee1d83a1e",
  ]
}

interface LiveCarCardProps {
  car: LiveCar
}

export default function LiveCarCard({ car }: LiveCarCardProps) {
  const photos = getBrandPhotos(car.brand)
  const photoId = photos[hashStr(car.model) % photos.length]
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
