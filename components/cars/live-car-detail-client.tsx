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

// Legacy brand photos kept as fallback only
const BRAND_PHOTOS: Record<string, string[]> = {
  toyota:          ["photo-1621007947382-bb3c3994e3fb","photo-1617469767053-d3b523a0b982","photo-1618609740315-de8a9088ea77","photo-1503376780353-7e6692767b70"],
  honda:           ["photo-1571127236794-81c0bbfe1ce3","photo-1605816988069-b11383b50717","photo-1547245324-d777c6f05e80","photo-1503376780353-7e6692767b70"],
  ford:            ["photo-1551830820-330a71b99659","photo-1625231334168-35067f8853ed","photo-1677739115529-abf0fa4d3ea2","photo-1551522435-a13afa10f103"],
  chevrolet:       ["photo-1697989716697-e1964f9fbc85","photo-1619405399517-d7fce0f13302","photo-1697989716693-092a7ed5a21a"],
  bmw:             ["photo-1588568913041-b72063097be7","photo-1701985470695-e430a8fdc8d6","photo-1696294586764-6baffd088b71","photo-1615908397724-6dc711db34a7","photo-1643793019410-b6ff1112da9b","photo-1605822102629-918beea85679","photo-1615644190630-c6c6f230a6ed","photo-1555215695-3004980ad54e"],
  mercedes:        ["photo-1616874946938-69c1374f3e60","photo-1563721911289-ada2924d66f1","photo-1669234226129-8ede05b40eff"],
  "mercedes-benz": ["photo-1616874946938-69c1374f3e60","photo-1563721911289-ada2924d66f1","photo-1669234226129-8ede05b40eff"],
  audi:            ["photo-1622701579527-dcd1bb5fbb9b"],
  tesla:           ["photo-1560958089-b8a1929cea89","photo-1669625397388-32934837bd3a","photo-1606016159991-dfe4f2746ad5","photo-1638398417409-dd54452eccdf","photo-1674749960478-dc2fcda41f6f"],
  hyundai:         ["photo-1647418552401-f3958302b72a","photo-1575090536203-2a6193126514"],
  kia:             ["photo-1665127771643-0bc02014da61","photo-1649921777129-a28a26031a03","photo-1688893287874-ac7fbd686c24"],
  nissan:          ["photo-1581540222194-0def2dda95b8","photo-1551817280-6d59c77ce1b8"],
  subaru:          ["photo-1609772168547-d216c44c3f85","photo-1722542517938-aa6a98d25235"],
  volkswagen:      ["photo-1628753495700-603e492d16e4","photo-1605475300318-c377291697ac","photo-1564988190342-4976fa6445c9"],
  jeep:            ["photo-1506015391300-4802dc74de2e","photo-1533473359331-0135ef1b58bf","photo-1591738802175-709fedef8288"],
  ram:             ["photo-1649793395985-967862a3b73f","photo-1648690679794-056238ad1acd"],
  mazda:           ["photo-1687292625389-664f8c39586b","photo-1643142311296-304953706775"],
  lexus:           ["photo-1664427356346-c31b46248e71","photo-1777015558094-f92d538f9c80","photo-1698122660387-64acb063dabe"],
  volvo:           ["photo-1629897048514-3dd7414fe72a","photo-1596704135285-689f255de50b"],
  porsche:         ["photo-1774740460595-a16168fdc452","photo-1597858520171-563a8e8b9925"],
  genesis:         ["photo-1709104761873-24cc12d23b28"],
  rivian:          ["photo-1689702302312-8ef703f0d1d5"],
  lucid:           ["photo-1666846865276-a997a6ada2c3"],
  buick:           ["photo-1503376780353-7e6692767b70","photo-1617469767053-d3b523a0b982"],
  gmc:             ["photo-1551522435-a13afa10f103","photo-1672125052834-937014e540c2"],
  cadillac:        ["photo-1619405399517-d7fce0f13302","photo-1611168935847-4bf3f7291cde"],
  lincoln:         ["photo-1503376780353-7e6692767b70","photo-1594070319944-7c0cbebb6f58"],
  acura:           ["photo-1571127236794-81c0bbfe1ce3","photo-1594070319944-7c0cbebb6f58"],
  infiniti:        ["photo-1550355291-bbee04a92027","photo-1609772168547-d216c44c3f85"],
  chrysler:        ["photo-1617469767053-d3b523a0b982"],
  dodge:           ["photo-1625231334168-35067f8853ed","photo-1619405399517-d7fce0f13302"],
  mitsubishi:      ["photo-1609772168547-d216c44c3f85"],
  mini:            ["photo-1594070319944-7c0cbebb6f58"],
  polestar:        ["photo-1560958089-b8a1929cea89","photo-1676754568744-7852efc67c40"],
  jaguar:          ["photo-1611168935847-4bf3f7291cde","photo-1617654112368-307921291f42"],
  "land rover":    ["photo-1551522435-a13afa10f103","photo-1533473359331-0135ef1b58bf"],
  bentley:         ["photo-1617654112368-307921291f42","photo-1611168935847-4bf3f7291cde"],
  "rolls-royce":   ["photo-1617654112368-307921291f42"],
  ferrari:         ["photo-1619405399517-d7fce0f13302","photo-1625231334168-35067f8853ed"],
  lamborghini:     ["photo-1619405399517-d7fce0f13302"],
  maserati:        ["photo-1617654112368-307921291f42"],
  "aston martin":  ["photo-1625231334168-35067f8853ed","photo-1555215695-3004980ad54e"],
  alfa:            ["photo-1594070319944-7c0cbebb6f58"],
  "alfa romeo":    ["photo-1594070319944-7c0cbebb6f58"],
  fiat:            ["photo-1594070319944-7c0cbebb6f58"],
}

