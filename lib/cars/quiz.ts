import { Car } from "./types"

export type BudgetRange = "under35k" | "35to60k" | "60kplus"
export type KidsCount = "none" | "oneTwo" | "threePlus"
export type VehicleSize = "small" | "midsize" | "big"
export type UseCase = "commute" | "family" | "offroad" | "hauling"
export type FuelPref = "mpg" | "electric" | "hybrid" | "nopref"
export type StylePref = "suv" | "sedan" | "truck" | "nopref"
export type PetOwner = "yes" | "no"

export interface QuizAnswers {
  budget: BudgetRange
  kids: KidsCount
  size: VehicleSize
  useCase: UseCase
  fuel: FuelPref
  style: StylePref
  pets: PetOwner
}

// Luxury car IDs — filtered out when user has pets
const LUXURY_CAR_IDS = new Set([
  "porsche-taycan-2024",
  "lucid-air-2024",
  "genesis-gv80-2024",
  "mercedes-gle-2024",
  "bmw-3series-2024",
  "audi-q5-2024",
])

// Map budget to a max base price
function budgetToMax(budget: BudgetRange): number {
  if (budget === "under35k") return 35000
  if (budget === "35to60k") return 60000
  return Infinity
}

// Ideal seating based on kids
function kidsToMinSeating(kids: KidsCount): number {
  if (kids === "threePlus") return 7
  if (kids === "oneTwo") return 5
  return 2
}

/**
 * Hard filters — a car must pass ALL of these to appear in results.
 * These are non-negotiable requirements, not scoring bonuses.
 */
export function carPassesFilters(car: Car, answers: QuizAnswers): boolean {
  // 1. Budget — car must be within the selected budget
  const budget = budgetToMax(answers.budget)
  if (car.basePrice > budget) return false

  // 2. Seating — car must have enough seats for the family
  const minSeating = kidsToMinSeating(answers.kids)
  if (car.specs.seating < minSeating) return false

  // 3. Fuel — must be an exact match when user has a preference
  if (answers.fuel === "electric") {
    if (car.fuelType !== "electric") return false
  } else if (answers.fuel === "hybrid") {
    if (car.fuelType !== "hybrid" && car.fuelType !== "plug-in hybrid") return false
  } else if (answers.fuel === "mpg") {
    // Must get at least 28 MPG combined (gas or hybrid) or be a hybrid/PHEV
    const goodMpg = (car.specs.mpgCombined ?? 0) >= 28
    const isEfficient = car.fuelType === "hybrid" || car.fuelType === "plug-in hybrid" || car.fuelType === "electric"
    if (!goodMpg && !isEfficient) return false
  }

  // 4. Style — must match when user has a preference
  if (answers.style === "suv" && car.bodyStyle !== "suv") return false
  if (answers.style === "sedan" && car.bodyStyle !== "sedan" && car.bodyStyle !== "hatchback") return false
  if (answers.style === "truck" && car.bodyStyle !== "truck") return false

  // 5. Use case — hard gates for hauling and off-road
  if (answers.useCase === "hauling") {
    // Must be a truck or have meaningful towing capacity
    if (car.bodyStyle !== "truck" && (car.specs.towingCapacity ?? 0) < 3500) return false
  }
  if (answers.useCase === "offroad") {
    // Must be a truck, SUV, or known off-road model
    const offRoadOk = car.bodyStyle === "truck" || car.bodyStyle === "suv" ||
      car.id.includes("wrangler") || car.id.includes("rivian") || car.id.includes("outback")
    if (!offRoadOk) return false
  }

  // 6. Size — soft filter: small = no trucks/vans; big = no 2-seat coupes
  if (answers.size === "small" && (car.bodyStyle === "truck" || car.bodyStyle === "van")) return false
  if (answers.size === "big" && (car.bodyStyle === "coupe" || car.bodyStyle === "convertible")) return false

  // 7. Pets — exclude luxury cars (hard to clean, light-colored interiors, low cargo)
  if (answers.pets === "yes" && LUXURY_CAR_IDS.has(car.id)) return false

  return true
}

