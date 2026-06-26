"use client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, SlidersHorizontal, X, Globe, BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "./navbar"
import CarCard from "./car-card"
import LiveCarCard from "./live-car-card"
import CompareBar from "./compare-bar"
import { Car } from "@/lib/cars/types"
import { LiveCar } from "@/lib/cars/live-types"
import { MAINSTREAM_BRANDS } from "@/lib/cars/nhtsa"
import { toggleSavedCar } from "@/lib/cars/save"

const YEARS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() - i)

interface SearchClientProps {
  user: SupabaseUser | null
  allCars: Car[]
  brands: string[]
  bodyStyles: string[]
  fuelTypes: string[]
  initialParams: {
    q?: string
    brand?: string
    bodyStyle?: string
    fuelType?: string
    minPrice?: string
    maxPrice?: string
    seating?: string
  }
  initialSavedIds?: string[]
}

export default function SearchClient({ user, allCars, brands, bodyStyles, fuelTypes, initialParams, initialSavedIds = [] }: SearchClientProps) {
  const router = useRouter()

  // Curated filters
  const [query, setQuery] = useState(initialParams.q || "")
  const [brand, setBrand] = useState(initialParams.brand || "")
  const [bodyStyle, setBodyStyle] = useState(initialParams.bodyStyle || "")
  const [fuelType, setFuelType] = useState(initialParams.fuelType || "")
  const [minPrice, setMinPrice] = useState(initialParams.minPrice || "")
  const [maxPrice, setMaxPrice] = useState(initialParams.maxPrice || "")
  const [seating, setSeating] = useState(initialParams.seating || "")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("default")

  // Compare
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>(initialSavedIds)

  // Live catalog
  const [liveMake, setLiveMake] = useState("")
  const [liveYear, setLiveYear] = useState(String(new Date().getFullYear()))
  const [liveModel, setLiveModel] = useState("")
  const [liveModels, setLiveModels] = useState<string[]>([])
  const [liveModelsLoading, setLiveModelsLoading] = useState(false)
  const [liveResults, setLiveResults] = useState<LiveCar[]>([])
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveError, setLiveError] = useState("")
  const [liveSearched, setLiveSearched] = useState(false)

  const fetchModels = async (make: string, year: string) => {
    if (!make) return
    setLiveModelsLoading(true)
    setLiveModel("")
    setLiveModels([])
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`)
      const json = await res.json()
      const models: string[] = (json.Results ?? []).map((r: { Model_Name: string }) => r.Model_Name).sort()
      setLiveModels(models)
    } catch {
      setLiveModels([])
    } finally {
      setLiveModelsLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let result = allCars.filter((car) => {
      if (query) {
        const q = query.toLowerCase()
        if (
          !car.brand.toLowerCase().includes(q) &&
          !car.model.toLowerCase().includes(q) &&
          !car.description.toLowerCase().includes(q) &&
          !car.bodyStyle.toLowerCase().includes(q) &&
          !car.fuelType.toLowerCase().includes(q) &&
          !car.tagline.toLowerCase().includes(q)
        ) return false
      }
      if (brand && car.brand !== brand) return false
      if (bodyStyle && car.bodyStyle !== bodyStyle) return false
      if (fuelType && car.fuelType !== fuelType) return false
      if (minPrice && car.basePrice < parseInt(minPrice)) return false
      if (maxPrice && car.basePrice > parseInt(maxPrice)) return false
      if (seating && car.specs.seating < parseInt(seating)) return false
      return true
    })
    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.basePrice - b.basePrice)
    else if (sortBy === "price-desc") result = [...result].sort((a, b) => b.basePrice - a.basePrice)
    else if (sortBy === "hp-desc") result = [...result].sort((a, b) => b.specs.horsepower - a.specs.horsepower)
    else if (sortBy === "az") result = [...result].sort((a, b) => `${a.brand}${a.model}`.localeCompare(`${b.brand}${b.model}`))
    return result
  }, [allCars, query, brand, bodyStyle, fuelType, minPrice, maxPrice, seating, sortBy])

  const handleCompare = (id: string) => {
    setCompareIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 4 ? [...prev, id] : prev)
  }
  const handleSave = async (id: string) => {
    if (!user) { router.push("/sign-in"); return }
    const isSaved = savedIds.includes(id)
    setSavedIds((prev) => isSaved ? prev.filter((i) => i !== id) : [...prev, id])
    try {
      await toggleSavedCar(user.id, id, isSaved)
    } catch (err) {
      setSavedIds((prev) => isSaved ? [...prev, id] : prev.filter((i) => i !== id))
      alert("Failed to save car: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleLiveSearch = async () => {
    if (!liveMake) return
    setLiveLoading(true)
    setLiveError("")
    setLiveSearched(true)
    try {
      let url = `/api/cars/search?make=${encodeURIComponent(liveMake)}&year=${liveYear}`
      if (liveModel) url += `&model=${encodeURIComponent(liveModel)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      setLiveResults(json.results ?? [])
    } catch {
      setLiveError("Could not load live data. Please try again.")
      setLiveResults([])
    } finally {
      setLiveLoading(false)
    }
  }

  const activeFilters = [
    brand && { label: brand, clear: () => setBrand("") },
    bodyStyle && { label: bodyStyle, clear: () => setBodyStyle("") },
    fuelType && { label: fuelType, clear: () => setFuelType("") },
    minPrice && { label: `Min $${parseInt(minPrice).toLocaleString()}`, clear: () => setMinPrice("") },
    maxPrice && { label: `Max $${parseInt(maxPrice).toLocaleString()}`, clear: () => setMaxPrice("") },
    seating && { label: `${seating}+ seats`, clear: () => setSeating("") },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar user={user} />

      <Tabs defaultValue="curated" className="flex flex-col min-h-screen">
        {/* Sticky search bar */}
        <div className="bg-white border-b sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <TabsList className="mb-3 gap-1">
              <TabsTrigger value="curated" className="gap-1.5 text-xs sm:text-sm">
                <BookOpen className="w-3.5 h-3.5" /> Editor&apos;s Picks
                <Badge variant="secondary" className="text-xs ml-1">{allCars.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="live" className="gap-1.5 text-xs sm:text-sm">
                <Globe className="w-3.5 h-3.5" /> Live Catalog
                <Badge className="text-xs ml-1 bg-indigo-600 text-white">NHTSA</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Curated search bar (shown only on curated tab via CSS trick) */}
            <TabsContent value="curated" className="mt-0">
              <div className="flex gap-3 flex-wrap items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cars..." className="pl-9" />
                </div>
                <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
                </Button>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="hp-desc">Most Powerful</SelectItem>
                    <SelectItem value="az">A to Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {showFilters && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3 pt-3 border-t">
                  <Select value={brand || "all"} onValueChange={(v) => setBrand(v === "all" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={bodyStyle || "all"} onValueChange={(v) => setBodyStyle(v === "all" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Body Style" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Styles</SelectItem>
                      {bodyStyles.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={fuelType || "all"} onValueChange={(v) => setFuelType(v === "all" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Fuel Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fuels</SelectItem>
                      {fuelTypes.map((f) => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Min Price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                  <Input type="number" placeholder="Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  <Select value={seating || "all"} onValueChange={(v) => setSeating(v === "all" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Min Seats" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Seating</SelectItem>
                      <SelectItem value="2">2+ seats</SelectItem>
                      <SelectItem value="4">4+ seats</SelectItem>
                      <SelectItem value="5">5+ seats</SelectItem>
                      <SelectItem value="7">7+ seats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {activeFilters.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {activeFilters.map(({ label, clear }) => (
                    <Badge key={label} variant="secondary" className="cursor-pointer gap-1 hover:bg-red-50 hover:text-red-700 capitalize" onClick={clear}>
                      {label} <X className="w-3 h-3" />
                    </Badge>
                  ))}
                  <button className="text-xs text-gray-500 hover:text-red-600" onClick={() => { setBrand(""); setBodyStyle(""); setFuelType(""); setMinPrice(""); setMaxPrice(""); setSeating("") }}>
                    Clear all
                  </button>
                </div>
              )}
            </TabsContent>

            {/* Live catalog search bar */}
            <TabsContent value="live" className="mt-0">
              <div className="flex gap-3 flex-wrap items-center">
                <Select value={liveMake} onValueChange={(v) => { setLiveMake(v); fetchModels(v, liveYear) }}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Select Brand..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MAINSTREAM_BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={liveYear} onValueChange={(v) => { setLiveYear(v); if (liveMake) fetchModels(liveMake, v) }}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.slice(0, 10).map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select
                  value={liveModel || "__all__"}
                  onValueChange={(v) => setLiveModel(v === "__all__" ? "" : v)}
                  disabled={liveModels.length === 0 && !liveModelsLoading}
                >
                  <SelectTrigger className="w-44">
                    {liveModelsLoading
                      ? <span className="text-gray-400 text-sm flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</span>
                      : <SelectValue placeholder={liveMake ? "All Models" : "Model (optional)"} />}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Models</SelectItem>
                    {liveModels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={handleLiveSearch} disabled={!liveMake || liveLoading} className="gap-2">
                  {liveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  {liveLoading ? "Loading..." : "Search NHTSA"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Powered by the US National Highway Traffic Safety Administration (NHTSA) — {new Date().getFullYear() - 1989}+ years of US-registered vehicles.
              </p>
            </TabsContent>
          </div>
        </div>

        {/* Results */}
        <TabsContent value="curated" className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-sm text-gray-600 mb-4">{filtered.length} detailed review{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No cars match your search</h3>
                <p className="text-gray-500 text-sm">Try the Live Catalog tab to search thousands of real vehicles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((car) => (
                  <CarCard key={car.id} car={car} savedCarIds={savedIds} compareIds={compareIds} onSave={handleSave} onCompare={handleCompare} isLoggedIn={!!user} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="live" className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {!liveSearched ? (
              <div className="text-center py-16">
                <Globe className="w-12 h-12 mx-auto text-indigo-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Search the Live Catalog</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Pick a brand and year above to browse {new Date().getFullYear() - 1989}+ years of real vehicles from the NHTSA database.
                </p>
              </div>
            ) : liveLoading ? (
              <div className="text-center py-16">
                <Loader2 className="w-10 h-10 mx-auto text-indigo-400 animate-spin mb-4" />
                <p className="text-gray-500">Fetching from NHTSA...</p>
              </div>
            ) : liveError ? (
              <div className="text-center py-16 text-red-500">
                <p>{liveError}</p>
              </div>
            ) : liveResults.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">No vehicles found for {liveMake} {liveYear}.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {liveResults.length} {liveMake} models for {liveYear} — click any car to load specs & safety ratings
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {liveResults.map((car) => (
                    <LiveCarCard key={car.id} car={car} />
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CompareBar compareIds={compareIds} onRemove={(id) => setCompareIds((p) => p.filter((i) => i !== id))} onClear={() => setCompareIds([])} />
    </div>
  )
}
