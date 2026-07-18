"use client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronRight, Car as CarIcon, Mail, Sparkles, Heart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Navbar from "./navbar"
import CarCard from "./car-card"
import CompareBar from "./compare-bar"
import { Car } from "@/lib/cars/types"
import { cars as allCarsData } from "@/lib/cars/data"
import Link from "next/link"
import { toggleSavedCar } from "@/lib/cars/save"
import { parseLiveQuery } from "@/lib/cars/parse-query"
import { computeCarAdvisorScore } from "@/lib/cars/score"


interface HomeClientProps {
  user: SupabaseUser | null
  featuredCars: Car[]
  allCars: Car[]
  initialSavedIds?: string[]
}

const BODY_STYLES = [
  { label: "Sedan", value: "sedan", emoji: "🚗" },
  { label: "SUV", value: "suv", emoji: "🚙" },
  { label: "Truck", value: "truck", emoji: "🛻" },
  { label: "Coupe", value: "coupe", emoji: "🏎" },
  { label: "Wagon", value: "wagon", emoji: "🚐" },
  { label: "Van", value: "van", emoji: "🚌" },
]

const STYLE_IMAGE_OVERRIDES: Record<string, string> = {
  wagon: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/2016_Volvo_V60_Polestar_in_Ice_White%2C_Front_Left%2C_08-15-2022.jpg/960px-2016_Volvo_V60_Polestar_in_Ice_White%2C_Front_Left%2C_08-15-2022.jpg",
}

const styleImages: Record<string, string> = Object.fromEntries(
  BODY_STYLES.map(({ value }) => {
    if (STYLE_IMAGE_OVERRIDES[value]) return [value, STYLE_IMAGE_OVERRIDES[value]]
    const car = allCarsData.find((c) => c.bodyStyle === value)
    return [value, car?.image ?? ""]
  })
)

const FUEL_TYPES = [
  { label: "Electric", value: "electric", emoji: "⚡", desc: "Zero emissions", color: "from-green-900/70" },
  { label: "Hybrid", value: "hybrid", emoji: "🌿", desc: "Best of both", color: "from-teal-900/70" },
  { label: "Plug-in Hybrid", value: "plug-in hybrid", emoji: "🔌", desc: "Electric + gas", color: "from-slate-900/70" },
  { label: "Gas", value: "gasoline", emoji: "⛽", desc: "Classic power", color: "from-orange-900/70" },
]

const fuelImages: Record<string, string> = Object.fromEntries(
  FUEL_TYPES.map(({ value }) => {
    const car = allCarsData.find((c) => c.fuelType === value)
    return [value, car?.image ?? ""]
  })
)

const BRAND_CONFIG: Record<string, { color: string; bg: string }> = {
  Toyota:          { color: "text-red-700",    bg: "bg-red-50 border-red-100" },
  Tesla:           { color: "text-gray-800",   bg: "bg-gray-50 border-gray-200" },
  Ford:            { color: "text-blue-800",   bg: "bg-blue-50 border-blue-100" },
  Honda:           { color: "text-red-700",    bg: "bg-red-50 border-red-100" },
  BMW:             { color: "text-blue-800",   bg: "bg-blue-50 border-blue-100" },
  Rivian:          { color: "text-green-800",  bg: "bg-green-50 border-green-100" },
  Hyundai:         { color: "text-blue-800",   bg: "bg-blue-50 border-blue-100" },
  Chevrolet:       { color: "text-yellow-800", bg: "bg-yellow-50 border-yellow-100" },
  Subaru:          { color: "text-blue-800",   bg: "bg-blue-50 border-blue-100" },
  Porsche:         { color: "text-gray-800",   bg: "bg-gray-50 border-gray-200" },
  Jeep:            { color: "text-green-800",  bg: "bg-green-50 border-green-100" },
  Kia:             { color: "text-red-700",    bg: "bg-red-50 border-red-100" },
  "Mercedes-Benz": { color: "text-gray-800",   bg: "bg-gray-50 border-gray-200" },
  Lucid:           { color: "text-purple-800", bg: "bg-purple-50 border-purple-100" },
  Ram:             { color: "text-red-700",    bg: "bg-red-50 border-red-100" },
  Volkswagen:      { color: "text-blue-800",   bg: "bg-blue-50 border-blue-100" },
  Mazda:           { color: "text-red-700",    bg: "bg-red-50 border-red-100" },
  Genesis:         { color: "text-gray-800",   bg: "bg-gray-50 border-gray-200" },
  Nissan:          { color: "text-red-700",    bg: "bg-red-50 border-red-100" },
  Audi:            { color: "text-gray-800",   bg: "bg-gray-50 border-gray-200" },
}

