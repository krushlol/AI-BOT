"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, RotateCcw, GitCompare, Car as CarIcon, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Navbar from "@/components/cars/navbar"
import CarCard from "@/components/cars/car-card"
import MatchBadge from "./match-badge"
import { Car } from "@/lib/cars/types"
import { QuizAnswers, scoreCarForAnswers, carPassesFilters, getMatchReason, BudgetRange, KidsCount, VehicleSize, UseCase, FuelPref, StylePref, PetOwner } from "@/lib/cars/quiz"
import { useQuizAnswers } from "@/hooks/useQuizAnswers"

interface QuizClientProps {
  user: { email?: string } | null
  allCars: Car[]
}

type StepOption = { value: string; label: string; description: string; emoji: string }

const STEPS: { key: keyof QuizAnswers; question: string; options: StepOption[] }[] = [
  {
    key: "budget",
    question: "What's your car budget?",
    options: [
      { value: "under35k", label: "Under $35k", description: "Great value options", emoji: "💰" },
      { value: "35to60k", label: "$35k – $60k", description: "Mid-range & near-luxury", emoji: "💳" },
      { value: "60kplus", label: "$60k+", description: "Premium & luxury", emoji: "🏆" },
    ],
  },
  {
    key: "kids",
    question: "Do you have kids?",
    options: [
      { value: "none", label: "No kids", description: "Just me (or me + partner)", emoji: "🙋" },
      { value: "oneTwo", label: "1 – 2 kids", description: "Need a back seat", emoji: "👶" },
      { value: "threePlus", label: "3+ kids", description: "Need lots of room", emoji: "👨‍👩‍👧‍👦" },
    ],
  },
  {
    key: "pets",
    question: "Do you have pets?",
    options: [
      { value: "no", label: "No pets", description: "Keep it clean and simple", emoji: "🧹" },
      { value: "yes", label: "Yes, I have pets", description: "Need easy-to-clean space", emoji: "🐾" },
    ],
  },
  {
    key: "size",
    question: "How big of a car do you want?",
    options: [
      { value: "small", label: "Small", description: "Easy to park & fuel-efficient", emoji: "🚗" },
      { value: "midsize", label: "Mid-size", description: "Best of both worlds", emoji: "🚙" },
      { value: "big", label: "Big & roomy", description: "Max space & capability", emoji: "🛻" },
    ],
  },
  {
    key: "useCase",
    question: "How do you mainly use your car?",
    options: [
      { value: "commute", label: "Daily commute", description: "City driving & efficiency", emoji: "🏙" },
      { value: "family", label: "Family trips", description: "Safety & comfort first", emoji: "🗺" },
      { value: "offroad", label: "Off-road / adventure", description: "Trails and rough terrain", emoji: "🏔" },
      { value: "hauling", label: "Hauling / towing", description: "Heavy loads & trailers", emoji: "⚙️" },
    ],
  },
  {
    key: "fuel",
    question: "Any fuel preference?",
    options: [
      { value: "mpg", label: "Best MPG", description: "Maximize fuel savings", emoji: "⛽" },
      { value: "electric", label: "Going electric", description: "Zero emissions, no gas", emoji: "⚡" },
      { value: "hybrid", label: "Hybrid", description: "Best of gas + electric", emoji: "🌿" },
      { value: "nopref", label: "No preference", description: "Show me everything", emoji: "🤷" },
    ],
  },
  {
    key: "style",
    question: "Preferred vehicle style?",
    options: [
      { value: "suv", label: "SUV / Crossover", description: "High ride, versatile", emoji: "🚐" },
      { value: "sedan", label: "Sedan / Hatchback", description: "Sleek and efficient", emoji: "🚗" },
      { value: "truck", label: "Truck", description: "Rugged and capable", emoji: "🛻" },
      { value: "nopref", label: "No preference", description: "Surprise me!", emoji: "🎲" },
    ],
  },
]

