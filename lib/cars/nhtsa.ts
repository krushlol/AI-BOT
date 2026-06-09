import { LiveCar } from "./live-types"

export const MAINSTREAM_BRANDS = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW",
  "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ferrari",
  "Fiat", "Ford", "Genesis", "GMC", "Honda", "Hyundai", "Infiniti",
  "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus",
  "Lincoln", "Lotus", "Lucid", "Maserati", "Mazda", "McLaren",
  "Mercedes-Benz", "MINI", "Mitsubishi", "Nissan", "Polestar",
  "Porsche", "Ram", "Rivian", "Rolls-Royce", "Subaru", "Tesla",
  "Toyota", "Volkswagen", "Volvo",
]

const VPIC_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles"
const SAFETY_BASE = "https://api.nhtsa.gov/SafetyRatings"

export async function fetchNHTSAModels(make: string, year: number): Promise<LiveCar[]> {
  try {
    const res = await fetch(
      `${VPIC_BASE}/getmodelsformakeyear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    const results: { Make_Name: string; Model_Name: string }[] = json.Results ?? []

    return results.map((r) => ({
      id: `live-${make.toLowerCase().replace(/\s+/g, "-")}-${r.Model_Name.toLowerCase().replace(/\s+/g, "-")}-${year}`,
      brand: r.Make_Name,
      model: r.Model_Name,
      year,
      isLive: true as const,
    }))
  } catch {
    return []
  }
}

export interface NHTSASafetyResult {
  overallRating?: number
  frontCrashRating?: number
  sideCrashRating?: number
  rolloverRating?: number
  complaintsCount?: number
  recallsCount?: number
  hasESC?: boolean
  hasFCW?: boolean
  hasLDW?: boolean
  nhtsaVehicleId?: string
}

export async function fetchNHTSASafetyRatings(
  make: string,
  model: string,
  year: number
): Promise<NHTSASafetyResult | null> {
  try {
    // First get the list of vehicles for this make/model/year
    const listRes = await fetch(
      `${SAFETY_BASE}/modelyear/${year}/make/${encodeURIComponent(make)}/model/${encodeURIComponent(model)}`,
      { next: { revalidate: 86400 } }
    )
    if (!listRes.ok) return null
    const listJson = await listRes.json()
    const vehicles: { VehicleId: number }[] = listJson.Results ?? []
    if (vehicles.length === 0) return null

    // Fetch ratings for the first vehicle variant
    const vehicleId = vehicles[0].VehicleId
    const ratingRes = await fetch(
      `${SAFETY_BASE}/VehicleId/${vehicleId}`,
      { next: { revalidate: 86400 } }
    )
    if (!ratingRes.ok) return null
    const ratingJson = await ratingRes.json()
    const r = ratingJson.Results?.[0]
    if (!r) return null

    const toStars = (v: string | number | undefined) => {
      const n = typeof v === "string" ? parseInt(v) : v
      return n && !isNaN(n) ? n : undefined
    }

    return {
      overallRating: toStars(r.OverallRating),
      frontCrashRating: toStars(r.FrontCrashRating),
      sideCrashRating: toStars(r.SideCrashRating),
      rolloverRating: toStars(r.RolloverRating),
      complaintsCount: r.ComplaintsCount ?? undefined,
      recallsCount: r.RecallsCount ?? undefined,
      hasESC: r.NHTSAElectronicStabilityControl === "Standard",
      hasFCW: r.NHTSAForwardCollisionWarning === "Standard",
      hasLDW: r.NHTSALaneDepartureWarning === "Standard",
      nhtsaVehicleId: String(vehicleId),
    }
  } catch {
    return null
  }
}