const brandCards = (() => {
  const seen = new Set<string>()
  const out: { brand: string; image: string }[] = []
  for (const car of allCarsData) {
    if (!seen.has(car.brand)) {
      seen.add(car.brand)
      out.push({ brand: car.brand, image: car.image })
    }
  }
  return out
})()

// Compute top picks once at module level (pure, no side effects)
const topPickOverall = allCarsData.reduce((best, car) => {
  const s = computeCarAdvisorScore(car).score
  return s > computeCarAdvisorScore(best).score ? car : best
}, allCarsData[0])

const topPickEV = allCarsData
  .filter(c => c.fuelType === "electric")
  .reduce((best, car) => computeCarAdvisorScore(car).score > computeCarAdvisorScore(best).score ? car : best)

const topPickHybrid = allCarsData
  .filter(c => c.fuelType === "hybrid" || c.fuelType === "plug-in hybrid")
  .reduce((best, car) => computeCarAdvisorScore(car).score > computeCarAdvisorScore(best).score ? car : best)

const topPickValue = allCarsData
  .filter(c => c.basePrice <= 40000 && c.id !== topPickEV.id && c.id !== topPickHybrid.id)
  .reduce((best, car) => computeCarAdvisorScore(car).score > computeCarAdvisorScore(best).score ? car : best)

const topPickScore = computeCarAdvisorScore(topPickOverall)
const currentMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" })

function getHeroBadge(car: Car): string {
  if (car.fuelType === "electric") {
    if (car.bodyStyle === "truck") return "Best Electric Truck"
    if (car.bodyStyle === "suv") return "Best Electric SUV"
    return "Best Electric Car"
  }
  if (car.fuelType === "plug-in hybrid") {
    if (car.specs.seating >= 7) return "Best Family PHEV"
    return "Best Plug-in Hybrid"
  }
  if (car.fuelType === "hybrid") {
    const mpg = car.specs.mpgCombined ?? 0
    if (mpg >= 50) return "Best Fuel Economy"
    if (car.safety.rating === "TOP SAFETY PICK+") return "Safest Hybrid · IIHS"
    return "Best Hybrid"
  }
  if (car.safety.rating === "TOP SAFETY PICK+" && car.safety.ratingSource?.includes("IIHS")) return "IIHS Top Safety Pick+"
  if (car.specs.seating >= 7) return "Best Family Car"
  if (car.bodyStyle === "truck") return "Best Pickup Truck"
  if (car.bodyStyle === "coupe" || car.basePrice >= 80000) return "Best Performance Pick"
  if (car.basePrice <= 32000) return "Best Value Under $32K"
  if (car.bodyStyle === "suv") return "Best Family SUV"
  return "Editor's Choice"
}

// Top 6 cars by score for rotating hero
const heroCarousel = allCarsData
  .map(c => ({ car: c, score: computeCarAdvisorScore(c), badge: getHeroBadge(c) }))
  .sort((a, b) => b.score.score - a.score.score)
  .slice(0, 6)

