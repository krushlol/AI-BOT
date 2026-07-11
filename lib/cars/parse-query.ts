import { MAINSTREAM_BRANDS } from "./nhtsa"

export interface ParsedCarQuery {
  make: string
  model: string
  year: number
}

// Longest brands first so "Mercedes-Benz" matches before "Mercedes"
const SORTED_BRANDS = [...MAINSTREAM_BRANDS].sort((a, b) => b.length - a.length)

export function parseLiveQuery(raw: string): ParsedCarQuery | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const yearMatch = trimmed.match(/\b(20[012]\d|199\d|198\d)\b/)
  // Default to previous year when no year specified — APIs (NHTSA, API Ninjas) have complete
  // data for completed model years but may lag on the current calendar year's models
  const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear() - 1
  const withoutYear = trimmed.replace(yearMatch?.[0] ?? "", "").trim().replace(/\s+/g, " ")

  if (!withoutYear) return null

  const withoutYearLower = withoutYear.toLowerCase()
  let make = ""
  let modelStr = ""

  // Try to match a known brand prefix (longest-first so "Mercedes-Benz" wins over "Mercedes")
  for (const brand of SORTED_BRANDS) {
    if (withoutYearLower.startsWith(brand.toLowerCase())) {
      make = brand
      modelStr = withoutYear.slice(brand.length).trim()
      break
    }
  }

  // No known brand matched — treat first word as make, rest as model
  if (!make) {
    const tokens = withoutYear.split(" ")
    make = tokens[0]
    modelStr = tokens.slice(1).join(" ")
  }

  return { make, model: modelStr, year }
}
