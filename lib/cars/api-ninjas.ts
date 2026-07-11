import { LiveCarSpecs } from "./live-types"

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function fetchCarSpecs(
  make: string,
  model: string,
  year: number
): Promise<LiveCarSpecs | null> {
  // Try DB cache first (gracefully skip if DB unavailable)
  try {
    const { prisma } = await import("@/lib/prisma")
    const cached = await (prisma as any).cachedCarSpec?.findUnique({
      where: { make_model_year: { make, model, year } },
    })
    if (cached && Date.now() - new Date(cached.cachedAt).getTime() < CACHE_TTL_MS) {
      return parseNinjasData(cached.data as any[])
    }
  } catch {
    // DB unavailable — fall through to live fetch
  }

  const key = process.env.API_NINJAS_KEY
  if (!key) return null

  try {
    const res = await fetch(
      `https://api.api-ninjas.com/v1/cars?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`,
      { headers: { "X-Api-Key": key }, next: { revalidate: 604800 } }
    )
    if (!res.ok) return null
    const data: any[] = await res.json()
    if (!data.length) return null

    // Persist to DB cache (best-effort)
    try {
      const { prisma } = await import("@/lib/prisma")
      await (prisma as any).cachedCarSpec?.upsert({
        where: { make_model_year: { make, model, year } },
        create: { make, model, year, data },
        update: { data, cachedAt: new Date() },
      })
    } catch {
      // Ignore cache write failure
    }

    return parseNinjasData(data)
  } catch {
    return null
  }
}

function parseNinjasData(data: any[]): LiveCarSpecs | null {
  const r = data[0]
  if (!r) return null
  // Free-tier fields return "this field is for premium subscribers only" instead of a number
  const num = (v: any) => (typeof v === "number" ? v : undefined)
  const str = (v: any) => (typeof v === "string" && !v.includes("premium") ? v : undefined)
  return {
    horsepower: num(r.horsepower),
    torque: num(r.torque),
    cylinders: num(r.cylinders),
    displacement: num(r.displacement),
    transmission: (() => {
      const t = str(r.transmission)
      if (!t) return undefined
      const map: Record<string, string> = { a: "Automatic", m: "Manual", cvt: "CVT" }
      return map[t.toLowerCase()] ?? t
    })(),
    driveType: str(r.drive),
    mpgCity: num(r.city_mpg),
    mpgHighway: num(r.highway_mpg),
    mpgCombined: num(r.combination_mpg),
    fuelType: str(r.fuel_type),
    bodyClass: str(r.class),
    seating: num(r.seats),
  }
}