export default function HomeClient({ user, featuredCars, allCars, initialSavedIds = [] }: HomeClientProps) {
  const [query, setQuery] = useState("")
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>(initialSavedIds)
  const [heroIndex, setHeroIndex] = useState(0)
  const [imageFading, setImageFading] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      const t = setTimeout(() => setBannerVisible(true), 300)
      return () => clearTimeout(t)
    }
  }, [user])

  // Both text and image track heroIndex; only the image gets the fade animation
  const currentHero = heroCarousel[heroIndex]

  useEffect(() => {
    const timer = setInterval(() => {
      setImageFading(true)
      setTimeout(() => {
        setHeroIndex(i => (i + 1) % heroCarousel.length)
        setImageFading(false)
      }, 500)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const parsed = parseLiveQuery(query)
    if (parsed && parsed.model) {
      router.push(`/cars/live/${encodeURIComponent(parsed.make)}/${encodeURIComponent(parsed.model)}/${parsed.year}`)
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  const handleSave = async (id: string) => {
    if (!user) { router.push("/sign-in"); return }
    const isSaved = savedIds.includes(id)
    setSavedIds((prev) => isSaved ? prev.filter((i) => i !== id) : [...prev, id])
    try {
      await toggleSavedCar(user.id, id, isSaved)
    } catch (err) {
      // Revert optimistic update on failure
      setSavedIds((prev) => isSaved ? [...prev, id] : prev.filter((i) => i !== id))
      alert("Failed to save car: " + (err instanceof Error ? err.message : String(err)))
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      {/* Sign-up banner — drops in for unauthenticated visitors */}
      {!user && !bannerDismissed && (
        <div
          className="overflow-hidden transition-all duration-500 ease-out"
          style={{ maxHeight: bannerVisible ? "80px" : "0px", opacity: bannerVisible ? 1 : 0 }}
        >
          <div className="bg-orange-500 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
              <p className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 shrink-0" />
                <span>
                  <Link href="/sign-up" className="font-semibold underline underline-offset-2">Sign up</Link>
                  {" "}to save your car searches and favorites
                </span>
              </p>
              <button onClick={() => setBannerDismissed(true)} className="opacity-80 hover:opacity-100 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero — Editorial Top Pick */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-orange-300 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center" style={{ opacity: imageFading ? 0 : 1, transition: "opacity 400ms ease-in-out" }}>
            {/* Left — editorial content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-full px-3 py-1 text-xs font-semibold text-orange-300 uppercase tracking-widest mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                {currentHero.badge} · {currentMonth}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 leading-tight">
                {currentHero.car.brand}<br />
                <span className="text-orange-400">{currentHero.car.model}</span>
              </h1>
              <p className="text-orange-100 text-base mb-4 max-w-md">{currentHero.car.tagline}</p>

              {/* Score pill */}
              <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-2 mb-6">
                <span className="text-2xl font-black text-orange-400">{currentHero.score.score.toFixed(1)}</span>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <div className="text-sm font-bold">{currentHero.score.emoji} {currentHero.score.label}</div>
                  <div className="text-xs text-orange-200">{currentHero.score.reason}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <Link href={`/cars/${currentHero.car.id}`}>
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 shadow-lg">
                    See Full Review →
                  </Button>
                </Link>
                <Link href="/quiz">
                  <Button size="lg" className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-6 gap-2">
                    <Sparkles className="w-4 h-4" /> Find MY Car
                  </Button>
                </Link>
              </div>

              {/* Carousel dots */}
              <div className="flex gap-2 mb-8">
                {heroCarousel.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setImageFading(true); setTimeout(() => { setHeroIndex(i); setImageFading(false) }, 350) }}
                    className={`w-2 h-2 rounded-full transition-all ${i === heroIndex ? "bg-orange-400 w-6" : "bg-white/30 hover:bg-white/50"}`}
                  />
                ))}
              </div>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search any car..."
                    className="pl-9 h-11 bg-white text-gray-900 border-0 text-sm"
                  />
                </div>
                <Button type="submit" className="bg-white text-slate-800 hover:bg-orange-50 font-semibold px-5 h-11">
                  Search
                </Button>
              </form>
            </div>

            {/* Right — rotating car image only */}
            <div className="hidden lg:block relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src={currentHero.car.image}
                  alt={`${currentHero.car.year} ${currentHero.car.brand} ${currentHero.car.model}`}
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-xs text-orange-300 font-semibold uppercase tracking-wider">Starting at</p>
                  <p className="text-2xl font-black">${currentHero.car.basePrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick category pills */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
            {[
              { label: "⚡ Electric", href: "/search?fuelType=electric" },
              { label: "🌿 Hybrid", href: "/search?fuelType=hybrid" },
              { label: "🚙 SUV", href: "/search?bodyStyle=suv" },
              { label: "💰 Under $40k", href: "/search?maxPrice=40000" },
              { label: "👨‍👩‍👧 Family", href: "/search?seating=7" },
              { label: "🏎 Sports", href: "/search?bodyStyle=coupe" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-full transition-colors border border-white/10">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Browse by Style — photo cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Style</h2>
          <Link href="/search" className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {BODY_STYLES.map(({ label, value, emoji }) => (
            <Link
              key={value}
              href={`/search?bodyStyle=${value}`}
              className="group relative rounded-2xl overflow-hidden border border-gray-200 hover:border-orange-300 shadow-sm hover:shadow-md transition-all"
            >
              {styleImages[value] ? (
                <img
                  src={styleImages[value]}
                  alt={label}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-3xl">{emoji}</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-2 left-0 right-0 text-center">
                <span className="text-white text-xs font-bold tracking-wide drop-shadow">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Browse by Fuel Type */}
      <div className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Fuel Type</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FUEL_TYPES.map(({ label, value, emoji, desc, color }) => (
              <Link
                key={value}
                href={`/search?fuelType=${encodeURIComponent(value)}`}
                className="group relative rounded-2xl overflow-hidden border border-gray-200 hover:border-orange-300 shadow-sm hover:shadow-md transition-all"
              >
                {fuelImages[value] ? (
                  <img
                    src={fuelImages[value]}
                    alt={label}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-5xl">{emoji}</div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-t ${color} via-black/20 to-transparent`} />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <div>
                      <p className="text-white text-sm font-bold leading-tight">{label}</p>
                      <p className="text-white/70 text-xs">{desc}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Browse by Brand */}
      <div className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Brand</h2>
            <Link href="/search" className="text-sm text-orange-500 hover:text-slate-800 font-medium flex items-center gap-1">
              All brands <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
            {brandCards.map(({ brand, image }) => {
              const cfg = BRAND_CONFIG[brand] ?? { color: "text-gray-700", bg: "bg-gray-50 border-gray-200" }
              const displayName = brand === "Mercedes-Benz" ? "Mercedes" : brand
              return (
                <Link
                  key={brand}
                  href={`/search?brand=${encodeURIComponent(brand)}`}
                  className={`group flex flex-col items-center gap-2 p-3 rounded-2xl border ${cfg.bg} hover:shadow-md transition-all hover:-translate-y-0.5`}
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white shadow">
                    <img src={image} alt={brand} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className={`text-xs font-semibold text-center leading-tight ${cfg.color}`}>{displayName}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top Picks by Category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Top Picks by Category</h2>
            <p className="text-sm text-gray-500 mt-1">Scored on safety, efficiency, value, and freshness</p>
          </div>
          <Link href="/search" className="flex items-center gap-1 text-sm text-orange-500 hover:text-slate-800 font-medium">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category labels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "⚡ Best Electric", car: topPickEV, note: "Longest range · Best tech · Top rated" },
            { label: "🌿 Best Hybrid", car: topPickHybrid, note: "Most efficient · Lowest fuel costs" },
            { label: "💰 Best Under $40k", car: topPickValue, note: "Best value · No compromises" },
          ].map(({ label, car, note }) => {
            const sc = computeCarAdvisorScore(car)
            return (
              <Link key={label} href={`/cars/${car.id}`} className="group bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden">
                <div className="relative h-36 bg-gray-100">
                  <img src={car.image} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{label}</div>
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                    {sc.emoji} {sc.score.toFixed(1)}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide">{car.brand}</p>
                  <p className="font-bold text-gray-900">{car.year} {car.model}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{note}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Rest of the featured cars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              savedCarIds={savedIds}
              compareIds={compareIds}
              onSave={handleSave}
              onCompare={handleCompare}
              isLoggedIn={!!user}
              hideMatchBadge
            />
          ))}
        </div>
      </div>

      {/* Why CarAdvisor is Different */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Not just another car site</h2>
            <p className="text-gray-400 max-w-xl mx-auto">We built what we wished existed — honest scores, real owner opinions, and an AI that actually listens.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                emoji: "📊",
                title: "Honest Scores",
                desc: "Every car gets a score out of 10 based on safety, efficiency, value, and freshness. No ads. No sponsored rankings. Just data.",
                cta: "Browse scored cars →",
                href: "/search",
              },
              {
                emoji: "💬",
                title: "Real Reddit Opinions",
                desc: "We surface actual discussions from r/cars, r/whatcarshouldIbuy, and r/askcarsales — not press releases or manufacturer copy.",
                cta: "See an example →",
                href: `/cars/${heroCarousel[0].car.id}`,
              },
              {
                emoji: "🤖",
                title: "AI Car Advisor",
                desc: "Tell our AI about your life — budget, family, commute — and it recommends the right car in seconds. Try it now.",
                cta: "Chat with AI →",
                href: "/quiz",
              },
            ].map(({ emoji, title, desc, cta, href }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-4">{emoji}</div>
                <h3 className="font-bold text-xl mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{desc}</p>
                <Link href={href} className="text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors">
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
                <CarIcon className="w-6 h-6 text-blue-400" />
                CarAdvisor
              </div>
              <p className="text-sm leading-relaxed">Your all-in-one car research tool. Compare, discover, and find the perfect vehicle.</p>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-3">Browse</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/search" className="hover:text-white transition-colors">All Cars</Link></li>
                <li><Link href="/search?fuelType=electric" className="hover:text-white transition-colors">Electric</Link></li>
                <li><Link href="/search?fuelType=hybrid" className="hover:text-white transition-colors">Hybrid</Link></li>
                <li><Link href="/search?bodyStyle=suv" className="hover:text-white transition-colors">SUVs</Link></li>
                <li><Link href="/search?bodyStyle=truck" className="hover:text-white transition-colors">Trucks</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-3">Tools</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/calculator" className="hover:text-white transition-colors">Loan Calculator</Link></li>
                <li><Link href="/search" className="hover:text-white transition-colors">Live Catalog</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Saved Cars</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-3">Company</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li>
                  <a href="mailto:arushchirp@gmail.com" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <p>© {new Date().getFullYear()} CarAdvisor. All rights reserved.</p>
            <p>Safety data sourced from <a href="https://www.nhtsa.gov" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">NHTSA</a>.</p>
          </div>
        </div>
      </footer>

      <CompareBar compareIds={compareIds} onRemove={(id) => setCompareIds((p) => p.filter((i) => i !== id))} onClear={() => setCompareIds([])} />
    </div>
  )
}
