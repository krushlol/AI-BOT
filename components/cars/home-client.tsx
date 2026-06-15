"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Zap, Shield, TrendingUp, ChevronRight, Star, Quote, Car as CarIcon, Mail, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Navbar from "./navbar"
import CarCard from "./car-card"
import CompareBar from "./compare-bar"
import { Car } from "@/lib/cars/types"
import { cars as allCarsData } from "@/lib/cars/data"
import Link from "next/link"

const REVIEWS = [
  {
    name: "Marcus T.",
    location: "Austin, TX",
    avatar: "MT",
    rating: 5,
    car: "Bought a Toyota RAV4 Prime",
    text: "AutoDrive saved me weeks of research. I was torn between the RAV4 Prime and the Honda CR-V PHEV — the side-by-side comparison made the decision crystal clear. Ended up saving over $2,000 because I knew exactly which trim I wanted.",
  },
  {
    name: "Priya S.",
    location: "San Francisco, CA",
    avatar: "PS",
    rating: 5,
    car: "Switched to a Tesla Model 3",
    text: "As a first-time EV buyer, I was overwhelmed. AutoDrive's electric range data and the pros/cons section for each car were exactly what I needed. The compare tool let me stack the Model 3 against the IONIQ 5 and Kia EV6 all at once. Super helpful!",
  },
  {
    name: "Derek W.",
    location: "Dallas, TX",
    avatar: "DW",
    rating: 5,
    car: "Picked up a Ford F-150",
    text: "I'd been researching trucks for 3 months across a dozen different websites. Found AutoDrive and had everything I needed in one place — towing capacity, payload, all the trim levels with pricing. Best car research site I've used.",
  },
  {
    name: "Aisha K.",
    location: "Chicago, IL",
    avatar: "AK",
    rating: 4,
    car: "Leasing a BMW 3 Series",
    text: "The specs comparison is incredibly detailed. I love that you can see 0-60 times, top speed, and MPG all in one quick view. Would love even more cars in the database but for what's there, the quality of info is unmatched.",
  },
  {
    name: "Liam O.",
    location: "Seattle, WA",
    avatar: "LO",
    rating: 5,
    car: "Ordered a Rivian R1T",
    text: "The 'Cool Features' section sold me on the Rivian. I didn't even know about the Gear Tunnel or Camp Kitchen until I read it here. Incredibly thorough. I recommended this site to everyone in my office.",
  },
  {
    name: "Sofia R.",
    location: "Miami, FL",
    avatar: "SR",
    rating: 5,
    car: "Chose a Hyundai IONIQ 5",
    text: "The live NHTSA safety data was a game changer for me. Being able to see real crash test ratings right alongside the specs gave me so much confidence in my choice. I felt like I had done real homework before stepping into the dealership.",
  },
]

interface HomeClientProps {
  user: { email?: string } | null
  featuredCars: Car[]
  allCars: Car[]
}

const BODY_STYLES = [
  { label: "Sedan", value: "sedan", emoji: "🚗" },
  { label: "SUV", value: "suv", emoji: "🚙" },
  { label: "Truck", value: "truck", emoji: "🛻" },
  { label: "Coupe", value: "coupe", emoji: "🏎" },
  { label: "Wagon", value: "wagon", emoji: "🚐" },
  { label: "Van", value: "van", emoji: "🚌" },
]

const styleImages: Record<string, string> = Object.fromEntries(
  BODY_STYLES.map(({ value }) => {
    const car = allCarsData.find((c) => c.bodyStyle === value)
    return [value, car?.image ?? ""]
  })
)

