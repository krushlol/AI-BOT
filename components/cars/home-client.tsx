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

const bodyStyles = ["All", "Sedan", "SUV", "Truck", "Coupe", "Wagon", "Hatchback"]

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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
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
                { label: "Electric", href: "/search?fuelType=electric" },
                { label: "Hybrid", href: "/search?fuelType=hybrid" },
                { label: "SUV", href: "/search?bodyStyle=suv" },
                { label: "Under $40k", href: "/search?maxPrice=40000" },
                { label: "Family Cars", href: "/search?seating=5" },
                { label: "Sports Cars", href: "/search?bodyStyle=coupe" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="bg-blue-700/60 hover:bg-blue-600/80 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                >
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

      {/* Browse by type */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Style</h2>
        </div>
        <div className="flex gap-3 flex-wrap">
          {bodyStyles.map((style) => (
            <Link
              key={style}
              href={style === "All" ? "/search" : `/search?bodyStyle=${style.toLowerCase()}`}
              className="px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            >
              {style}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured cars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
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
                <li><Link href="/compare" className="hover:text-white transition-colors">Compare Cars</Link></li>
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
