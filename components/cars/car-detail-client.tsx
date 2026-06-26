"use client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, GitCompare, Star, CheckCircle, XCircle, Sparkles, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Navbar from "./navbar"
import CarCard from "./car-card"
import { Car } from "@/lib/cars/types"
import Link from "next/link"
import { getBestForTags } from "@/lib/cars/tags"
import { scoreCarForAnswers } from "@/lib/cars/quiz"
import { magazineReviews } from "@/lib/cars/reviews"
import { ownerReviews } from "@/lib/cars/owner-reviews"
import { useQuizAnswers } from "@/hooks/useQuizAnswers"
import MatchBadge from "@/components/quiz/match-badge"
import CarGallery from "@/components/cars/car-gallery"
import { carGalleries } from "@/lib/cars/gallery"
import { toggleSavedCar } from "@/lib/cars/save"
import { getSpecExplanations } from "@/lib/cars/spec-explanations"

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

export default function CarDetailClient({ car, user, relatedCars, initialSaved = false }: CarDetailClientProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [showAllTrims, setShowAllTrims] = useState(false)
  const { answers } = useQuizAnswers()
  const matchScore = answers ? scoreCarForAnswers(car, answers) : null
  const bestForTags = getBestForTags(car)
  const router = useRouter()

  const handleSave = async () => {
    if (!user) { router.push("/sign-in"); return }
    const wasSaved = saved
    setSaved(!wasSaved)
    try {
      await toggleSavedCar(user.id, car.id, wasSaved)
    } catch (err) {
      setSaved(wasSaved)
      alert("Failed to save car: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  const displayTrims = showAllTrims ? car.trimLevels : car.trimLevels.slice(0, 3)

  const specExplanations = getSpecExplanations(car)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>

        {/* Hero section */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 mb-6">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="relative p-4 bg-gray-50">
              <CarGallery
                mainImage={car.image}
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
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                  {car.year} {car.model}
                </h1>
                <p className="text-gray-500 mb-3">{car.tagline}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {bestForTags.map((tag) => (
                    <span key={tag.label} className="inline-flex items-center gap-1 text-sm bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded-full font-medium">
                      {tag.emoji} {tag.label}
                    </span>
                  ))}
                  {matchScore !== null && (
                    <MatchBadge score={matchScore} size="md" />
                  )}
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
                  <Button
                    className={`flex-1 ${saved ? "bg-red-500 hover:bg-red-600" : ""}`}
                    onClick={handleSave}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${saved ? "fill-current" : ""}`} />
                    {saved ? "Saved" : "Save Car"}
                  </Button>
                  <Link href={`/compare?ids=${car.id}`}>
                    <Button variant="outline">
                      <GitCompare className="w-4 h-4 mr-2" />
                      Compare
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {specExplanations.slice(0, 6).map(({ label, value, explanation }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="font-bold text-gray-900 text-sm">{value}</p>
              {explanation && (
                <p className="text-xs text-gray-400 mt-1 leading-tight">{explanation}</p>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="specs" className="mb-6">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="specs">Specs</TabsTrigger>
            <TabsTrigger value="trims">Trim Levels</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="verdict">Pros & Cons</TabsTrigger>
          </TabsList>

          <TabsContent value="specs">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-1">Full Specifications</h2>
              <p className="text-sm text-gray-500 mb-4">Plain-English explanations alongside every number</p>
              <div className="divide-y divide-gray-100">
                {specExplanations.map(({ label, value, explanation }) => (
                  <div key={label} className="py-3 grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-4 items-start">
                    <div>
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
                    </div>
                    {explanation && (
                      <p className="text-sm text-gray-600 leading-relaxed pt-0.5">{explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trims">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4">Trim Levels & Pricing</h2>
              <div className="space-y-3">
                {displayTrims.map((trim) => (
                  <div key={trim.name} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{trim.name}</h3>
                      <span className="text-lg font-bold text-orange-600">${trim.price.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                    {showAllTrims ? (
                      <><ChevronUp className="w-4 h-4" /> Show fewer</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> Show all {car.trimLevels.length} trims</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: "Interior Features", items: car.interiorFeatures },
                { title: "Exterior Features", items: car.exteriorFeatures },
                { title: "Technology Features", items: car.techFeatures },
              ].map(({ title, items }) => (
                <div key={title} className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="safety">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-sm">
                  {car.safety.rating || "Not Rated"}
                </div>
                {car.safety.ratingSource && (
                  <span className="text-sm text-gray-500">{car.safety.ratingSource}</span>
                )}
              </div>
              <h3 className="font-semibold mb-3">Safety Features</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {car.safety.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verdict">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-xl border border-green-200 p-5">
                <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Pros
                </h3>
                <ul className="space-y-2">
                  {car.pros.map((p) => (
                    <li key={p} className="text-sm text-green-900 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">+</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 rounded-xl border border-red-200 p-5">
                <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Cons
                </h3>
                <ul className="space-y-2">
                  {car.cons.map((c) => (
                    <li key={c} className="text-sm text-red-900 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">−</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-5">
              <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Cool & Unique Features
              </h3>
              <ul className="space-y-3">
                {car.coolFeatures.map((f) => (
                  <li key={f} className="text-sm text-purple-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reviews: Experts + Owners side by side */}
        {(magazineReviews[car.id] || ownerReviews[car.id]) && (
          <div className="grid lg:grid-cols-2 gap-6 mb-6">

            {/* Expert Reviews */}
            {magazineReviews[car.id] && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📰 What the Experts Say
                </h2>
                <div className="space-y-3">
                  {magazineReviews[car.id].map((rev) => (
                    <div key={rev.magazine} className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-gray-800">{rev.magazine}</span>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">⭐ {rev.rating}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed italic">"{rev.quote}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Reviews */}
            {ownerReviews[car.id] && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  👤 What Owners Say
                </h2>
                <div className="space-y-3">
                  {ownerReviews[car.id].map((rev, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <span className="font-bold text-sm text-gray-800">{rev.name}</span>
                          <span className="text-xs text-gray-400 ml-2">· {rev.location}</span>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{rev.owned}</span>
                      </div>
                      <div className="flex gap-0.5 mb-1">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <span key={s} className={`text-xs ${s < rev.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">"{rev.title}"</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{rev.review}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Available colors */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold mb-3">Available Colors</h2>
          <div className="flex flex-wrap gap-2">
            {car.colors.map((color) => (
              <Badge key={color} variant="outline" className="text-sm">{color}</Badge>
            ))}
          </div>
        </div>

        {/* Related cars */}
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