const FUEL_TYPES = [
  { label: "Electric", value: "electric", emoji: "⚡", desc: "Zero emissions", color: "from-green-900/70" },
  { label: "Hybrid", value: "hybrid", emoji: "🌿", desc: "Best of both", color: "from-teal-900/70" },
  { label: "Plug-in Hybrid", value: "plug-in hybrid", emoji: "🔌", desc: "Electric + gas", color: "from-blue-900/70" },
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

export default function HomeClient({ user, featuredCars, allCars }: HomeClientProps) {
  const [query, setQuery] = useState("")
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  const handleSave = (id: string) => {
    if (!user) { router.push("/sign-in"); return }
    setSavedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  const stats = [
    { label: "Cars in Database", value: `${allCars.length}+`, icon: TrendingUp },
    { label: "Brands Covered", value: `${new Set(allCars.map((c) => c.brand)).size}`, icon: Shield },
    { label: "Data Points Per Car", value: "50+", icon: Zap },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-300 blur-3xl" />
        </div>
        {/* Decorative car photo — right side desktop only */}
        <div className="absolute inset-y-0 right-0 w-1/2 hidden lg:block pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-blue-700/50 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1584060622420-0673aad46076?w=900&q=80"
            alt=""
            className="w-full h-full object-cover object-center opacity-50"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Find Your Perfect Car
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-xl">
              Compare specs, prices, features, and reviews for every make and model — all in one place.
            </p>
            <Link href="/quiz">
              <Button size="lg" className="bg-white text-blue-800 hover:bg-blue-50 font-bold px-6 gap-2 mb-6 shadow-lg">
                <Sparkles className="w-5 h-5" /> Find My Perfect Car →
              </Button>
            </Link>
            <p className="text-blue-200 text-sm mb-4 -mt-4">Answer 6 quick questions · We match you instantly</p>
            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by brand, model, or feature..."
                  className="pl-10 h-12 bg-white text-gray-900 border-0 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="bg-white text-blue-800 hover:bg-blue-50 font-semibold px-6">
                Search
              </Button>
            </form>
            <div className="flex flex-wrap gap-2 mt-6">
              {[
                { label: "⚡ Electric", href: "/search?fuelType=electric" },
                { label: "🌿 Hybrid", href: "/search?fuelType=hybrid" },
                { label: "🚙 SUV", href: "/search?bodyStyle=suv" },
                { label: "💰 Under $40k", href: "/search?maxPrice=40000" },
                { label: "👨‍👩‍👧 Family Cars", href: "/search?seating=5" },
                { label: "🏎 Sports Cars", href: "/search?bodyStyle=coupe" },
              ].map(({ label, href }) => (
                <Link key={label} href={href} className="bg-blue-700/60 hover:bg-blue-600/80 text-white text-xs px-3 py-1.5 rounded-full transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Browse by Style — photo cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Style</h2>
          <Link href="/search" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {BODY_STYLES.map(({ label, value, emoji }) => (
            <Link
              key={value}
              href={`/search?bodyStyle=${value}`}
              className="group relative rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-lg transition-all"
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
                className="group relative rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-lg transition-all"
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
      <div className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Brand</h2>
            <Link href="/search" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
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

      {/* Featured cars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Cars</h2>
          <Link href="/search" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
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

      {/* Feature highlights */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Everything you need to buy smarter</h2>
            <p className="text-blue-200">All the tools, completely free</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: "🔍", title: "Deep Specs", desc: "50+ data points per car — from 0–60 times to cargo space and towing capacity." },
              { emoji: "⚖️", title: "Side-by-Side Compare", desc: "Stack up to 4 cars and instantly see which wins on every spec." },
              { emoji: "🎯", title: "Personalized Quiz", desc: "Answer 6 questions and we match you to cars that actually fit your life." },
              { emoji: "💳", title: "Loan Calculator", desc: "See real monthly payments before you ever step inside a dealership." },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white/10 rounded-2xl p-5 text-center hover:bg-white/15 transition-colors">
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">What Our Users Say</h2>
            <p className="text-gray-500">Real car buyers who researched with AutoDrive</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REVIEWS.map((review) => (
              <div key={review.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                    <p className="text-xs text-gray-500">{review.location}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                  </div>
                </div>
                <Quote className="w-5 h-5 text-blue-200 flex-shrink-0" />
                <p className="text-gray-700 text-sm leading-relaxed -mt-2">{review.text}</p>
                <p className="text-xs text-blue-600 font-medium mt-auto">{review.car}</p>
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
                AutoDrive
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
            <p>© {new Date().getFullYear()} AutoDrive. All rights reserved.</p>
            <p>Safety data sourced from <a href="https://www.nhtsa.gov" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">NHTSA</a>.</p>
          </div>
        </div>
      </footer>

      <CompareBar compareIds={compareIds} onRemove={(id) => setCompareIds((p) => p.filter((i) => i !== id))} onClear={() => setCompareIds([])} />
    </div>
  )
}