function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) & 0x7fffffff
  return h
}

function getBrandPhoto(brand: string, model: string): string {
  const b = brand.toLowerCase()
  const photos = BRAND_PHOTOS[b] ?? BRAND_PHOTOS[b.split(/[\s-]/)[0]] ?? [
    "photo-1621007947382-bb3c3994e3fb","photo-1588568913041-b72063097be7",
    "photo-1560958089-b8a1929cea89","photo-1774740460595-a16168fdc452","photo-1614484393797-257ee1d83a1e",
  ]
  return photos[hashStr(model) % photos.length]
}

export default function LiveCarDetailClient({ car, user }: LiveCarDetailClientProps) {
  const fallbackPhoto = (() => {
    const b = car.brand.toLowerCase()
    const photos = BRAND_PHOTOS[b] ?? BRAND_PHOTOS[b.split(/[\s-]/)[0]] ?? ["photo-1621007947382-bb3c3994e3fb"]
    let h = 5381
    for (let i = 0; i < car.model.length; i++) h = ((h << 5) + h + car.model.charCodeAt(i)) & 0x7fffffff
    return `https://images.unsplash.com/${photos[h % photos.length]}?w=800&q=80`
  })()

  const [imageUrl, setImageUrl] = useState<string>(car.image ?? fallbackPhoto)

  useEffect(() => {
    if (car.image) return
    const key = `${car.brand}|${car.model}|${car.year}`
    if (detailImageCache.has(key)) {
      setImageUrl(detailImageCache.get(key) ?? fallbackPhoto)
      return
    }
    fetch(`/api/car-image?brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}&year=${car.year}`)
      .then((r) => r.json())
      .then((data) => {
        const resolved = data.imageUrl ?? fallbackPhoto
        detailImageCache.set(key, resolved)
        setImageUrl(resolved)
      })
      .catch(() => setImageUrl(fallbackPhoto))
  }, [car.brand, car.model, car.year, car.image, fallbackPhoto])

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
