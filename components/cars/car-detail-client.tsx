"use client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, GitCompare, Star, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "./navbar"
import CarCard from "./car-card"
import { Car } from "@/lib/cars/types"
import Link from "next/link"
import { getBestForTags } from "@/lib/cars/tags"
import { scoreCarForAnswers } from "@/lib/cars/quiz"
import { magazineReviews } from "@/lib/cars/reviews"
import { useQuizAnswers } from "@/hooks/useQuizAnswers"
import MatchBadge from "@/components/quiz/match-badge"
import CarGallery from "@/components/cars/car-gallery"
import { carGalleries } from "@/lib/cars/gallery"
import { saveCar, unsaveCar } from "@/app/actions/cars"
import { getSpecExplanations } from "@/lib/cars/spec-explanations"
import KnownIssues from "@/components/cars/known-issues"
import LoanCalculator from "@/components/cars/loan-calculator"
import RedditOpinions from "@/components/cars/reddit-opinions"
import { computeCarAdvisorScore } from "@/lib/cars/score"

interface CarDetailClientProps {
  car: Car
  user: SupabaseUser | null
  relatedCars: Car[]
  initialSaved?: boolean
}

const fuelLabel = (f: string) => {
  if (f === "plug-in hybrid") return "PHEV"
  if (f === "electric") return "Electric"
  if (f === "hybrid") return "Hybrid"
  return f.charAt(0).toUpperCase() + f.slice(1)
}

const LS_SHORTLIST_KEY = "ca_shortlist"

function getLocalShortlist(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_SHORTLIST_KEY) ?? "[]") } catch { return [] }
}

function toggleLocalShortlist(id: string): { saved: boolean; limitReached: boolean } {
  const list = getLocalShortlist()
  if (list.includes(id)) {
    const next = list.filter((x) => x !== id)
    try { localStorage.setItem(LS_SHORTLIST_KEY, JSON.stringify(next)) } catch { /* */ }
    return { saved: false, limitReached: false }
  }
  if (list.length >= 2) return { saved: false, limitReached: true }
  const next = [...list, id]
  try { localStorage.setItem(LS_SHORTLIST_KEY, JSON.stringify(next)) } catch { /* */ }
  return { saved: true, limitReached: false }
}