export default function QuizClient({ user, allCars }: QuizClientProps) {
  const [step, setStep] = useState(0) // 0-5 = questions, 6 = results
  const [partial, setPartial] = useState<Partial<QuizAnswers>>({})
  const { saveAnswers, clearAnswers } = useQuizAnswers()
  const [results, setResults] = useState<{ car: Car; score: number; reason: string }[]>([])
  const [compareIds, setCompareIds] = useState<string[]>([])
  const router = useRouter()

  const currentStep = STEPS[step]
  const selectedValue = currentStep ? partial[currentStep.key] : undefined
  const progress = ((step) / STEPS.length) * 100

  const handleSelect = (value: string) => {
    const updated = { ...partial, [STEPS[step].key]: value }
    setPartial(updated)

    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(step + 1), 180)
    } else {
      // Final step — compute results
      const answers = updated as QuizAnswers
      saveAnswers(answers)
      const scored = allCars
        .filter((car) => carPassesFilters(car, answers))
        .map((car) => ({
          car,
          score: scoreCarForAnswers(car, answers),
          reason: getMatchReason(car, answers),
        }))
        .sort((a, b) => b.score - a.score)
      setResults(scored)
      setTimeout(() => setStep(STEPS.length), 180)
    }
  }

  const handleRetake = () => {
    clearAnswers()
    setPartial({})
    setResults([])
    setStep(0)
  }

  const handleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  // Results screen
  if (step === STEPS.length) {
    const noResults = results.length === 0
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {noResults ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-6">🔍</div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-3">No exact matches found</h1>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                None of our curated cars check every box for your answers. Try adjusting a preference — like fuel type or style — to see more options.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleRetake} className="gap-2">
                  <RotateCcw className="w-4 h-4" /> Retake Quiz
                </Button>
                <Link href="/search">
                  <Button variant="outline" className="gap-2">
                    <CarIcon className="w-4 h-4" /> Browse All Cars
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
          <>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <CheckCircle2 className="w-4 h-4" /> {results.length} car{results.length !== 1 ? "s" : ""} match your needs
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Your Top Car Picks</h1>
            <p className="text-gray-500 text-lg">Every result below meets all your requirements</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {results.map(({ car, score, reason }, i) => (
              <div key={car.id} className="relative">
                {i === 0 && (
                  <div className="absolute -top-3 left-4 z-10 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    🏆 Best Match
                  </div>
                )}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img
                      src={car.image}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <MatchBadge score={score} size="md" />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{car.brand}</p>
                    <h3 className="text-lg font-bold text-gray-900">{car.model} {car.year}</h3>
                    <p className="text-sm text-blue-600 font-medium mt-1">{reason}</p>
                    <p className="text-sm text-gray-500 mt-1">${car.basePrice.toLocaleString()} starting</p>
                    <div className="flex gap-2 mt-4">
                      <Link href={`/cars/${car.id}`} className="flex-1">
                        <Button size="sm" className="w-full">View Details</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompare(car.id)}
                        className={compareIds.includes(car.id) ? "border-blue-500 text-blue-600" : ""}
                      >
                        <GitCompare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={handleRetake} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Retake Quiz
            </Button>
            {compareIds.length >= 2 && (
              <Link href={`/compare?ids=${compareIds.join(",")}`}>
                <Button className="gap-2">
                  <GitCompare className="w-4 h-4" /> Compare {compareIds.length} Cars
                </Button>
              </Link>
            )}
            <Link href="/search">
              <Button variant="outline" className="gap-2">
                <CarIcon className="w-4 h-4" /> Browse All Cars
              </Button>
            </Link>
          </div>
          </>
          )}
        </div>
      </div>
    )
  }

  // Quiz step screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex flex-col">
      <Navbar user={user} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* Progress bar */}
        <div className="w-full max-w-xl mb-8">
          <div className="flex items-center justify-between text-blue-200 text-xs mb-2">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-blue-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="w-full max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-8">
            {currentStep.question}
          </h2>

          <div className="grid gap-3">
            {currentStep.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left ${
                  selectedValue === opt.value
                    ? "border-white bg-white text-blue-900"
                    : "border-blue-600/60 bg-blue-800/40 text-white hover:border-white hover:bg-blue-700/60"
                }`}
              >
                <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                <div>
                  <p className="font-semibold">{opt.label}</p>
                  <p className={`text-sm ${selectedValue === opt.value ? "text-blue-600" : "text-blue-200"}`}>
                    {opt.description}
                  </p>
                </div>
                {selectedValue === opt.value && (
                  <CheckCircle2 className="w-5 h-5 ml-auto flex-shrink-0 text-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Back button */}
          {step > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setStep(step - 1)}
                className="text-blue-200 hover:text-white text-sm flex items-center gap-1 mx-auto"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