export function scoreCarForAnswers(car: Car, answers: QuizAnswers): number {
  let score = 0

  // --- Budget (20 pts) ---
  const budget = budgetToMax(answers.budget)
  if (car.basePrice <= budget) {
    score += 20
  } else if (car.basePrice <= budget * 1.15) {
    score += 10 // slightly over budget, partial credit
  }

  // --- Kids / Seating (15 pts) ---
  const minSeating = kidsToMinSeating(answers.kids)
  if (car.specs.seating >= minSeating) {
    score += 15
  } else if (car.specs.seating >= minSeating - 1) {
    score += 7
  }

  // --- Vehicle size (15 pts) ---
  const smallStyles = ["sedan", "hatchback", "coupe", "convertible"]
  const bigStyles = ["suv", "truck", "van"]
  if (answers.size === "small" && smallStyles.includes(car.bodyStyle)) score += 15
  else if (answers.size === "big" && bigStyles.includes(car.bodyStyle)) score += 15
  else if (answers.size === "midsize") score += 10 // midsize is flexible
  else score += 3

  // --- Use case (20 pts) ---
  if (answers.useCase === "commute") {
    // Efficiency matters most
    if (car.fuelType === "electric" || car.fuelType === "hybrid" || car.fuelType === "plug-in hybrid") score += 20
    else if ((car.specs.mpgCombined ?? 0) >= 30) score += 15
    else score += 8
  } else if (answers.useCase === "family") {
    if (car.specs.seating >= 7) score += 20
    else if (car.specs.seating >= 5 && parseInt(car.safety?.rating ?? "0") >= 4) score += 16
    else if (car.specs.seating >= 5) score += 12
    else score += 4
  } else if (answers.useCase === "offroad") {
    if (car.bodyStyle === "truck" || car.id.includes("wrangler") || car.id.includes("rivian") || car.id.includes("outback")) score += 20
    else if (car.bodyStyle === "suv" && car.specs.driveType?.includes("AWD")) score += 14
    else if (car.bodyStyle === "suv") score += 8
    else score += 2
  } else if (answers.useCase === "hauling") {
    if (car.bodyStyle === "truck") score += 20
    else if ((car.specs.towingCapacity ?? 0) >= 5000) score += 14
    else if (car.bodyStyle === "suv") score += 6
    else score += 2
  }

  // --- Fuel preference (15 pts) ---
  if (answers.fuel === "electric" && car.fuelType === "electric") score += 15
  else if (answers.fuel === "hybrid" && (car.fuelType === "hybrid" || car.fuelType === "plug-in hybrid")) score += 15
  else if (answers.fuel === "mpg" && (car.specs.mpgCombined ?? 0) >= 35) score += 15
  else if (answers.fuel === "mpg" && (car.specs.mpgCombined ?? 0) >= 28) score += 10
  else if (answers.fuel === "nopref") score += 10 // neutral — everyone gets partial
  else if (answers.fuel === "electric" && car.fuelType === "plug-in hybrid") score += 8
  else score += 3

  // --- Style preference (15 pts) ---
  if (answers.style === "nopref") {
    score += 10
  } else if (answers.style === "suv" && car.bodyStyle === "suv") {
    score += 15
  } else if (answers.style === "sedan" && (car.bodyStyle === "sedan" || car.bodyStyle === "hatchback")) {
    score += 15
  } else if (answers.style === "truck" && car.bodyStyle === "truck") {
    score += 15
  } else {
    score += 3
  }

  return Math.min(100, score)
}

export function getMatchLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Great Match", color: "green" }
  if (score >= 60) return { label: "Good Match", color: "yellow" }
  return { label: "Partial Match", color: "gray" }
}

export function getMatchReason(car: Car, answers: QuizAnswers): string {
  const reasons: string[] = []
  const budget = budgetToMax(answers.budget)
  if (car.basePrice <= budget) reasons.push(`Fits your budget`)
  if (answers.kids !== "none" && car.specs.seating >= kidsToMinSeating(answers.kids)) reasons.push(`${car.specs.seating} seats for your family`)
  if (answers.fuel === "electric" && car.fuelType === "electric") reasons.push("Fully electric")
  else if (answers.fuel === "hybrid" && (car.fuelType === "hybrid" || car.fuelType === "plug-in hybrid")) reasons.push("Hybrid efficiency")
  if (answers.useCase === "hauling" && car.bodyStyle === "truck") reasons.push("Built for hauling")
  if (answers.useCase === "offroad" && (car.bodyStyle === "truck" || car.id.includes("wrangler"))) reasons.push("Off-road capable")
  if (answers.useCase === "commute" && (car.fuelType === "electric" || car.fuelType === "hybrid")) reasons.push("Great for commuting")
  if (answers.pets === "yes") reasons.push("Pet-friendly interior")
  return reasons.slice(0, 3).join(" · ") || "Matches your preferences"
}
