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
      `https://api.api-ninjas.com/v1/cars?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}&limit=1`,
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
  return {
    horsepower: r.horsepower ?? undefined,
    torque: r.torque ?? undefined,
    cylinders: r.cylinders ?? undefined,
    displacement: r.displacement ?? undefined,
    transmission: r.transmission ?? undefined,
    driveType: r.drive ?? undefined,
    mpgCity: r.city_mpg ?? undefined,
    mpgHighway: r.highway_mpg ?? undefined,
    mpgCombined: r.combination_mpg ?? undefined,
    fuelType: r.fuel_type ?? undefined,
    bodyClass: r.class ?? undefined,
    seating: r.seats ?? undefined,
  }
}
