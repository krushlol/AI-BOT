import { Car } from "./types"

export interface CarAdvisorScore {
  score: number
  label: string
  emoji: string
  color: string         // tailwind text color
  bgColor: string       // tailwind bg color
  borderColor: string   // tailwind border color
  reason: string
}

export function computeCarAdvisorScore(car: Car): CarAdvisorScore {
  // Safety (max 2.0)
  const ratingStr = car.safety?.rating?.toLowerCase() ?? ""
  const safetySc =
    ratingStr.includes("top safety pick+") ? 2.0 :
    ratingStr.includes("top safety pick") ? 1.5 :
    ratingStr.includes("5") ? 1.5 :
    ratingStr.length > 0 ? 0.5 : 0

  // Pros vs Cons (max 2.0)
  const prosConsSc = Math.min(Math.max(((car.pros?.length ?? 0) - (car.cons?.length ?? 0) + 4) / 4 * 2, 0), 2)

  // Efficiency (max 2.0)
  let effSc = 0
  if (car.fuelType === "electric") {
    effSc = Math.min((car.specs.electricRange ?? 0) / 400 * 2, 2)
  } else if (car.fuelType === "hybrid") {
    effSc = Math.min((car.specs.mpgCombined ?? 0) / 70 * 2, 2)
  } else if (car.fuelType === "plug-in hybrid") {
    effSc = 1.5
  } else {
    effSc = Math.min((car.specs.mpgCombined ?? 0) / 60 * 2, 2)
  }

  // Freshness (max 1.5)
  const freshSc =
    car.year >= 2024 ? 1.5 :
    car.year >= 2022 ? 1.0 :
    car.year >= 2020 ? 0.5 : 0

  // Value — horsepower per dollar (max 1.5)
  const hpPerDollar = (car.specs.horsepower ?? 0) / (car.basePrice / 10000)
  const valueSc = Math.min(hpPerDollar / 50, 1) * 1.5

  // Cool factor (max 1.0)
  const coolSc = (car.coolFeatures?.length ?? 0) >= 3 ? 1.0 : (car.coolFeatures?.length ?? 0) >= 1 ? 0.5 : 0

  const total = safetySc + prosConsSc + effSc + freshSc + valueSc + coolSc
  const score = Math.round(Math.min(total, 10) * 10) / 10

  // Verdict
  let label: string
  let emoji: string
  let color: string
  let bgColor: string
  let borderColor: string
  if (score >= 8.5) {
    label = "Best in Class"; emoji = "🏆"
    color = "text-green-700"; bgColor = "bg-green-50"; borderColor = "border-green-200"
  } else if (score >= 7.0) {
    label = "Highly Recommended"; emoji = "✅"
    color = "text-orange-600"; bgColor = "bg-orange-50"; borderColor = "border-orange-200"
  } else if (score >= 5.5) {
    label = "Solid Choice"; emoji = "👍"
    color = "text-blue-600"; bgColor = "bg-blue-50"; borderColor = "border-blue-200"
  } else {
    label = "Consider Alternatives"; emoji = "⚠️"
    color = "text-gray-600"; bgColor = "bg-gray-50"; borderColor = "border-gray-200"
  }

  // Reason — pick the most interesting thing about this car
  let reason: string
  if (safetySc === 2.0) {
    reason = "One of the safest cars on sale — IIHS Top Safety Pick+."
  } else if (effSc >= 1.8 && car.fuelType === "electric") {
    reason = `${car.specs.electricRange} miles of range makes this one of the longest-running EVs available.`
  } else if (effSc >= 1.6 && car.fuelType === "hybrid") {
    reason = `${car.specs.mpgCombined} MPG combined is class-leading efficiency for a hybrid.`
  } else if (valueSc >= 1.3) {
    reason = `${car.specs.horsepower} hp starting at $${car.basePrice.toLocaleString()} is exceptional value.`
  } else if (freshSc === 1.5 && (car.pros?.length ?? 0) >= 4) {
    reason = `Fresh ${car.year} model with strong across-the-board performance.`
  } else if (car.pros?.[0]) {
    reason = car.pros[0] + (car.pros[0].endsWith(".") ? "" : ".")
  } else {
    reason = car.tagline + "."
  }

  return { score, label, emoji, color, bgColor, borderColor, reason }
}
