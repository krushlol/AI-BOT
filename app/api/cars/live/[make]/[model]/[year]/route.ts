import { NextRequest, NextResponse } from "next/server"
import { fetchCarSpecs } from "@/lib/cars/api-ninjas"
import { fetchNHTSASafetyRatings } from "@/lib/cars/nhtsa"
import { fetchEPASpecs } from "@/lib/cars/epa-fuel-economy"

interface Params {
  make: string
  model: string
  year: string
}

// Capitalize each word: "toyota" → "Toyota", "model-3" → "Model 3"
function titleCase(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const make = titleCase(params.make)
  const model = titleCase(params.model)
  const year = params.year
  const yearNum = parseInt(year)

  const [ninjasSpecs, safety, epaSpecs] = await Promise.all([
    fetchCarSpecs(make, model, yearNum),
    fetchNHTSASafetyRatings(make, model, yearNum),
    fetchEPASpecs(make, model, yearNum),
  ])

  // Merge: API Ninjas fields take priority (has HP/torque when premium);
  // EPA fills in MPG, drive type, fuel type, etc. when Ninjas returns null.
  const specs = (ninjasSpecs || epaSpecs)
    ? {
        ...epaSpecs,
        ...Object.fromEntries(
          Object.entries(ninjasSpecs ?? {}).filter(([, v]) => v !== undefined && v !== null)
        ),
      }
    : undefined

  return NextResponse.json({
    id: `live-${make.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, "-")}-${year}`,
    brand: make,
    model,
    year: yearNum,
    isLive: true,
    specs: specs ?? undefined,
    safety: safety ?? undefined,
  })
}