export default function CarDetailClient({ car, user, relatedCars, initialSaved = false }: CarDetailClientProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [localSaved, setLocalSaved] = useState(false)
  const [showAllTrims, setShowAllTrims] = useState(false)
  const [heroImage, setHeroImage] = useState(car.image)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (window.location.hash === "#reddit") {
      setActiveTab("reviews")
      setTimeout(() => document.getElementById("reddit")?.scrollIntoView({ behavior: "smooth" }), 100)
    }
    // legacy deep-links: specs/trims → specs tab; features/safety/verdict → features tab
    const hash = window.location.hash.replace("#", "")
    if (["specs", "trims"].includes(hash)) setActiveTab("specs")
    else if (["features", "safety", "verdict"].includes(hash)) setActiveTab("features")
    setLocalSaved(getLocalShortlist().includes(car.id))
  }, [car.id])
  const { answers } = useQuizAnswers()
  const matchScore = answers ? scoreCarForAnswers(car, answers) : null
  const bestForTags = getBestForTags(car)
  const advisorScore = computeCarAdvisorScore(car)
  const router = useRouter()

  const handleSave = async () => {
    if (!user) {
      const { saved: nowSaved, limitReached } = toggleLocalShortlist(car.id)
      if (limitReached) { router.push("/sign-in"); return }
      setLocalSaved(nowSaved)
      return
    }
    const wasSaved = saved
    setSaved(!wasSaved)
    try {
      const result = await (wasSaved ? unsaveCar(car.id) : saveCar(car.id))
      if (result.error) {
        setSaved(wasSaved)
      } else {
        router.refresh()
      }
    } catch {
      setSaved(wasSaved)
    }
  }

  const isSaved = user ? saved : localSaved

  const displayTrims = showAllTrims ? car.trimLevels : car.trimLevels.slice(0, 3)
  const specExplanations = getSpecExplanations(car)

  const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-")
  const affiliateLinks = [
    {
      name: "Edmunds",
      url: `https://www.edmunds.com/${slug(car.brand)}/${slug(car.model)}/${car.year}/`,
    },
    {
      name: "KBB",
      url: `https://www.kbb.com/${slug(car.brand)}/${slug(car.model)}/${car.year}/`,
    },
    {
      name: "Cars.com",
      url: `https://www.cars.com/shopping/results/?stock_type=new&makes[]=${slug(car.brand)}&models[]=${slug(car.brand)}-${slug(car.model)}`,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>

        {/* Hero */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 mb-6">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="relative p-4 bg-gray-50">
              <CarGallery
                mainImage={heroImage}
                altText={`${car.year} ${car.brand} ${car.model}`}
                gallery={carGalleries[car.id] ?? car.gallery}
              />
              <div className="absolute top-6 left-6 flex gap-2 z-10">
                <Badge className="bg-orange-500 text-white capitalize">{car.bodyStyle}</Badge>
                <Badge className="bg-white text-gray-800 border">{fuelLabel(car.fuelType)}</Badge>
              </div>
            </div>
            <div className="p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-1">{car.brand}</p>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{car.year} {car.model}</h1>
                <p className="text-gray-500 mb-3">{car.tagline}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {bestForTags.map((tag) => (
                    <span key={tag.label} className="inline-flex items-center gap-1 text-sm bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded-full font-medium">
                      {tag.label}
                    </span>
                  ))}
                  {matchScore !== null && <MatchBadge score={matchScore} size="md" />}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">{car.description}</p>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">${car.basePrice.toLocaleString()}</span>
                  <span className="text-gray-500 text-sm">– ${car.maxPrice.toLocaleString()} MSRP</span>
                </div>
                {car.safety.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{car.safety.rating}</span>
                    <span className="text-xs text-gray-500">({car.safety.ratingSource})</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button className={`flex-1 ${isSaved ? "bg-red-500 hover:bg-red-600" : ""}`} onClick={handleSave}>
                    <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                    {isSaved ? "Saved" : "Save Car"}
                  </Button>
                  <Link href={`/compare?ids=${car.id}`}>
                    <Button variant="outline">
                      <GitCompare className="w-4 h-4 mr-2" />
                      Compare
                    </Button>
                  </Link>
                </div>

                {!user && localSaved && (
                  <p className="text-xs text-gray-500 mt-2">
                    Saved to your shortlist (up to 2 without signing in). <a href="/sign-in" className="text-orange-500 underline hover:text-orange-700">Sign in</a> to save more &amp; sync across devices.
                  </p>
                )}

                <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-orange-900 mb-1">Ready to buy?</p>
                  <p className="text-xs text-orange-700 mb-3">Check live dealer prices and inventory</p>
                  <div className="flex flex-wrap gap-2">
                    {affiliateLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors shadow-sm"
                      >
                        {link.name} <span className="opacity-75">→</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs — 4 grouped sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-10">
          <TabsList className="mb-6 w-full flex overflow-x-auto gap-1.5 h-auto p-2 bg-gray-200 border border-gray-300 rounded-2xl shadow-sm">
            {[
              { value: "overview", label: "Overview" },
              { value: "specs", label: "Specs & Trims" },
              { value: "features", label: "Features & Safety" },
              { value: "reviews", label: "Reviews" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl text-gray-500 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-gray-800 transition-colors cursor-pointer"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── OVERVIEW ── score · stats · pros/cons · calculator · colors */}
          <TabsContent value="overview" className="space-y-6">
            {/* Score */}
            <div className={`${advisorScore.bgColor} ${advisorScore.borderColor} border rounded-2xl p-5 flex items-center gap-5`}>
              <div className={`text-4xl font-black ${advisorScore.color} leading-none tabular-nums`}>
                {advisorScore.score.toFixed(1)}
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="flex-1 min-w-0">
                <div className={`font-bold text-lg ${advisorScore.color}`}>{advisorScore.label}</div>
                <p className="text-sm text-gray-600 mt-0.5">{advisorScore.reason}</p>
              </div>
              <div className="text-xs text-gray-400 text-right shrink-0 hidden sm:block leading-relaxed">CarAdvisor<br />Score</div>
            </div>

            {/* Quick stats */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">At a Glance</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {specExplanations.slice(0, 6).map(({ label, value, explanation }) => (
                  <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="font-bold text-gray-900 text-base">{value}</p>
                    {explanation && <p className="text-xs text-gray-400 mt-1 leading-tight">{explanation}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Pros / Cons / Standout side by side */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Verdict</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
                  <h3 className="font-bold text-green-800 mb-3">Pros</h3>
                  <ul className="space-y-2">
                    {car.pros.map((p) => (
                      <li key={p} className="text-sm text-green-900 flex items-start gap-2">
                        <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">+</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
                  <h3 className="font-bold text-red-800 mb-3">Cons</h3>
                  <ul className="space-y-2">
                    {car.cons.map((c) => (
                      <li key={c} className="text-sm text-red-900 flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">−</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-5">
                <h3 className="font-bold text-purple-800 mb-3">Standout Features</h3>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                  {car.coolFeatures.map((f) => (
                    <li key={f} className="text-sm text-purple-900 flex items-start gap-2">
                      <span className="text-purple-400 flex-shrink-0 mt-0.5">✦</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Loan calculator */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Estimate Your Payment</h2>
              <LoanCalculator basePrice={car.basePrice} maxPrice={car.maxPrice} />
            </div>

            {/* Colors */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Available Colors</h2>
              <div className="flex flex-wrap gap-2">
                {car.colors.map((color) => (
                  <Badge key={color} variant="outline" className="text-sm">{color}</Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── SPECS & TRIMS ── side by side on desktop */}
          <TabsContent value="specs">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Specs */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Full Specifications</h2>
                <p className="text-xs text-gray-400 mb-4">Plain-English explanations alongside every number</p>
                <div className="divide-y divide-gray-100">
                  {specExplanations.map(({ label, value, explanation }) => (
                    <div key={label} className="py-3 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="text-sm font-bold text-gray-900">{value}</p>
                      </div>
                      {explanation && <p className="text-xs text-gray-400 leading-relaxed">{explanation}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Trims */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Trim Levels & Pricing</h2>
                <p className="text-xs text-gray-400 mb-4">Starting MSRP. Destination charges (~$1,100–1,400) and dealer fees are additional.</p>
                <div className="space-y-3">
                  {displayTrims.map((trim) => (
                    <div key={trim.name} className="border border-gray-200 rounded-xl p-4 hover:border-orange-200 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{trim.name}</h3>
                        <span className="text-base font-bold text-orange-600">${trim.price.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {trim.highlights.map((h) => (
                          <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  {car.trimLevels.length > 3 && (
                    <button
                      className="text-sm text-orange-500 hover:text-orange-700 flex items-center gap-1"
                      onClick={() => setShowAllTrims(!showAllTrims)}
                    >
                      {showAllTrims
                        ? <><ChevronUp className="w-4 h-4" /> Show fewer</>
                        : <><ChevronDown className="w-4 h-4" /> Show all {car.trimLevels.length} trims</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── FEATURES & SAFETY ── features grid + safety panel */}
          <TabsContent value="features" className="space-y-6">
            {/* Features */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">What's Included</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { title: "Interior", items: car.interiorFeatures },
                  { title: "Exterior", items: car.exteriorFeatures },
                  { title: "Technology", items: car.techFeatures },
                ].map(({ title, items }) => (
                  <div key={title} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-gray-300 flex-shrink-0 mt-0.5">·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Safety</h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-sm">
                    {car.safety.rating || "Not Rated"}
                  </div>
                  {car.safety.ratingSource && (
                    <a
                      href="https://www.iihs.org/ratings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-500 hover:underline"
                    >
                      {car.safety.ratingSource} ↗
                    </a>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {car.safety.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-400 flex-shrink-0">✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
                  <span>Safety ratings: <a href="https://www.iihs.org/ratings" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">IIHS</a></span>
                  <span>Specs &amp; pricing: manufacturer data</span>
                  <span>Last verified: Oct 2025</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── REVIEWS ── experts + known issues + reddit */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {magazineReviews[car.id] && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4">What the Experts Say</h2>
                  <div className="space-y-3">
                    {magazineReviews[car.id].map((rev) => (
                      <div key={rev.magazine} className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-gray-800">{rev.magazine}</span>
                          <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">{rev.rating}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed italic">"{rev.quote}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <KnownIssues brand={car.brand} model={car.model} year={car.year} carId={car.id} />
            </div>
            <div id="reddit">
              <RedditOpinions brand={car.brand} model={car.model} year={car.year} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Similar cars */}
        {relatedCars.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Similar Cars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedCars.map((c) => (
                <CarCard key={c.id} car={c} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
