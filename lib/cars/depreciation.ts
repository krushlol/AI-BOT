import { Car } from "./types"

export interface DepreciationData {
  dailyLoss: number
  yearlyLoss: number
  values: { year1: number; year3: number; year5: number }
  retentionPct5yr: number
  vsSegmentAvg: "better" | "average" | "worse"
  segmentAvgRetention: number
  fuelLabel: string
}

const SEGMENT_AVG = { year1: 0.20, year3: 0.37, year5: 0.48 }

function getRates(car: Car): { year1: number; year3: number; year5: number } {
  const isSports =
    ["Porsche", "Ferrari", "Lamborghini", "McLaren"].includes(car.brand) ||
    (car.bodyStyle === "coupe" && car.basePrice >= 60000)

  if (isSports) return { year1: 0.10, year3: 0.20, year5: 0.28 }

  if (car.fuelType === "electric") return { year1: 0.20, year3: 0.38, year5: 0.50 }
  if (car.fuelType === "hybrid") return { year1: 0.12, year3: 0.28, year5: 0.38 }
  if (car.fuelType === "plug-in hybrid") return { year1: 0.18, year3: 0.36, year5: 0.46 }

  // gasoline / diesel — split by body style and price tier
  const isLuxury = car.basePrice >= 60000
  if (isLuxury) return { year1: 0.22, year3: 0.42, year5: 0.55 }
  if (car.bodyStyle === "truck" || car.bodyStyle === "van") return { year1: 0.15, year3: 0.30, year5: 0.40 }
  if (car.bodyStyle === "suv") return { year1: 0.17, year3: 0.33, year5: 0.43 }
  return { year1: 0.20, year3: 0.38, year5: 0.49 }
}

function fuelLabel(car: Car): string {
  if (car.fuelType === "electric") return "electric"
  if (car.fuelType === "hybrid") return "hybrid"
  if (car.fuelType === "plug-in hybrid") return "plug-in hybrid"
  if (car.bodyStyle === "truck") return "truck"
  if (car.bodyStyle === "suv") return "SUV"
  return "gas"
}

export function computeDepreciation(car: Car): DepreciationData {
  const rates = getRates(car)
  const p = car.basePrice

  const yearlyLoss = p * rates.year1
  const dailyLoss = yearlyLoss / 365

  const year1 = Math.round(p * (1 - rates.year1))
  const year3 = Math.round(p * (1 - rates.year3))
  const year5 = Math.round(p * (1 - rates.year5))

  const retentionPct5yr = Math.round((1 - rates.year5) * 100)
  const segmentAvgRetention = Math.round((1 - SEGMENT_AVG.year5) * 100)

  const diff = retentionPct5yr - segmentAvgRetention
  const vsSegmentAvg: "better" | "average" | "worse" =
    diff >= 4 ? "better" : diff <= -4 ? "worse" : "average"

  return {
    dailyLoss,
    yearlyLoss,
    values: { year1, year3, year5 },
    retentionPct5yr,
    vsSegmentAvg,
    segmentAvgRetention,
    fuelLabel: fuelLabel(car),
  }
}
