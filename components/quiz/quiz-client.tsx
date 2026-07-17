"use client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

import { useState, useMemo } from "react"
import { RotateCcw, GitCompare, Car as CarIcon, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Navbar from "@/components/cars/navbar"
import MatchBadge from "./match-badge"
import { Car } from "@/lib/cars/types"
import { QuizAnswers, scoreCarForAnswers, carPassesFilters, getMatchReason } from "@/lib/cars/quiz"
import { useQuizAnswers } from "@/hooks/useQuizAnswers"
import { magazineReviews } from "@/lib/cars/reviews"

interface QuizClientProps {
  user: SupabaseUser | null
  allCars: Car[]
}

const QUESTIONS: {
  key: keyof QuizAnswers
  question: string
  options: { value: string; label: string; emoji: string }[]
}[] = [
  {
    key: "budget",
    question: "Budget",
    options: [
      { value: "under35k", label: "Under $35k", emoji: "💰" },
      { value: "35to60k", label: "$35k – $60k", emoji: "💳" },
      { value: "60kplus", label: "$60k+", emoji: "🏆" },
    ],
  },
  {
    key: "style",
    question: "Vehicle type",
    options: [
      { value: "suv", label: "SUV / Crossover", emoji: "🚙" },
      { value: "sedan", label: "Sedan", emoji: "🚗" },
      { value: "truck", label: "Truck", emoji: "🛻" },
      { value: "nopref", label: "No preference", emoji: "🎲" },
    ],
  },
  {
    key: "fuel",
    question: "Fuel type",
    options: [
      { value: "electric", label: "Electric", emoji: "⚡" },
      { value: "hybrid", label: "Hybrid / PHEV", emoji: "🌿" },
      { value: "mpg", label: "Best MPG", emoji: "⛽" },
      { value: "nopref", label: "No preference", emoji: "🤷" },
    ],
  },
  {
    key: "useCase",
    question: "Main use",
    options: [
      { value: "commute", label: "Daily commute", emoji: "🏙" },
      { value: "family", label: "Family trips", emoji: "🗺" },
      { value: "offroad", label: "Off-road", emoji: "🏔" },
      { value: "hauling", label: "Hauling / towing", emoji: "⚙️" },
    ],
  },
  {
    key: "kids",
    question: "Kids?",
    options: [
      { value: "none", label: "No kids", emoji: "🙋" },
      { value: "oneTwo", label: "1–2 kids", emoji: "👶" },
      { value: "threePlus", label: "3+ kids", emoji: "👨‍👩‍👧‍👦" },
    ],
  },
  {
    key: "size",
    question: "Size preference",
    options: [
      { value: "small", label: "Small", emoji: "🚗" },
      { value: "midsize", label: "Mid-size", emoji: "🚙" },
      { value: "big", label: "Big & roomy", emoji: "🛻" },
    ],
  },
  {
    key: "pets",
    question: "Pets?",
    options: [
      { value: "no", label: "No pets", emoji: "🧹" },
      { value: "yes", label: "Yes", emoji: "🐾" },
    ],
  },
]

export default function QuizClient({ user, allCars }: QuizClientProps) {
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({})
  const [confirmed, setConfirmed] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const { saveAnswers, clearAnswers } = useQuizAnswers()

  const answeredCount = Object.keys(answers).length
  const isComplete = answeredCount === QUESTIONS.length

  const select = (key: keyof QuizAnswers, value: string) => {
    setConfirmed(false)
    const updated = { ...answers, [key]: value }
    setAnswers(updated)
  }

  const handleConfirm = () => {
    saveAnswers(answers as QuizAnswers)
    setConfirmed(true)
  }

  const results = useMemo(() => {
    if (answeredCount < 2) return []
    const full = answers as QuizAnswers
    return allCars
      .filter((car) => {
        try { return carPassesFilters(car, full) } catch { return true }
      })
      .map((car) => ({
        car,
        score: scoreCarForAnswers(car, full),
        reason: getMatchReason(car, full),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
  }, [answers, allCars, answeredCount])

  const handleReset = () => {
    setAnswers({})
    setConfirmed(false)
    clearAnswers()
    setCompareIds([])
  }

  const handleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
            <Sparkles className="w-4 h-4" /> Find My Car
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Tell us what you need
          </h1>
          <p className="text-gray-500 text-lg">Answer any questions below — results update instantly</p>
        </div>

        {/* Questions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
          {QUESTIONS.map((q) => (
            <div key={q.key} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{q.question}</p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => {
                  const selected = answers[q.key] === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => select(q.key, opt.value)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all text-sm font-medium ${
                        selected
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-100 bg-gray-50 text-gray-700 hover:border-orange-200 hover:bg-orange-50/50"
                      }`}
                    >
                      <span className="text-lg leading-none">{opt.emoji}</span>
                      <span className="flex-1">{opt.label}</span>
                      {selected && <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Reset card */}
          {answeredCount > 0 && (
            <div className="flex items-center justify-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition"
              >
                <RotateCcw className="w-4 h-4" /> Reset all
              </button>
            </div>
          )}
        </div>

        {/* Sticky submit bar */}
        {answeredCount >= 2 && !confirmed && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-gray-200 shadow-lg px-4 py-3 flex items-center justify-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{answeredCount} of {QUESTIONS.length} questions answered</span>
            <button
              onClick={handleConfirm}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-base px-8 py-3 rounded-2xl shadow-md transition-all hover:scale-105 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isComplete ? "See My Results" : "Find My Car"}
            </button>
          </div>
        )}

        {/* Results */}
        {answeredCount === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">Select your preferences above to see matches</p>
          </div>
        )}

        {confirmed && answeredCount >= 2 && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No exact matches</h2>
            <p className="text-gray-500 mb-4">Try relaxing your fuel type or style preference</p>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Reset filters
            </Button>
          </div>
        )}

        {confirmed && results.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isComplete ? "Your Top Picks" : "Best Matches So Far"}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    {results.length} car{results.length !== 1 ? "s" : ""}
                    {!isComplete && ` · ${QUESTIONS.length - answeredCount} filter${QUESTIONS.length - answeredCount !== 1 ? "s" : ""} left`}
                  </span>
                </h2>
                {!isComplete && (
                  <p className="text-sm text-gray-400 mt-0.5">Results will refine as you answer more questions</p>
                )}
              </div>
              {compareIds.length >= 2 && (
                <Link href={`/compare?ids=${compareIds.join(",")}`}>
                  <Button size="sm" className="gap-2">
                    <GitCompare className="w-4 h-4" /> Compare {compareIds.length}
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(({ car, score, reason }, i) => (
                <div key={car.id} className="relative">
                  {i === 0 && (
                    <div className="absolute -top-3 left-4 z-10 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                      🏆 Best Match
                    </div>
                  )}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="relative">
                      <img
                        src={car.image}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <MatchBadge score={score} size="md" />
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{car.brand}</p>
                      <h3 className="text-lg font-bold text-gray-900">{car.model} {car.year}</h3>
                      <p className="text-sm text-orange-500 font-medium mt-1">{reason}</p>
                      <p className="text-sm text-gray-500 mt-0.5">${car.basePrice.toLocaleString()} starting</p>

                      {magazineReviews[car.id]?.[0] && (
                        <div className="mt-3 bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-600">{magazineReviews[car.id][0].magazine}</span>
                            <span className="text-xs font-semibold text-amber-600">⭐ {magazineReviews[car.id][0].rating}</span>
                          </div>
                          <p className="text-xs text-gray-500 italic leading-relaxed">"{magazineReviews[car.id][0].quote}"</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-auto pt-4">
                        <Link href={`/cars/${car.id}`} className="flex-1">
                          <Button size="sm" className="w-full">View Details</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompare(car.id)}
                          className={compareIds.includes(car.id) ? "border-orange-500 text-orange-500" : ""}
                        >
                          <GitCompare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center mt-8">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Start over
              </Button>
              <Link href="/search">
                <Button variant="outline" className="gap-2">
                  <CarIcon className="w-4 h-4" /> Browse all cars
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
